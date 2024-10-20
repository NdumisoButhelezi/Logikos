# LogiCoin Pay App

## Overview

**LogiCoin Pay** is a .... payment app that enables users to buy products on an e-commerce site using Open Payments Api. The system is divided into three parts:

1. **E-commerce Site**: Users can browse products and initiate purchases.
2. **LogiCoin Pay App**: Handles transactions for purchases made on the e-commerce platform.
3. **LogiCoin Server**: For handling transactions and tracking transactions.

This guide provides instructions on how to run the LogiCoin Pay App.

---

## Prerequisites

To run the LogiCoin Pay App and the associated e-commerce site, you will need the following installed on your machine:

1. **Node.js** (for the front-end and server)
2. **Interleger Payments Wallet** (for transactions)

---

## Installation

### 1. Clone the Repository

Start by cloning the project repository from GitHub:

```bash
git clone https://github.com/NdumisoButhelezi/Logikos.git
```

### 2. Run the Server

The next step is to run the LogiCoin Server.

```bash
cd LogiCoin_Server
npm install
node Server.js
```

Output

```bash
Server is running on http://192.168.152.145:3000.
````

Keep the ip adress safe on your Clipboard history becouse it will be cruial for the next part.

### 3. Setup the Logicoin Pay App

The next step is to set up the LogiCoin Pay app .