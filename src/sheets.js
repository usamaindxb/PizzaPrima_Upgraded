export function isValidAppsScriptExecUrl(url) {
  return /^https:\/\/script\.google\.com(?:\/u\/\d+)?\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(String(url || '').trim());
}

export class SheetsSync {
  constructor({ webAppUrl, sheetName = 'Customers' }) {
    this.webAppUrl = String(webAppUrl || '').trim();
    this.sheetName = sheetName || 'Customers';
  }

  _requireUrl() {
    if (!this.webAppUrl) {
      throw new Error('Google Apps Script Web-App-URL fehlt.');
    }

    if (!isValidAppsScriptExecUrl(this.webAppUrl)) {
      throw new Error(
        'Falsche Apps-Script-URL. Bitte die Web-App-URL verwenden, die so aussieht: https://script.google.com/macros/s/.../exec. Nicht die /home/projects/.../edit URL verwenden.'
      );
    }
  }

  async _post(payload) {
    this._requireUrl();

    const response = await fetch(this.webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ sheetName: this.sheetName, ...payload }),
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Apps Script returned invalid JSON. Check the deployment URL and redeploy as Web App.');
    }

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  customerPayload(customer) {
    return {
      id: customer.id || '',
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      addr: customer.addr || '',
      plz: customer.plz || '',
      cat: customer.cat || '',
      notes: customer.notes || '',
      order: customer.order || '',
    };
  }

  syncAllCustomers(customers) {
    return this._post({
      action: 'replaceAllCustomers',
      customers: customers.map(customer => this.customerPayload(customer)),
    });
  }

  appendCustomer(customer) {
    return this.syncAllCustomers([customer]);
  }

  upsertCustomer(customer) {
    return this._post({ action: 'upsertCustomer', customer: this.customerPayload(customer) });
  }

  updateCustomer(customer, previousCustomer = null) {
    return this._post({
      action: 'updateCustomer',
      customer: this.customerPayload(customer),
      lookup: previousCustomer ? this.customerPayload(previousCustomer) : this.customerPayload(customer),
    });
  }

  deleteCustomer(customer) {
    return this._post({
      action: 'deleteCustomer',
      customer: this.customerPayload(customer),
      lookup: this.customerPayload(customer),
    });
  }

  async testConnection() {
    const data = await this._post({ action: 'test' });
    return data.spreadsheet || data.title || data.sheet || 'Google Sheet';
  }
}
