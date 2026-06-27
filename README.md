# Pizza Prima CRM

Premium browser CRM for Pizza Prima call handling, customer records, Fritz!Box SIP setup, and Google Sheets sync.

## What is new in this enhanced build

- New dashboard cockpit with customer, call, VIP, data-quality, and Google Sheets status cards.
- Customer import/export tools: CSV export, JSON backup export, and JSON backup restore.
- Smarter customer search across name, phone, email, address, notes, and last order.
- Sort customers by recent updates, name, VIP first, or most calls.
- Quick customer actions: call, WhatsApp, email, and Google Maps route links.
- Duplicate phone warning before saving.
- Google Sheets sync remains a full mirror after every add, edit, delete, or backup import.
- No API keys, spreadsheet IDs, SIP passwords, or Web App URLs are hardcoded in the frontend.

## Run locally

```bash
npm install
npm run dev
```

## Google Sheets setup

1. Open your Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Paste the contents of `google-apps-script.gs`.
4. Set `SPREADSHEET_ID` to your Sheet ID.
5. Deploy as **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone with the link**
6. Copy the deployed URL that ends with `/exec`.
7. Paste that URL in the CRM under **Google Sheets**.

Do not paste the Apps Script editor URL that contains `/home/projects/.../edit`.

## GitHub safety

The project is safe to upload publicly as long as you do not commit your personal `.env` files or manually paste secrets into the source code. User settings are stored only in the browser's localStorage.
