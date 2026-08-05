# EuphoriaX Store — Auth Service

Authentication microservice backed by an **existing** Amazon Cognito User Pool.
No new Cognito resources are created; this service authenticates against:

- Region: `ap-southeast-1`
- User Pool ID: `ap-southeast-1_n3ugHAJ19`
- App Client ID: `2d1t50b7f5it9936rkdl1366at`

## Endpoints (`/api/v1/auth`)

| Method | Path                  | Auth | Description                        |
|--------|-----------------------|------|-------------------------------------|
| POST   | /register             | No   | Create a new Cognito user           |
| POST   | /verify-email         | No   | Confirm sign-up with emailed code   |
| POST   | /resend-verification  | No   | Resend the confirmation code        |
| POST   | /login                | No   | USER_PASSWORD_AUTH login            |
| POST   | /refresh-token        | No   | Exchange refresh token for new pair |
| POST   | /logout               | Bearer | Global sign-out                   |
| POST   | /forgot-password      | No   | Trigger reset code email            |
| POST   | /reset-password       | No   | Confirm new password with code      |
| POST   | /change-password      | No   | Change password (requires access token in body) |
| GET    | /me                   | Bearer | Current authenticated user        |

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Notes

- If your App Client has a **client secret** enabled, set `COGNITO_CLIENT_SECRET`
  in `.env` — the service automatically computes `SECRET_HASH` on every call.
  If it's disabled (the common case for public SPA clients), leave it blank.
- JWT validation (`authenticate` middleware) uses `aws-jwt-verify` and validates
  the Cognito **access token** signature, issuer, and client id against your
  User Pool's JWKS — no secrets required for verification.
- RBAC roles (`USER`, `ADMIN`) are read from the `cognito:groups` claim. Create
  these two groups in your existing User Pool and assign users to them.
