# Aamkahon deployment

Two deploy targets:

| Target | What | Data |
|---|---|---|
| Vercel | `amkahon-front` only, demo | `NEXT_PUBLIC_DATA_MODE=static` (bundled fixtures, no backend, writes disabled) |
| Hostinger VPS | `amkahon-back` (API, :5030) + `amkahon-front` (Next, :3000) behind nginx | `NEXT_PUBLIC_DATA_MODE=api`, MongoDB |

---

## 1. Vercel (static demo)

1. Import the `amkahon-front` repo. Framework: Next.js. Build command `next build`, output default.
2. Environment variables:
   ```
   NEXT_PUBLIC_DATA_MODE=static
   NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
   ```
3. Deploy. Demo admin: `/login` → demo@aamkahon.com / demo1234 (prefilled). robots.txt blocks indexing in static mode.
4. To refresh demo content after editing `amkahon-back/seed/data.js`: `cd amkahon-back && npm run fixtures`, commit `amkahon-front/data/demo`, redeploy.

Note: `public/videos` is ~28 MB. Fine for Vercel; originals live in `media-originals/` (gitignored).

---

## 2. VPS (production)

Assumes Ubuntu, Node 22 LTS, pm2, nginx, a domain with DNS pointing at the VPS,
e.g. `aamkahon.com` (site) and `api.aamkahon.com` (API).

### 2.1 Backend
```bash
cd /var/www/amkahon-back
npm ci --omit=dev
cp .env.example .env   # then fill it, see below
npm run seed:all       # districts + demo catalogue + owner admin (safe to re-run)
pm2 start ecosystem.config.cjs && pm2 save
```
`.env` (production values):
```
NODE_ENV=production
PORT=5030
BASE_URL=https://api.aamkahon.com
CLIENT_URL=https://aamkahon.com
FRONTEND_URL=https://aamkahon.com,https://www.aamkahon.com
SITE_URL=https://aamkahon.com
SITE_NAME=Aamkahon
MONGODB_URI=<atlas uri>          # allow the VPS IP in Atlas Network Access
JWT_SECRET=<64+ random chars>    # openssl rand -hex 48
JWT_EXPIRE=30d
SSLCOMMERZ_STORE_ID=<live id>
SSLCOMMERZ_STORE_PASSWORD=<live password>
SSLCOMMERZ_IS_SANDBOX=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=...
SMTP_PASS=<gmail app password>
MAIL_FROM="Aamkahon <...>"
MAIL_TO=<where inquiries go>
```
- `BASE_URL` must be the public API URL: SSLCommerz calls `BASE_URL/api/payment/ipn` and redirects to `BASE_URL/api/payment/process-success`, which then redirects to `CLIENT_URL/order/success`.
- Run exactly ONE backend instance (fork mode). The campaign cron has no lock.
- `uploads/` holds admin uploaded images: back it up, never put it in git.

### 2.2 Frontend
```bash
cd /var/www/amkahon-front
npm ci
cat > .env.production <<'ENV'
NEXT_PUBLIC_DATA_MODE=api
NEXT_PUBLIC_API_URL=https://api.aamkahon.com/api
API_INTERNAL_URL=http://127.0.0.1:5030/api
NEXT_PUBLIC_SITE_URL=https://aamkahon.com
ENV
npm run build          # backend should be running first so pages prerender with data
pm2 start ecosystem.config.cjs && pm2 save
```
`NEXT_PUBLIC_*` values are baked in at build time: rebuild after changing them.
If the API was down during build, the site still builds and fills itself in on first request (1 minute cache).

### 2.3 nginx
```nginx
server {
    server_name aamkahon.com www.aamkahon.com;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
server {
    server_name api.aamkahon.com;
    client_max_body_size 64m;          # image uploads + hero video (60 MB limit)
    location / {
        proxy_pass http://127.0.0.1:5030;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Then `sudo certbot --nginx -d aamkahon.com -d www.aamkahon.com -d api.aamkahon.com`.

The rate limiters key on client IP. Behind nginx, Express must trust the proxy:
`server.js` sets `app.set("trust proxy", 1)` when NODE_ENV=production, so keep exactly one proxy (nginx) in front of the API.

### 2.4 After deploy, check
- `https://api.aamkahon.com/health` returns OK.
- Homepage shows products; `/admin` login with the owner account.
- Place a sandbox order first (`SSLCOMMERZ_IS_SANDBOX=true`), confirm the IPN marks it paid, then switch to live.
- Send a test inquiry and confirm the email reaches `MAIL_TO`.

### Updating
```bash
git pull && npm ci && npm run build && pm2 restart amkahon-front     # frontend
git pull && npm ci --omit=dev && pm2 restart amkahon-back            # backend
```
