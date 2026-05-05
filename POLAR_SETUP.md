# Polar Setup Guide (redditprofile)

This project is already wired for Polar checkout + webhook.

## 1) What This Codebase Needs From Polar

Your app currently uses these environment variables:

- `POLAR_ACCESS_TOKEN`
- `POLAR_PRODUCT_ID`
- `POLAR_WEBHOOK_SECRET`

Code references:

- Checkout session creation: `src/app/api/checkout/route.ts`
- Webhook handling (`order.paid`): `src/app/api/webhooks/polar/route.ts`
- Env template: `.env.example`

## 2) Do You Need API Keys or Just Access Token?

For this codebase, **you do not need separate API key pair fields**.

Use:

1. Organization Access Token (for server-to-server API calls)
2. Product ID (the paid product)
3. Webhook Secret (to verify webhook signatures)

That is enough.

## 3) Create Access Token (From Polar Dashboard)

Go to Polar Dashboard -> Settings -> Developers/API Keys & Tokens -> Create Organization Token.

Token name suggestion:

- `redditprofile-production`

Expiration:

- Prefer no expiry for production, or set rotation reminders if you use expiry.

### Required Scopes

Minimum scope required by current code:

- `checkouts:write`

Optional safe extras (not required right now, but useful for diagnostics/future reads):

- `checkouts:read`
- `orders:read`

You can keep it minimum (`checkouts:write`) for least privilege.

## 4) Get Product ID

In Polar Dashboard:

1. Open Products
2. Open your one-time product
3. From the top-right product menu, click **Copy Product ID**
4. Paste into `POLAR_PRODUCT_ID`

## 5) Create Webhook + Secret

In Polar Dashboard:

1. Go to Settings -> Webhooks
2. Create endpoint URL:
   - Local dev: `https://<your-ngrok-or-cloudflare-tunnel-domain>/api/webhooks/polar`
   - Production: `https://<your-domain>/api/webhooks/polar`
3. Subscribe to event:
   - `order.paid`
4. Copy the endpoint signing secret and set:
   - `POLAR_WEBHOOK_SECRET`

## 6) Environment Variables (.env)

Set these values:

```env
POLAR_ACCESS_TOKEN=...
POLAR_PRODUCT_ID=...
POLAR_WEBHOOK_SECRET=...
```

Optional for test mode only:

```env
POLAR_SERVER=sandbox
```

Notes:

- If `POLAR_SERVER` is not set, SDK uses default (live/prod behavior).
- Use `POLAR_SERVER=sandbox` only when using sandbox resources.

## 7) How Payment Flow Works in This App

1. User clicks upgrade button
2. App calls `GET /api/checkout`
3. Server creates Polar checkout using `POLAR_ACCESS_TOKEN` + `POLAR_PRODUCT_ID`
4. Polar redirects user after payment to `/payment/success`
5. Polar sends webhook to `/api/webhooks/polar`
6. On `order.paid`, app sets `user.isPaid = true`

## 8) Quick Verification Checklist

- `POLAR_ACCESS_TOKEN` is present in runtime environment
- `POLAR_PRODUCT_ID` matches the correct product (live vs sandbox)
- Webhook endpoint is reachable from internet
- `POLAR_WEBHOOK_SECRET` matches the webhook endpoint secret
- Webhook event `order.paid` is enabled
- Test purchase updates user to paid

## 9) Common Mistakes

- Using sandbox product ID with live token (or vice versa)
- Missing `checkouts:write` scope on token
- Wrong webhook URL (404 or private localhost URL)
- Webhook secret copied from a different endpoint
- Not restarting app after env changes

## 10) Recommended Security Practice

- Never expose Polar token on client side
- Keep `POLAR_ACCESS_TOKEN` only in server environment
- Rotate tokens periodically and update deployment secrets
