// Central browser storage for Pizza Prima CRM.
// No API keys, Web App URLs, spreadsheet IDs, or passwords are hardcoded here.
// User-specific settings are stored only in the browser's localStorage.

const KEYS = Object.freeze({
  CUSTOMERS: 'pp_customers',
  CALL_LOG: 'pp_call_log',
  SIP_CONFIG: 'pp_sip_config',
  GS_CONFIG: 'pp_gs_config',
});

const DEFAULT_GS_CONFIG = Object.freeze({
  webAppUrl: '',
  sheetName: 'Customers',
  connected: false,
});

const DEFAULT_SIP_CONFIG = Object.freeze({
  registrar: 'fritz.box',
  user: '',
  pass: '',
  number: '',
  connected: false,
});

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureId(rec) {
  if (!rec.id) {
    rec.id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return rec;
}

// Demo-only records. Replace or delete them inside the app.
const DEFAULT_CUSTOMERS = [
  {
    id: 'demo_1',
    name: 'Demo Customer',
    phone: '+49 000 000000',
    email: 'customer@example.com',
    addr: 'Example Street 1, 48143 Muenster',
    plz: '48143',
    cat: 'Regular customer',
    order: 'Pizza Salami large',
    notes: 'Demo record - safe to delete',
    calls: [{ time: '2024-01-15T11:32:00', label: 'Mo 15.01 · 11:32 Uhr' }],
  },
  {
    id: 'demo_2',
    name: 'VIP Demo',
    phone: '+49 000 111111',
    email: 'vip@example.com',
    addr: 'Sample Avenue 7, 48153 Muenster',
    plz: '48153',
    cat: 'VIP',
    order: 'Family pizza x2',
    notes: 'Demo record - safe to delete',
    calls: [{ time: '2024-01-15T13:05:00', label: 'Mo 15.01 · 13:05 Uhr' }],
  },
];

const DEFAULT_LOG = [
  { id: 'demo_l1', name: 'Demo Customer', phone: '+49 000 000000', type: 'in', time: '11:32', ts: Date.now() - 6e6 },
  { id: 'demo_l2', name: 'VIP Demo', phone: '+49 000 111111', type: 'miss', time: '13:05', ts: Date.now() - 4e6 },
  { id: 'demo_l3', name: '', phone: '+49 000 222222', type: 'in', time: '15:01', ts: Date.now() - 2e6 },
];

export const store = {
  getCustomers() {
    return load(KEYS.CUSTOMERS, DEFAULT_CUSTOMERS).map(ensureId);
  },

  saveCustomers(list) {
    save(KEYS.CUSTOMERS, list.map(ensureId));
  },

  findByPhone(phone) {
    return this.getCustomers().find(customer => customer.phone === phone) || null;
  },

  findById(id) {
    return this.getCustomers().find(customer => customer.id === id) || null;
  },

  upsertCustomer(record) {
    const list = this.getCustomers();
    const index = record.id
      ? list.findIndex(customer => customer.id === record.id)
      : list.findIndex(customer => customer.phone === record.phone);

    if (index >= 0) {
      const existing = list[index];
      list[index] = {
        ...existing,
        ...record,
        id: existing.id,
        calls: record.calls?.length ? [...record.calls, ...(existing.calls || [])] : (existing.calls || []),
        updatedAt: new Date().toISOString(),
      };
      this.saveCustomers(list);
      return list[index];
    }

    const customer = ensureId({
      ...record,
      calls: record.calls || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    list.unshift(customer);
    this.saveCustomers(list);
    return customer;
  },

  deleteCustomer(id) {
    const list = this.getCustomers();
    const found = list.find(customer => customer.id === id) || null;
    this.saveCustomers(list.filter(customer => customer.id !== id));
    return found;
  },

  getLog() {
    return load(KEYS.CALL_LOG, DEFAULT_LOG);
  },

  addLogEntry(entry) {
    const log = this.getLog();
    const next = {
      ...entry,
      id: `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ts: Date.now(),
    };
    log.unshift(next);
    save(KEYS.CALL_LOG, log.slice(0, 200));
  },


  getInsights() {
    const customers = this.getCustomers();
    const log = this.getLog();
    return {
      customers: customers.length,
      vip: customers.filter(c => String(c.cat || '').toLowerCase() === 'vip').length,
      withAddress: customers.filter(c => c.addr).length,
      calls: log.length,
    };
  },

  exportBackup() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      customers: this.getCustomers(),
      callLog: this.getLog(),
      googleSheets: this.getGSConfig(),
    };
  },

  importBackup(backup) {
    if (!backup || !Array.isArray(backup.customers)) {
      throw new Error('Invalid backup file.');
    }
    this.saveCustomers(backup.customers.map(ensureId));
    if (Array.isArray(backup.callLog)) save(KEYS.CALL_LOG, backup.callLog);
    return this.getCustomers();
  },

  getSIPConfig() {
    return load(KEYS.SIP_CONFIG, DEFAULT_SIP_CONFIG);
  },

  saveSIPConfig(config) {
    save(KEYS.SIP_CONFIG, { ...DEFAULT_SIP_CONFIG, ...config });
  },

  getGSConfig() {
    return load(KEYS.GS_CONFIG, DEFAULT_GS_CONFIG);
  },

  saveGSConfig(config) {
    save(KEYS.GS_CONFIG, { ...DEFAULT_GS_CONFIG, ...config });
  },
};
