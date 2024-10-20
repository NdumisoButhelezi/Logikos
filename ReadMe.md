# LogiCoin Pay App

## Overview

**LogiCoin Pay** is a payment app that enables users to buy products on an e-commerce site using the Open Payments API. The system is divided into three parts:

1. **E-commerce Site**: Users can browse products and initiate purchases.
2. **LogiCoin Pay App**: Handles transactions for purchases made on the e-commerce platform.
3. **LogiCoin Server**: Manages transactions and tracks their status.

This guide provides instructions on how to run the LogiCoin Pay App.

---

## Prerequisites

To run the LogiCoin Pay App and the associated e-commerce site, ensure you have the following installed on your machine:

1. **Node.js** (for the front-end and server)
2. **Interleger Payments Wallet** (for handling transactions)

---

## Installation

### 1. Clone the Repository

Start by cloning the project repository from GitHub:

```
git clone https://github.com/NdumisoButhelezi/Logikos.git
```

### 2. Run the Server

The next step is to run the LogiCoin Server.

```
cd LogiCoin_Server
npm install
node Server.js
```

Once the server is running, you should see the following output:

```
Server is running on http://192.168.152.145:3000.
```

Make sure to keep this IP address safe in your clipboard history, as it will be crucial for the next steps.

### 3. Set Up the LogiCoin Pay App

Now, proceed to set up the LogiCoin Pay App, which will be responsible for managing transactions initiated on the e-commerce platform.

---

## Dev - Still in Progress

### **TigerBeetle Integration and OpenAI**

- **TigerBeetle** is a fast and reliable system designed for processing financial transactions with high accuracy. It manages ledgers and ensures that transaction data is correctly recorded and processed in real time.

- In our system, TigerBeetle will handle all transactions, ensuring they are processed efficiently. Additionally, the plan is to take snapshots of the data processed by TigerBeetle and integrate it with **OpenAI** for AI-driven transactional analytics. This integration will allow us to analyze transaction patterns, predict trends, and detect potential fraud, providing valuable insights and optimizing our payment system.

