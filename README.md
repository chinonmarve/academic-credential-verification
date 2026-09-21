# ACV Platform — Zero-Knowledge Proof-Enabled Decentralised Identity Framework

A working full-stack software prototype for the academic research work:

**"Zero-Knowledge Proof-Enabled Decentralised Identity Framework for Secure and Privacy-Preserving Academic
Credential Verification."**

It demonstrates the full research workflow end to end:

```
University issues credential → Student holds it in a DID wallet → Credential hash anchored on a
simulated blockchain → Student selectively discloses attributes and shows a QR code →
Employer scans/enters the reference → System verifies signature, hash, status and proof →
Valid / Invalid / Revoked result → Event logged in the audit trail
```

---

## 1. Research Context

The research proposes replacing manual, centralised academic credential verification with:

- **Decentralised Identity (DID)** — students own and control their identity, not the university.
- **Verifiable Credentials (VCs)** — digitally signed, tamper-evident academic records.
- **Blockchain anchoring** — only a cryptographic hash of the credential is put on-chain; the full
  credential stays off-chain in the student's wallet.
- **Zero-Knowledge Proof / selective disclosure** — a verifier learns only the attributes the student
  chooses to disclose (e.g. "graduated: yes") without seeing the rest of the academic record.

This project implements that architecture as a runnable prototype.

---

## 2. Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Recharts, jsQR, html2canvas + jsPDF (certificate PDF export) |
| Backend | Node.js, Express.js |
| Auth | JWT + bcrypt password hashing, role-based access control |
| Database | Embedded JSON document store (`backend/src/db.json`) — see note below |
| Blockchain | Simulated, hash-chained Ethereum-compatible ledger (`blockchainService.js`) |
| Signatures | Simulated BBS+-style issuer signing via HMAC-SHA256 (`signatureService.js`) |
| Selective Disclosure / "ZKP" | Salted attribute-commitment scheme (`zkpService.js`) — see note below |
| QR Codes | `qrcode` (generation), `jsQR` (browser-side scanning/decoding) |

### Database note
The research specifies MongoDB Atlas. To keep this prototype runnable with **zero external services**,
it ships with a lightweight embedded JSON document store that mimics MongoDB-style collections
(`backend/src/db.js`). All business logic lives in `backend/src/services/*` and talks only to this module,
so swapping in real MongoDB Atlas later (via Mongoose) does not require touching any service or route logic.
Set `MONGODB_URI` in `backend/.env` once you're ready to migrate.

### Zero-Knowledge Proof note — **read this before a project defence**
The research calls for a zk-SNARK/Groth16 circuit combined with BBS+ Signatures. Implementing a real
zk-SNARK circuit is outside the scope of a software prototype. What is actually implemented is a genuine,
working **salted attribute-commitment selective-disclosure scheme**:

1. Every credential attribute is hashed individually with a random salt:
   `commitment = SHA256(fieldName + ":" + value + ":" + salt)`.
2. The credential's on-chain hash is the SHA256 of all commitments combined.
3. When a student discloses only some attributes, the verifier receives the plaintext value + salt for
   *disclosed* fields only, and just the commitment (never the value) for everything else.
4. The verifier recomputes every commitment and the aggregate hash and checks it still matches the
   blockchain record — proving the disclosed values are genuinely part of the original signed credential,
   without ever learning the undisclosed ones.

