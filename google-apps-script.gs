/**
 * Pizza Prima CRM - Google Sheets Web App bridge
 *
 * Deploy as:
 *   Web app -> Execute as: Me -> Who has access: Anyone with the link
 *
 * IMPORTANT:
 *   Paste the deployed Web App URL ending in /exec into the CRM.
 *   Do NOT paste the Apps Script editor URL (/home/projects/.../edit).
 */

const SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Customers';

const HEADERS = [
  'Name',
  'Telefon',
  'E-Mail',
  'Adresse',
  'PLZ',
  'Kategorie',
  'Notizen',
  'Letzte Bestellung',
  'Zeitstempel',
];

function doGet() {
  return json_({ ok: true, message: 'Web app is running', sheet: SHEET_NAME });
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.openById(getSpreadsheetId_());
    const sheetName = body.sheetName || SHEET_NAME;
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    if (body.action === 'test') {
      prepareSheet_(sheet);
      return json_({ ok: true, spreadsheet: ss.getName(), sheet: sheetName });
    }

    if (body.action === 'replaceAllCustomers') {
      const customers = Array.isArray(body.customers) ? body.customers : [];
      replaceAllCustomers_(sheet, customers);
      SpreadsheetApp.flush();
      return json_({ ok: true, action: 'replaced_all', count: customers.length, sheet: sheetName });
    }

    if (['appendCustomer', 'upsertCustomer', 'updateCustomer'].includes(body.action)) {
      const customers = Array.isArray(body.customers) ? body.customers : [body.customer || body];
      appendCustomers_(sheet, customers);
      SpreadsheetApp.flush();
      return json_({ ok: true, action: 'appended', count: customers.length, sheet: sheetName });
    }

    return json_({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function replaceAllCustomers_(sheet, customers) {
  sheet.clearContents();
  prepareSheet_(sheet);
  appendCustomers_(sheet, customers);
}

function prepareSheet_(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
}

function appendCustomers_(sheet, customers) {
  if (!customers.length) return;
  const rows = customers.map(customerValues_);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
}

function customerValues_(customer) {
  return [
    customer.name || '',
    customer.phone ? "'" + String(customer.phone) : '',
    customer.email || '',
    customer.addr || '',
    customer.plz || '',
    customer.cat || '',
    customer.notes || '',
    customer.order || '',
    new Date(),
  ];
}

function getSpreadsheetId_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PASTE_YOUR_SPREADSHEET_ID_HERE') {
    throw new Error('Set SPREADSHEET_ID before deploying the web app.');
  }
  return SPREADSHEET_ID;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
