# Cert System

Simple certificate verification platform (Polygon Amoy + Node/Express).

## Setup
1. Install dependencies: `npm install`
2. Create `.env` (RPC_URL, CONTRACT_ADDRESS, RELAYER_PRIVATE_KEY, DB settings, etc.).
3. Start server: `npm start`

## Key Scripts
- `npm start` – run server
- `npm run dev` – (if using nodemon) development

## Structure
- `server.js` – Express entry
- `routes/` – API routes
- `controllers/` – request handlers
- `utils/blockchain.js` – chain interactions
- `public/` – frontend assets (verify page, dashboards)

## Notes
- Uploads under `public/uploads/institute(s)` are git-ignored; .gitkeep keeps the folders.
- On Polygon Amoy, gas overrides are set in blockchain helper.
