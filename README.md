# Entropy Soft website

React (Vite) + plain CSS frontend and a Node.js/Express backend.
**No database.** Contact inquiries and job applications (with the CV attached) are emailed to `entropysoft101@gmail.com`.

```
entropy-soft/
├── backend/    Express API: /api/health, /api/contact, /api/careers/apply
└── frontend/   React + Vite site: Home, Contact Us, Careers
```

## 1. Requirements
Node.js 18 or newer (`node -v`).

## 2. Configure the email account (required for real delivery)
The backend sends mail through Gmail SMTP using an **App Password** (never the normal Gmail password).

1. Sign in to the Google account `entropysoft101@gmail.com`.
2. Turn on **2-Step Verification** (Google Account → Security).
3. Open https://myaccount.google.com/apppasswords, create an app password (name it "Entropy Soft website") and copy the 16 characters.
4. In `backend/`, copy the example file and fill in the password:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Then edit `.env` and set `EMAIL_APP_PASSWORD=` to the 16-character value.

`.env` is git-ignored. Never put credentials in the frontend.
Prefer a transactional provider (Resend, Brevo, SendGrid...)? Only `backend/services/emailService.js` needs changing.

## 3. Run locally
Open two terminals.

```bash
# Terminal 1: backend (http://localhost:5000)
cd backend
npm install
npm run dev
```
```bash
# Terminal 2: frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```
Vite proxies `/api` to the backend, so no frontend configuration is needed locally.
On startup the backend prints `Email transport verified.` when the Gmail login works, or `Email transport NOT ready` plus an error code when it does not.

## 4. Test both forms
**Health check**
```bash
curl http://localhost:5000/api/health
```
**Contact form (real email)**: open http://localhost:5173/contact, submit the form, and check the inbox of `entropysoft101@gmail.com`. Subject: `[Entropy Soft] New Project Inquiry — <subject>`. Press "Reply" to confirm it goes to the visitor's address.
Checks: empty required fields and bad emails are rejected; the button is disabled while sending; wrong `EMAIL_APP_PASSWORD` shows an error and never a success message.

**Careers form (real email + CV)**: open http://localhost:5173/careers, click "Apply Now" on a role (the position is pre-filled), attach a PDF under 5 MB, submit. The email arrives with `[Entropy Soft Careers] Application — <Position> — <Name>` and the PDF attached.
Checks: a `.txt` or renamed non-PDF file, a PDF over 5 MB and a missing CV are all rejected.

**API-only tests**
```bash
curl -i -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","service":"Other","subject":"Hello","message":"This is a test message for Entropy Soft."}'

curl -i -X POST http://localhost:5000/api/careers/apply \
  -F name="Test User" -F email=test@example.com -F position="Frontend Developer — React.js" \
  -F skills="React, CSS" -F experience="Built several small React projects." \
  -F coverLetter="I would like to join Entropy Soft because I enjoy building useful software." \
  -F cv=@/path/to/cv.pdf
```
Rate limits: 5 contact requests per 15 minutes and 5 applications per hour per IP (edit `backend/middleware/rateLimiters.js`).
Temporary CVs live in the OS temp folder under `entropysoft-cv-uploads` and are deleted after every request, whether it succeeds or fails.

## 5. Edit content
| What | File |
|---|---|
| Services, project types | `frontend/src/data/services.js` |
| Portfolio projects (empty until you add real ones) | `frontend/src/data/projects.js` |
| Job listings | `frontend/src/data/jobs.js` |
| Email, WhatsApp, FAQ, process, social links | `frontend/src/data/site.js` |
| Colours and fonts | `:root` in `frontend/src/styles/global.css` |

Project screenshots go in `frontend/public/projects/`. Social links appear in the footer only after you add real URLs to `SOCIAL_LINKS`.
Budget ranges are listed in both `frontend/src/data/site.js` and `backend/utils/validators.js`; keep them in sync.

## 6. Deploy
**Backend** (Render, Railway, Fly.io or any Node host)
- Root directory `backend`, build `npm install`, start `npm start`.
- Set the environment variables from `.env.example` in the host dashboard. `FRONTEND_URL` must be your exact frontend origin (e.g. `https://entropysoft.com`, several allowed, comma-separated). Set `TRUST_PROXY=1`.
- Some hosts, including some free tiers, block outbound SMTP. If sending fails only in production, use a provider with an HTTPS API instead of SMTP.
- Check `https://<backend-url>/api/health`.

**Frontend** (Netlify, Vercel, Cloudflare Pages)
- Root directory `frontend`, build `npm run build`, output `dist`.
- Set `VITE_API_URL=https://<backend-url>` (no trailing slash) before building.
- `public/_redirects` (Netlify/Cloudflare) and `vercel.json` make page refreshes on `/contact` and `/careers` work.
- Attach your custom domain; HTTPS is automatic on these hosts.

After deploying, repeat the two form tests against the live site.

## 7. Security notes
- Server-side validation and sanitisation of every field; line breaks are stripped from single-line values to block email header injection; email bodies are HTML-escaped.
- CVs: PDF only, 5 MB max; extension, MIME type and file contents (PDF header/trailer, no embedded scripts or auto-run actions) are checked on the server. Files get random names in a private temp folder and are never served.
- Helmet, strict CORS, request size limits, rate limiting and a hidden honeypot field against bots. A honeypot hit returns a quiet "ok" and sends nothing.
- Success is reported only after the mail server accepts the message. That means accepted for delivery, not guaranteed inbox delivery.
