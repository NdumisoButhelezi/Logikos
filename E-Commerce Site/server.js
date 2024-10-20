import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAuthenticatedClient, isFinalizedGrant } from "@interledger/open-payments";
import fs from 'fs';
import { createAuthenticatedClient } from "@interledger/open-payments";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Interledger credentials
const PRIVATE_KEY_PATH = 'Zuluprivate.key';
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
const KEY_ID = '2bb2127f-535e-4d08-89ec-09f9955a6d78';
const WALLET_ADDRESS = 'https://ilp.interledger-test.dev/zulu'; // Sender's wallet address

async function setupClient() {
  try {
    const client = await createAuthenticatedClient({
      walletAddressUrl: WALLET_ADDRESS,
      privateKey: privateKey,
      keyId: KEY_ID,
    });

    console.log('Open Payments client created');
    return client;
  } catch (error) {
    console.error('Error creating Open Payments client:', error);
  }
}

setupClient();

// Store manager's payment pointer
let storePaymentPointer = '$ilp.interledger-test.dev/mandem'; // Correct receiver pointer

// Serve static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'manager.html'));
});

// QR Code generation endpoint
app.post('/generate-qr', async (req, res) => {
  try {
    const { product, price } = req.body;
    if (!product || !price) {
      return res.status(400).send('Product and Price are required');
    }

    const qrData = JSON.stringify({
      product: product,
      price: price,
      pointer: storePaymentPointer // Use the store's payment pointer
    });

    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1
    });

    res.setHeader('Content-Disposition', 'attachment; filename=qrcode.png');
    res.type('image/png').send(qrCodeBuffer);
  } catch (err) {
    console.error('Error generating QR code:', err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Open Payments purchase endpoint
app.post('/api/open-payments-purchase', async (req, res) => {
  try {
    const { productName, price, paymentPointer, userCurrency } = req.body;
    console.log(`Received Open Payments purchase request for ${productName} at ${price} ${userCurrency} from ${paymentPointer}`);

    const receivingWalletAddress = await client.walletAddress.get({
      url: storePaymentPointer.replace('$', 'https://ilp.interledger-test.dev/rio'),
    });

    const sendingWalletAddress = await client.walletAddress.get({
      url: paymentPointer.replace('$', 'https://ilp.interledger-test.dev/zulu'),
    });

    // Step 1: Get a grant for the incoming payment
    const incomingPaymentGrant = await client.grant.request(
      { url: receivingWalletAddress.authServer },
      {
        access_token: {
          access: [{ type: "incoming-payment", actions: ["read", "complete", "create"] }],
        },
      }
    );

    // Step 2: Create the incoming payment
    const incomingPayment = await client.incomingPayment.create(
      {
        url: receivingWalletAddress.resourceServer,
        accessToken: incomingPaymentGrant.access_token.value,
      },
      {
        walletAddress: receivingWalletAddress.id,
        incomingAmount: {
          assetCode: userCurrency,
          assetScale: 2,
          value: price.toString(),
        },
      }
    );

    // Step 3: Get a quote grant
    const quoteGrant = await client.grant.request(
      { url: sendingWalletAddress.authServer },
      {
        access_token: {
          access: [{ type: "quote", actions: ["create", "read"] }],
        },
      }
    );

    // Step 4: Create a quote
    const quote = await client.quote.create(
      {
        url: sendingWalletAddress.resourceServer,
        accessToken: quoteGrant.access_token.value,
      },
      {
        walletAddress: sendingWalletAddress.id,
        receiver: incomingPayment.id,
        method: "ilp",
      }
    );

    // Step 5: Start the grant process for the outgoing payment
    const outgoingPaymentGrant = await client.grant.request(
      { url: sendingWalletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["read", "create"],
              limits: {
                debitAmount: {
                  assetCode: quote.debitAmount.assetCode,
                  assetScale: quote.debitAmount.assetScale,
                  value: quote.debitAmount.value,
                },
              },
              identifier: sendingWalletAddress.id,
            },
          ],
        },
        interact: { start: ["redirect"] },
      }
    );

    res.json({
      success: true,
      message: 'Grant process initiated',
      grantUrl: outgoingPaymentGrant.interact.redirect,
      continueUri: outgoingPaymentGrant.continue.uri,
      continueToken: outgoingPaymentGrant.continue.access_token.value,
      quoteId: quote.id,
    });

  } catch (error) {
    console.error('Error processing Open Payments purchase:', error);
    res.status(500).json({ success: false, message: 'Error processing purchase' });
  }
});

// Endpoint to finalize the payment after user interaction
app.post('/api/finalize-payment', async (req, res) => {
  try {
    const { continueUri, continueToken, quoteId, sendingWalletAddress } = req.body;

    const finalizedGrant = await client.grant.continue({
      url: continueUri,
      accessToken: continueToken,
    });

    if (!isFinalizedGrant(finalizedGrant)) {
      throw new Error('Grant not finalized');
    }

    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: sendingWalletAddress,
        accessToken: finalizedGrant.access_token.value,
      },
      {
        walletAddress: sendingWalletAddress,
        quoteId: quoteId,
      }
    );

    res.json({
      success: true,
      message: 'Payment finalized',
      paymentDetails: outgoingPayment,
    });

  } catch (error) {
    console.error('Error finalizing payment:', error);
    res.status(500).json({ success: false, message: 'Error finalizing payment' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
