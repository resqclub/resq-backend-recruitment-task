# Backend developer assignment

## Introduction

This is the technical assignment for backend developers applying to ResQ Club. The whole assignment should take no more than 4 hours of your time, and will form the basis of our discussion in the tech interview. If you find the task is taking longer, and you don't have the time to complete it, feel free to stop early and provide some notes on how you were planning to proceed.

The assignment is based on a scenario which requires you to do a couple of tasks similar to working at ResQ Club.

## Assignment

You are implementing API endpoints (R API) to handle payments incoming from multiple different mobile app clients (C). The actual payments will be handled by a 3rd party payment service provider called BestPayments (BP).

The clients call R API when they want to pay for an item. With this POST call you get the following JSON payload:

```ts
itemId(string: UUID)
amount(float)
currency(string: ISO 4217 three letter code, e.g. EUR)
clientId(string: UUID)
```

The client needs a payment token to handle the payment in BP's app, so one should be returned to the app.

In BP's app the user accepts or declines the payment. From here we get a status for the user payment interaction. Sometimes the status can be missing due to unknown reasons.

The status along with the item data is POSTed to R API in JSON payload:

```ts
itemId(string: UUID)
clientId(string: UUID)
status(enum: ['accepted', 'declined', 'error'] | undefined)
```

From this the clients expect one of the following responses:

```ts
200: 'payment for item = ${itemId} successful!'
400: 'payment for item = ${itemId} failed!'
402: // with the original payment token as JSON payload
```

### BP offers an API (BP API) with three endpoints and one webhook:

#### POST https://bp.pay/v2/payments/create

```ts
// Request JSON payload:
merchantReference(string)
amount(int)
currency(string: ISO 4217 three letter code)
webhookCallbackUrl(string: URL)

// Response JSON payload:
paymentReference(string: UUID)
token(string)
```

#### GET https://bp.pay/v2/payments/get

```ts
// Request JSON payload:
paymentReference(string: UUID)

// Response JSON payload:
merchantReference(string)
amount(int)
currency(string: ISO 4217 three letter code)
status(enum: ['initiated', 'reserved', 'error', 'captured'])
```

#### POST https://bp.pay/v2/payments/capture

```ts
// Request JSON payload:
paymentReference(string: UUID)

// Response JSON payload:
status(enum: ['ok', 'alreadyCaptured', 'error'])
errorMessage(string | optional)
```

#### Webhook (triggered when payment is set to `reserved` or `error` status in BP)

```ts
// JSON payload:
paymentReference(string: UUID)
status(enum: ['reserved', 'error'])
```

#### The status of a BP payment flows as following:

```txt

                        /----------\                 /----------\
      ----------------->| reserved |---------------->| captured |
      |                 \----------/                 \----------/
/-----------\                |
| initiated |                |
\-----------/                v
      |                 /----------\
      ----------------->|   error  |
                        \----------/


```

A payment is created and set to 'initiated' state by a POST request to BP's create endpoint.

- `'initiated' -> 'reserved'` is triggered by a user in BP APP when the user accepts the payment.
- `'initiated' -> 'error'` is triggered by a user in BP APP when the user declines the payment or an error happened.
- `'reserved' -> 'error'` is triggered by R API if capturing the payment fails.
- `'reserved' -> 'captured'` is triggered by R API if capturing the payment succeeds.

After a user accepts a payment, and it is set to `'reserved'` status no money has yet been transferred. Only after you capture the payment successfully will money be transferred. Only after you know that you have transferred the money should you let the client know that the payment has been processed by returning success.

For triggering a capture for a payment BP favors using webhooks. You define the URL where to receive those as `webhookCallbackUrl` when creating a payment. In cases where a callback from this webhook is not received, you can try polling the BP API for the payment status. But webhooks should be preferred, as BP is worried about their server's performance if all integrators start polling payment statuses and they might start throttling requests if too many are received.

Due to BP API internals multiple simultaneous capture calls for the same payment will cause the payment in question to be canceled and all capture attempts on it to fail. The capture endpoint can take up to 5 seconds to return a response. After a capture request has finished, the endpoint can safely be called again with the same payment and it will immediately return `'alreadyCaptured'`.

### Your tasks:

- Implement the two endpoints to handle payments for clients
- Implement the endpoint for BP's webhook callbacks

#### Good to know

This project has a minimal express app, and we have kept it simple intentionally. The idea is to give you full freedom to choose the packages/libraries, project structure, and design architecture that you best see fit. Our only request is that you continue to use TS in this assignment.

### Things to note / Keep in mind:

- Prefer the webhook scenario for capturing payments, but make sure that payments will be processed even if a webhook callback is not received
- The webhook callback will arrive earliest when 'initiated' -> 'reserved' status change is triggered, but can also be delayed (or not arrive at all)
- The clients have a 20s timeout for all requests to R API

```txt
BP APP                 C                      R API                    BP API
|                    |    start a payment    |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |---------------------->|@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |         token         |@@@@@@@@@@@@@@@@@@@@@@@@@|
|       token        |<----------------------|@@@@@@@@@@@@@@@@@@@@@@@@@|
|<-------------------|                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|   payment status   |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|------------------->|                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |   finish a payment    |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |---------------------->|@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |        result         |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |<----------------------|@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|

```

**If the client receives a `402` as the result (with the payment token as the payload), they will retry the payment in BP APP**

```txt
BP APP                 C                      R API                    BP API
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|       token        |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|<-------------------|                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|   payment status   |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|------------------->|                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |   finish a payment    |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |---------------------->|@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |        result         |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |<----------------------|@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
|                    |                       |@@@@@@@@@@@@@@@@@@@@@@@@@|
```

## Run project

1. `yarn install`
1. `yarn run build`
1. `yarn run start`

## Submitting the assignment

Please clone this repo and create a new git branch with your changes. Ideally you will create a private repo on GitHub and give [@resq-bot](https://github.com/resq-bot) sufficient permissions to view and add extra collaborators (so other members of the tech team can review). Again ideally, you would raise a PR from your branch to `main` as if this were a real piece of work and your team would review it. If, for some reason, you cannot submit your changes in the ideal way, please discuss with us.

In reality, we always favor small PRs reviewed and merged quickly, but for this assignment it is okay to make a larger PR with more changes that you would normally include at once.
