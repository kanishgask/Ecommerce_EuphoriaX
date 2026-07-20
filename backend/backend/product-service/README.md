# EuphoriaX Store — Product Service

Owns the product catalog. Public browsing/search endpoints are unauthenticated;
create/update/delete require an `ADMIN` Cognito group membership.

## Endpoints (`/api/v1/products`)

| Method | Path            | Auth  | Description                         |
|--------|-----------------|-------|---------------------------------------|
| GET    | /               | No    | List products (optional `?category=`, paginated) |
| GET    | /search?q=      | No    | Keyword search across name/description |
| GET    | /slug/:slug     | No    | Fetch by SEO slug                     |
| GET    | /:productId     | No    | Fetch by id                           |
| POST   | /               | ADMIN | Create product                        |
| PATCH  | /:productId     | ADMIN | Update product (optimistic lock)      |
| DELETE | /:productId     | ADMIN | Delete product                        |

## DynamoDB Table

- Table: `PRODUCTS_TABLE_NAME`
- PK: `productId`
- GSI `CategoryIndex`: `category` (HASH) / `createdAt` (RANGE)
- GSI `SlugIndex`: `slug` (HASH)

## Events

On create/update/delete, this service publishes to the SNS topic
`PRODUCT_EVENTS_TOPIC_ARN` (`ProductCreated` / `ProductUpdated` / `ProductDeleted`).
The Search service subscribes an SQS queue to this topic to build a
denormalized, query-optimized read index without ever touching this table directly.

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
npm test
```
