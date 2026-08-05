# EuphoriaX Store — User Service

Owns customer profile data in its own DynamoDB table (`USERS_TABLE_NAME`).
Profiles are created lazily on first authenticated call (`GET /me`), seeded
from the verified Cognito identity (`sub`, `email`) plus role derived from
the `cognito:groups` claim.

## Endpoints (`/api/v1/users`) — all require a valid Cognito access token

| Method | Path             | Role  | Description                    |
|--------|------------------|-------|---------------------------------|
| GET    | /me              | any   | Get (or lazily create) own profile |
| PATCH  | /me              | any   | Update own profile (optimistic lock via `version`) |
| GET    | /                | ADMIN | List all users (paginated scan) |
| GET    | /:userId         | ADMIN | Get any user by id              |
| PATCH  | /:userId/role    | ADMIN | Promote/demote USER ↔ ADMIN     |
| PATCH  | /:userId/status  | ADMIN | Suspend/reactivate a user       |
| DELETE | /:userId         | ADMIN | Delete a user record            |

## DynamoDB Table

- Table name: value of `USERS_TABLE_NAME`
- Partition key: `userId` (string, Cognito `sub`)
- Every write uses a `version` attribute for optimistic concurrency control.

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
npm test
```
