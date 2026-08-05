# EuphoriaX Store — Order Service

Owns order placement and lifecycle. Checkout reads the caller's cart from the
Cart Service (forwarding the caller's own access token), snapshots line items
at current price, creates the order, publishes an `OrderPlaced` event, then
clears the cart.

## Order State Machine

```
PENDING_PAYMENT -> PAID -> PROCESSING -> SHIPPED -> DELIVERED
       |             |          |
       v             v          v
   CANCELLED     CANCELLED  CANCELLED
```

Invalid transitions are rejected with `422`. Every transition is appended to
`statusHistory` for a full audit trail.

## Endpoints (`/api/v1/orders`) — all require a valid Cognito access token

| Method | Path                | Role  | Description                     |
|--------|---------------------|-------|-----------------------------------|
| POST   | /checkout           | any   | Convert current cart into an order |
| GET    | /mine               | any   | Own order history (paginated)     |
| GET    | /:orderId           | owner/ADMIN | Get a single order          |
| GET    | /                   | ADMIN | List all orders                   |
| PATCH  | /:orderId/status    | ADMIN | Transition order status           |

## DynamoDB Table

- Table: `ORDERS_TABLE_NAME`
- PK: `orderId`
- GSI `UserOrdersIndex`: `userId` (HASH) / `createdAt` (RANGE)

## Events

Publishes `OrderPlaced` / `OrderStatusChanged` to `ORDER_EVENTS_TOPIC_ARN`.
The Notification service subscribes an SQS queue to fan out order
confirmation and shipping-update emails; the Shipping service auto-creates
a shipment record from `OrderStatusChanged` → `PAID`.

## Local Development

```bash
cp .env.example .env
npm install
npm run dev   # requires cart-service running at CART_SERVICE_URL
npm test
```