This is a real, working "verify without full exposure" property, clearly distinguished here (and in the
UI's "About the System" page) from a production zk-SNARK/BBS+ implementation. Swap `zkpService.js` and
`signatureService.js` for production cryptography libraries when moving beyond prototype stage.

### Blockchain note
`blockchainService.js` simulates an Ethereum-compatible smart-contract registry entirely in the local data
store — no real network is contacted. Each record links to the previous block's hash
(`verifyChainIntegrity()` checks this), giving a genuine tamper-evidence property at a conceptual level.
The UI labels this everywhere as "Simulated Ethereum-Compatible Network."

---

## 3. Project Structure

```
academic-credential-verification/
├── backend/
│   ├── src/
│   │   ├── server.js            # Express entry point (serves API + built frontend)
│   │   ├── db.js                # Embedded JSON data store
│   │   ├── seed.js              # Demo data seeder
│   │   ├── middleware/auth.js   # JWT + role guard
│   │   ├── routes/               # auth, university, student, verification
│   │   ├── services/             # did, signature, blockchain, zkp, credential,
│   │   │                         # verification, presentation, qr, audit
│   │   └── utils/crypto.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/public/         # Home, About, Login, Verify
│   │   ├── pages/university/     # Dashboard, Students, Credentials, Issue, Blockchain, Audit Logs
│   │   ├── pages/student/        # Wallet, Credential Detail + Selective Disclosure
│   │   ├── pages/employer/       # Verification Dashboard
│   │   ├── components/           # DashboardShell, PublicNav, Charts, Common UI
│   │   ├── context/AuthContext.jsx
│   │   └── api/client.js
│   └── package.json
├── setup.sh / setup.bat
└── README.md
```

---

## 4. Installation

### Requirements
- Node.js 18+ and npm

### Quick start (Mac/Linux)
```bash
./setup.sh
```

### Quick start (Windows)
```bat
setup.bat
```

### Manual steps
```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
node src/seed.js        # populates demo university, students, employer, credentials

# 2. Frontend
cd ../frontend
npm install
npm run build            # outputs to frontend/dist

# 3. Run
cd ../backend
npm start                 # serves API + built frontend on http://localhost:5000
```

Open **http://localhost:5000** in your browser.

### Frontend-only dev mode (hot reload)
If you want to edit the UI with hot reload while the backend runs separately:
```bash
# terminal 1
cd backend && npm start          # http://localhost:5000

# terminal 2
cd frontend && npm run dev       # http://localhost:5173 (proxies /api to :5000)
```

---

## 5. Environment Variables (`backend/.env`)

```env
PORT=5000
JWT_SECRET=change_this_secret_in_production
MONGODB_URI=
BLOCKCHAIN_NETWORK_LABEL=Simulated Ethereum-Compatible Network
PUBLIC_BASE_URL=
```

Never commit a real `.env` file or hard-code secrets — `.env` is git-ignored.

### `PUBLIC_BASE_URL` and the QR workflow
Every credential and presentation QR code encodes a real, clickable verification URL:
`<PUBLIC_BASE_URL>/verify?id=<credentialId>`.

- **Local development / running on one machine:** leave `PUBLIC_BASE_URL` blank. It
  automatically falls back to `http://localhost:<PORT>`, which is fine as long as you're
  scanning the QR on the same machine that's running the server.
- **Live deployment, or testing the QR with an actual phone camera:** set
  `PUBLIC_BASE_URL` to your real public URL before starting the server, e.g.
  ```env
  PUBLIC_BASE_URL=https://your-domain.com
  ```
  (no trailing slash). Every credential issued or presented after that will produce a QR
  that opens correctly from any phone's normal camera app — no code changes needed, and no
  QR permanently baked to `localhost`. The server prints which base URL is active on
  startup.

Scanning a certificate's QR (Android or iPhone camera) opens `/verify?id=<id>` in the
browser, which auto-fills the credential ID and runs verification immediately — the visitor
doesn't need to type or paste anything.

---

## 6. Demo Accounts

| Role | Email | Password |
|---|---|---|
| University Admin | admin@delsu.edu.ng | University@123 |
| Student | student@delsu.edu.ng | Student@123 |
| Student (second) | efe.student@delsu.edu.ng | Student@123 |
| Employer / Verifier | verifier@marveltech.com | Employer@123 |

The seed script also prints a **VALID** and a **REVOKED** credential ID you can paste directly into
the public Verify Credential page to see both outcomes.

Re-run demo data at any time with:
```bash
cd backend && node src/seed.js
```
This resets the entire local data store.

---

## 7. Demonstrable Flows

1. **Issue a credential** — log in as University → Students → Issue Credential wizard → student's wallet
   updates immediately with the new credential, QR code, and blockchain reference. From the success screen,
   the university can immediately **download the printable certificate as a PDF**.
2. **Certificate download** — from University → Credentials (per-row "Certificate" link) or from the
   student's Wallet → a credential → "Download Certificate", either side can preview and download a
   formatted certificate: institution name, the formal award text, qualification, programme, GPA, the
   issue date written out ("Given this 14th day of November, 2025"), a QR code between the Vice-Chancellor
   and Registrar signature blocks, and the credential ID. A revoked credential's certificate is stamped
   REVOKED. Generated entirely in the browser (`html2canvas` + `jsPDF`) — no server round trip.
3. **Selective disclosure** — log in as Student → open a credential → Present Credential → choose which
   attributes to disclose → Generate Privacy-Preserving Proof → a new QR is produced valid for 15 minutes.
4. **Public verification** — from Home or the Verify Credential page (no login needed), enter a credential
   ID, scan a QR via camera, or upload a QR image → see the full step-by-step verification (signature, hash,
   status, ZKP) and the final Valid/Invalid/Revoked result.
5. **Revocation** — log in as University → Credentials → Revoke a credential → verify the same credential
   again publicly → result now shows REVOKED.
6. **Blockchain & audit trail** — University → Blockchain Records shows the chained hash history; Audit Logs
   shows every issuance, presentation, and verification event.
7. **Phone QR scan (employer)** — an employer points their phone's normal camera at a certificate's printed
   QR code, taps the link, and the public Verify page opens with the credential ID already filled in and
   verification already running — no app, login, or typing required. See "PUBLIC_BASE_URL and the QR
   workflow" above for what to set before this works from an actual phone.

---

## 8. Security Notes

- Passwords are hashed with bcrypt; sessions use short-lived JWTs.
- QR codes encode only a safe reference ID (`credentialId` or a short-lived `presentationId`) — never raw
  personal data.
- Selective disclosure ensures a verifier only ever receives attributes the holder explicitly approved.
- All role-restricted API routes are guarded by `requireAuth` + `requireRole` middleware.
- Errors are caught centrally; raw stack traces are never sent to the client.

---

## 9. Prototype Limitations

- The database is a local JSON file, not MongoDB Atlas (see Section 2).
- The blockchain is simulated locally, not a real Ethereum/Polygon network.
- The Zero-Knowledge layer is a salted-commitment selective-disclosure scheme, not a production
  zk-SNARK/BBS+ implementation (see Section 2).
- Data resets if `backend/src/data/db.json` is deleted or `node src/seed.js` is re-run.
- Intended as an academic software prototype / project-defence demonstration, not a production system.

---

## 10. Testing the Core Flows Manually

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delsu.edu.ng","password":"University@123"}'

# Public verification (replace with a real credential ID from the seed output)
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"credentialId":"CRED-XXXXXXXX-XXXXXXXX"}'
```

## 10. Easy Start / Cross-Platform Access

- **Windows:** double-click `START.bat`.
- **Mac/Linux:** run `./START.sh`.
- The start scripts install missing dependencies, build the frontend when needed, start the Node/Express server and open `http://localhost:5000/` in the default browser.
- The application is browser-based and responsive for desktop and mobile browsers, including Chrome, Edge, Firefox and Safari.
- For QR scanning from a different phone/device, set `PUBLIC_BASE_URL` to the deployed HTTPS address before issuing new credentials.

## 11. Certificate Design

The certificate is generated dynamically from the issued credential and exported as an **A4 landscape PDF**. It uses the Delta State University visual identity, places the university logo before the university name, displays the credential data, includes a verification QR code, and leaves blank physical signature lines for the Vice-Chancellor and Registrar. No digital/generated signature is printed on the certificate.

### University logo source
The certificate uses the Delta State University visual identity. The logo reference was taken from the university's official materials and portal; the official portal logo asset is `https://portal.delsu.edu.ng/img/delsulogo.jpg`, while the university handbook documents the logo structure and colours.
