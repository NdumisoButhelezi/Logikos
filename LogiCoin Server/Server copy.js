import express from 'express';
import bodyParser from 'body-parser';
import { createAuthenticatedClient, OpenPaymentsClientError, isFinalizedGrant } from "@interledger/open-payments";
import readline from "readline/promises";
import { readFileSync } from "fs";
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const receiverWalletAddressUrl = "https://ilp.interledger-test.dev/zulu";

app.post('/scan-to-pay', (req, res) => {

  const senderWalletAddressUrl = req.body.senderWallet;
  const keyId = req.body.keyId;
  const amount = req.body.amount;
  const privateKey = req.body.privateKey;

  (async () => {

    const client = await createAuthenticatedClient({
      walletAddressUrl: senderWalletAddressUrl,
      keyId: keyId,
      privateKey: privateKey,
    });

    const sendingWalletAddress = await client.walletAddress.get({
      url: senderWalletAddressUrl,
    });
    const receivingWalletAddress = await client.walletAddress.get({
      url: receiverWalletAddressUrl,
    });


    console.log(
      "Got wallet addresses. We will set up a payment between the sending and the receiving wallet address",
      { receivingWalletAddress, sendingWalletAddress }
    );

    // Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
    const incomingPaymentGrant = await client.grant.request(
      {
        url: receivingWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["read", "complete", "create"],
            },
          ],
        },
      }
    );

    console.log(
      "\nStep 1: got incoming payment grant for receiving wallet address",
      incomingPaymentGrant
    );

    // Step 2: Create the incoming payment. This will be where funds will be received.
    const incomingPayment = await client.incomingPayment.create(
      {
        url: receivingWalletAddress.resourceServer,
        accessToken: incomingPaymentGrant.access_token.value,
      },
      // myVal * 10 ** scale
      {
        walletAddress: receivingWalletAddress.id,
        incomingAmount: {
          assetCode: receivingWalletAddress.assetCode,
          assetScale: receivingWalletAddress.assetScale,
          value: (amount * 10 ** receivingWalletAddress.assetScale).toString(),
        },
      } 
    );

    console.log(
      "\nStep 2: created incoming payment on receiving wallet address",
      incomingPayment
    );

    // Step 3: Get a quote grant, so we can create a quote on the sending wallet address
    const quoteGrant = await client.grant.request(
      {
        url: sendingWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"],
            },
          ],
        },
      }
    );

    console.log(
      "\nStep 3: got quote grant on sending wallet address",
      quoteGrant
    );

    // Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
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

    console.log("\nStep 4: got quote on sending wallet address", quote);

    const outgoingPaymentGrant = await client.grant.request(
      {
        url: sendingWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["create"],
              limits: {
                debitAmount: quote.debitAmount,
              },
              identifier: sendingWalletAddress.id,
            },
          ],
        },
        interact: {
          start: ["redirect"],
        },
      }
    );
  
    console.log(
      "\nStep 5: got pending outgoing payment grant",
      outgoingPaymentGrant
    );
    console.log(
      "Please navigate to the following URL, to accept the interaction from the sending wallet:"
    );
    console.log(outgoingPaymentGrant.interact.redirect);

    setTimeout(() => {
      
      finalizePayment(client , sendingWalletAddress , quote , outgoingPaymentGrant)
    }, 10000);
  
    res.json({ message: `${outgoingPaymentGrant.interact.redirect}` });

  })();

});

app.post('/get-qoute', (req, res) => {

  const senderWalletAddressUrl = req.body.senderWallet;
  const keyId = req.body.keyId;
  const receiverWalletAddressUrl = "https://ilp.interledger-test.dev/mandem";
  const amount = req.body.amount;
  const privateKey = req.body.privateKey;

  (async () => {

    const client = await createAuthenticatedClient({
      walletAddressUrl: senderWalletAddressUrl,
      keyId: keyId,
      privateKey: privateKey,
    });

    const sendingWalletAddress = await client.walletAddress.get({
      url: senderWalletAddressUrl,
    });
    const receivingWalletAddress = await client.walletAddress.get({
      url: receiverWalletAddressUrl,
    });


    console.log(
      "Got wallet addresses. We will set up a payment between the sending and the receiving wallet address",
      { receivingWalletAddress, sendingWalletAddress }
    );

    // Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
    const incomingPaymentGrant = await client.grant.request(
      {
        url: receivingWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["read", "complete", "create"],
            },
          ],
        },
      }
    );

    console.log(
      "\nStep 1: got incoming payment grant for receiving wallet address",
      incomingPaymentGrant
    );

    // Step 2: Create the incoming payment. This will be where funds will be received.
    const incomingPayment = await client.incomingPayment.create(
      {
        url: receivingWalletAddress.resourceServer,
        accessToken: incomingPaymentGrant.access_token.value,
      },
      {
        walletAddress: receivingWalletAddress.id,
        incomingAmount: {
          assetCode: receivingWalletAddress.assetCode,
          assetScale: receivingWalletAddress.assetScale,
          value: amount,
        },
      }
    );

    console.log(
      "\nStep 2: created incoming payment on receiving wallet address",
      incomingPayment
    );

    // Step 3: Get a quote grant, so we can create a quote on the sending wallet address
    const quoteGrant = await client.grant.request(
      {
        url: sendingWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"],
            },
          ],
        },
      }
    );

    console.log(
      "\nStep 3: got quote grant on sending wallet address",
      quoteGrant
    );

    // Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
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

    console.log("\nStep 4: got quote on sending wallet address", quote);

    const outgoingPaymentGrant = await client.grant.request(
      {
        url: sendingWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["create"],
              limits: {
                debitAmount: quote.debitAmount,
              },
              identifier: sendingWalletAddress.id,
            },
          ],
        },
        interact: {
          start: ["redirect"],
        },
      }
    );
  
    console.log(
      "\nStep 5: got pending outgoing payment grant",
      outgoingPaymentGrant
    );
    console.log(
      "Please navigate to the following URL, to accept the interaction from the sending wallet:"
    );
    console.log(outgoingPaymentGrant.interact.redirect);

  })();

});


async function finalizePayment(client , sendingWalletAddress , quote , outgoingPaymentGrant) {

  let finalizedOutgoingPaymentGrant;

  const grantContinuationErrorMessage =
    "\nThere was an error continuing the grant. You probably have not accepted the grant at the url (or it has already been used up, in which case, rerun the script).";

  try {
    finalizedOutgoingPaymentGrant = await client.grant.continue({
      url: outgoingPaymentGrant.continue.uri,
      accessToken: outgoingPaymentGrant.continue.access_token.value,
    });
  } catch (err) {
    if (err instanceof OpenPaymentsClientError) {
      console.log(grantContinuationErrorMessage);
      
    }

    throw err;
  }

  if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
    console.log(
      "There was an error continuing the grant. You probably have not accepted the grant at the url."
    );
    
  }

  console.log(
    "\nStep 6: got finalized outgoing payment grant",
    finalizedOutgoingPaymentGrant
  );

  // Step 7: Finally, create the outgoing payment on the sending wallet address.
  // This will make a payment from the outgoing payment to the incoming one (over ILP)
  try {
    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: sendingWalletAddress.resourceServer,
        accessToken: finalizedOutgoingPaymentGrant.access_token.value,
      },
      {
        walletAddress: sendingWalletAddress.id,
        quoteId: quote.id,
      }
    );

    console.log(
      "\nStep 7: Created outgoing payment. Funds will now move from the outgoing payment to the incoming payment.",
      outgoingPayment
    );
  } catch (error) {
    console.log("User Did Not Accept Payment")
  }
 

 

}


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});