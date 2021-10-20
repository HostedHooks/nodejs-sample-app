# A HostedHooks Sample app using Nodejs (Expressjs)

This example app shows how to integrate [HostedHooks](https://www.hostedhooks.com) with a Nodejs application to send webhooks when events are triggered.

### Related examples

- [To-Do app using Nextjs](https://github.com/HostedHooks/nextjs-sample-app)

## How to use

```bash
# clone the repo
git clone https://github.com/HostedHooks/nodejs-sample-app.git

# change directory
cd nodejs_sample_app
```

## Configuration

### Step 1. Create an account on hostedhooks

First, [create an account on hostedhooks](https://hostedhooks.com/sign_up).

### Step 2. Generate an app for your webhooks

After creating your account, you need to [generate a new app](https://docs.hostedhooks.com/getting-started/webhooks/setup-your-app#1-generate-an-app) where events will occur. This app is what your webhook subscribers will be subscribing to.

### Step 3. Create a Webhook Event for your app instance

Next, go to your app and create a [Webhook Event](https://docs.hostedhooks.com/developer-resources/components/webhook-events) for your app that subscribers can subscribe to.

In this example, we created `order.created` event that triggeres whenever a new order is **created**.

Here are some events you can trigger when order status changes:

- `order.fulfilled` - triggered whenever an order is **fulfilled**.
- `order.shipped` - triggered whenever an order is **shipped**.
- `order.canceled` - triggered whenever an order is **canceled**.
- `order.returned` - triggered whenever an order is **returned**.

**Note:** The events being sent from your application must match the events created in your [app instance](https://docs.hostedhooks.com/developer-resources/components/apps) and they must be created first.

### Step 4. Set up environment variables

Next, copy the `.env.example` file in root directory to `.env` (which will be ignored by Git):

```bash
cp .env.example .env
```

Then set each variable on `.env`:

- `HOSTEDHOOKS_API_KEY` must be the **API Key** from your [account settings](https://www.hostedhooks.com/settings/account).
- `APP_UUID` must be the **ID** of your app instance.

Your `.env` file should look like this:

```bash
HOSTEDHOOKS_API_KEY=...
APP_UUID=...
```

### Step 5. Run the app

```js
# install dependencies
npm install

# start your app
npm start
```

Your app is now running at http://localhost:3000.

#### Setting up the app:

In this app, we route all requests to the `/api` path:

```js
// app.js
const express = require('express');

// load environment variables
require('dotenv').config();

const orderRoutes = require('./routes/order');

const app = express();

// your app global middlewares
app.use(express.json());

// routing your http requests
app.use('/api', orderRoutes);
```

And we create two POST request handlers, one for creating an order, and the other for receiving events of a specific order from a shipping service:

```js
// routes/order.js
const router = require('express').Router();

const { createOrder, createEvent } = require('../controllers/order');

// POST request handler for creating an order
router.post('/order', createOrder);

// here where your events are processed for a confirmed order
router.post('/orders/:order_id/event', createEvent);

module.exports = router;
```

#### Triggering an event:

After processing your POST request and creating the order, you can send a webhook message by calling your webhook function:

```js
// controllers/order.js
const createOrder = (req, res, next) => {
  const { user_id, product_id, price, amount, tax, total } = req.body.order;

  // you may want to store it in a database, and generate the ID automatically
  const data = {
    order_id: 'a1b2c3d4e5f6g7h8i9', // demo ID
    user_id,
    product_id,
    price,
    amount,
    tax,
    total,
  };

  // you can pass in whatever data you want to send with the event
  sendWebhookMessage('order.created', data)
    .then((result) => {
      res.status(201).json({ message: 'Order has been created successfully', result });
    })
    .catch((error) => {
      res.status(error.status).json({ message: error.message });
    });
};
```

#### Building your webhook message:

In your webhook message, you can form the `data` object as you want:

```js
const fetch = require('node-fetch');

const sendWebhookMessage = (event, data) => {
  var url = new URL(
    `https://www.hostedhooks.com/api/v1/apps/${process.env.APP_UUID}/messages`
  );

  // webhook message
  var messagePayload = JSON.stringify({
    data: {
      order: data, // order data
    },
    version: '1.0',
    event_type: event, // ex: 'order.created'
  });

  var requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HOSTEDHOOKS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: messagePayload,
    redirect: 'follow',
  };

  fetch(url, requestOptions)
    .then((result) => result.text())
    .catch((error) => throw error);
};
```

Now your app is ready to go, copy and paste this `curl` into your terminal to create an order and send the related webhook message.

```bash
curl -X POST http://localhost:3000/api/order \
     -H "Content-type: application/json" \
     -d '{ "order": {
              "user_id": "123456789",
              "product_id": "a1b2c3d4e5f6g7h8i9",
              "price": "20.99",
              "amount": "2",
              "tax": "3.8",
              "total": "45.78"
            }
         }'
```

You should get a `201 Created` success status response code which indicates that your webhook message has been sent, and your subscribers has been notified.

## Documentation

For more information about using Hostedhooks, check out [documentation](https://docs.hostedhooks.com/).

## Support

If you have any questions please reach out to support@hostedhooks.com
