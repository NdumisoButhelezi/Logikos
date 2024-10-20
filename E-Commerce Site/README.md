# Bike Shop Web Application

This project is a e-cormercesite for a bike shop that uses open payment API for payment processes, featuring a responsive frontend design, Web Monetization integration, and a Node.js backend with TigerBeetle for transaction management and a WalletManager for handling digital wallets.

## Features

- Responsive frontend design for various screen sizes
- Product showcase with images and prices
- "Scan to pay" functionality for each product
- Web Monetization integration for payments
- Modal for country selection and payment pointer input
- Backend API for handling transactions and currency conversion
- Integration with TigerBeetle for robust transaction management
- WalletManager for digital wallet operations
- Auth0 integration for user authentication (optional)

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Axios for API requests
- Web Monetization API(not complete)

### Backend
- Node.js
- Express.js
- TigerBeetle for transaction management
- Crypto for generating random IDs (not comlete)
- Axios for API requests to Open Payments API
- Auth0 for authentication (optional)
- dotenv for environment variable management

## Components

### WalletManager

The `WalletManager` class is responsible for managing digital wallets and transactions. It provides the following functionality:

- Creating or retrieving user wallets
- Generating payment pointers
- Creating pending transactions
- Finalizing transactions
- Verifying payments

## Setup

1. Clone the repository to your local machine.
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     AUTH0_SECRET=your_auth0_secret
     EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
     OPEN_PAYMENTS_API_URL=https://open-payments-api.example.com
     ```
4. Start the server:
   ```
   node server.js
   ```
5. Open `http://localhost:3000` in your web browser to view the application.

## Web Monetization

This project uses Web Monetization for payments. To enable Web Monetization:

1. Ensure you have a Web Monetization provider account.
2. Replace the content of the `monetization` meta tag in the HTML head with your payment pointer.


## API Endpoints (Subaject to Change)

- POST `/api/web-monetization`: Handle Web Monetization transactions
- POST `/api/store-manager-settings`: Update store manager settings
- GET `/api/convert-currency`: Convert currency amounts

## TigerBeetle Integration

The application uses TigerBeetle for managing transactions. Ensure TigerBeetle is properly set up and running on your system.

## Auth0 Integration

Auth0 is used for user authentication. To enable:

1. Set up an Auth0 account and application
2. Add the `AUTH0_SECRET` to your `.env` file
3. Update the Auth0 configuration in `server.js` with your application details

## Feedback

Looking forward for the Feedback.



##  Logikoin 

Group 20 
