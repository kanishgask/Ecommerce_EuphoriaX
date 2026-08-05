# EuphoriaX Store — Cart Service

Owns the shopping cart. Enriches items with live product data via a direct
HTTP call to the Product Service at write time, then stores a denormalized
snapshot (name/price/image) so cart reads never need a cross-service call.

## Endpoints (`/api/v1/cart`) — all require a valid Cognito access token

| Method | Path                 | Description                    |
|--------|----------------------|----------------------------------|
| GET    | /                    | Get current user's cart + subtotal |
| POST   | /items               | Add item (merges quantity if already present) |
| PATCH  | /items/:productId    | Set exact quantity              |
| DELETE | /items/:productId    | Remove one line item             |
| DELETE | /                    | Clear entire cart                |

## DynamoDB Table

- Table: `CART_TABLE_NAME`
- PK: `userId`, SK: `productId`
- TTL attribute `expiresAt` (default 30 days, `CART_ITEM_TTL_DAYS`) — DynamoDB
  automatically evicts abandoned cart items without any cleanup job.

## Local Development

```bash
cp .env.example .env
npm install
npm run dev   # requires product-service running at PRODUCT_SERVICE_URL
npm test
```
