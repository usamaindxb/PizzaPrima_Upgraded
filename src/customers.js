import { store } from './store.js';
import { vipPill, downloadTextFile, normalizePhone } from './utils.js';

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function customersToCsv(customers) {
  const columns = ['Name', 'Phone', 'Email', 'Address', 'Postcode', 'Category', 'Notes', 'Last order', 'Calls'];
  const rows = customers.map(c => [
    c.name, c.phone, c.email, c.addr, c.plz, c.cat, c.notes, c.order, c.calls?.length || 0,
  ].map(escapeCsv).join(','));
  return [columns.join(','), ...rows].join('\n');
}

export class CustomersView {
  constructor(container, { onSelectCustomer, onDeleteCustomer, onDataChanged }) {
    this.container = container;
    this.onSelectCustomer = onSelectCustomer;
    this.onDeleteCustomer = onDeleteCustomer;
    this.onDataChanged = onDataChanged;
    this._filter = '';
    this._sort = 'recent';
  }

  render() {
    const customers = store.getCustomers();
    const total = customers.length;
    const vip = customers.filter(c => String(c.cat || '').toLowerCase() === 'vip').length;
    const missingAddress = customers.filter(c => !c.addr).length;

    this.container.innerHTML = `
      <div class="customer-hero">
        <div>
          <div class="customer-hero-kicker">Customer Command Center</div>
          <div class="customer-hero-title">${total} Kunden im System</div>
          <div class="mini-metrics"><span>${vip} VIP</span><span>${missingAddress} ohne Adresse</span><span>${store.getLog().length} Anrufe</span></div>
        </div>
        <div class="customer-hero-icon"><i class="ti ti-users-group"></i></div>
      </div>

      <div class="toolbar-row">
        <div class="search-wrap elevated-search">
          <i class="ti ti-search"></i>
          <input class="search-input" id="custSearch" type="text" placeholder="Name, Nummer, Adresse, Bestellung oder Notiz suchen…" value="${this._filter}" />
        </div>
        <select class="smart-select" id="custSort">
          <option value="recent" ${this._sort === 'recent' ? 'selected' : ''}>Neueste zuerst</option>
          <option value="name" ${this._sort === 'name' ? 'selected' : ''}>Name A-Z</option>
          <option value="vip" ${this._sort === 'vip' ? 'selected' : ''}>VIP zuerst</option>
          <option value="calls" ${this._sort === 'calls' ? 'selected' : ''}>Meiste Anrufe</option>
        </select>
      </div>

      <div class="actions-bar">
        <button class="btn btn-sec" id="exportCsv"><i class="ti ti-file-spreadsheet"></i> CSV exportieren</button>
        <button class="btn btn-sec" id="exportJson"><i class="ti ti-download"></i> Backup exportieren</button>
        <button class="btn btn-sec" id="importJson"><i class="ti ti-upload"></i> Backup importieren</button>
        <input id="importFile" type="file" accept="application/json" hidden />
      </div>

      <div id="custTableBody"></div>`;

    document.getElementById('custSearch').addEventListener('input', e => {
      this._filter = e.target.value;
      this._renderTable();
    });
    document.getElementById('custSort').addEventListener('change', e => {
      this._sort = e.target.value;
      this._renderTable();
    });
    document.getElementById('exportCsv').addEventListener('click', () => {
      downloadTextFile(`pizza-prima-customers-${new Date().toISOString().slice(0,10)}.csv`, customersToCsv(store.getCustomers()), 'text/csv');
    });
    document.getElementById('exportJson').addEventListener('click', () => {
      downloadTextFile(`pizza-prima-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(store.exportBackup(), null, 2), 'application/json');
    });
    document.getElementById('importJson').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', e => this._importBackup(e));

    this._renderTable();
  }

  async _importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!confirm('Backup importieren? Aktuelle lokale Kunden werden ersetzt und danach mit Google Sheets synchronisiert.')) return;
      store.importBackup(backup);
      this.onDataChanged?.('imported');
      this.render();
    } catch (err) {
      alert('Backup konnte nicht importiert werden: ' + err.message);
    } finally {
      event.target.value = '';
    }
  }

  _getList() {
    const f = this._filter.toLowerCase();
    const phoneNeedle = normalizePhone(this._filter);
    let list = store.getCustomers().filter(c => {
      if (!f) return true;
      return [c.name, c.phone, c.email, c.addr, c.plz, c.cat, c.order, c.notes]
        .some(v => String(v || '').toLowerCase().includes(f)) || normalizePhone(c.phone).includes(phoneNeedle);
    });

    const byDate = c => new Date(c.updatedAt || c.createdAt || 0).getTime();
    if (this._sort === 'name') list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    if (this._sort === 'vip') list.sort((a, b) => (String(b.cat).toLowerCase() === 'vip') - (String(a.cat).toLowerCase() === 'vip') || byDate(b) - byDate(a));
    if (this._sort === 'calls') list.sort((a, b) => (b.calls?.length || 0) - (a.calls?.length || 0));
    if (this._sort === 'recent') list.sort((a, b) => byDate(b) - byDate(a));
    return list;
  }

  _renderTable() {
    const list = this._getList();
    const body = document.getElementById('custTableBody');
    if (!body) return;

    if (!list.length) {
      body.innerHTML = '<div class="empty"><i class="ti ti-users"></i>Keine Kunden gefunden.</div>';
      return;
    }

    body.innerHTML = `
      <table class="ctbl premium-table">
        <thead>
          <tr>
            <th style="width:28%">Name</th>
            <th style="width:20%">Telefon</th>
            <th style="width:17%">Typ</th>
            <th style="width:18%">Letzte Bestellung</th>
            <th style="width:7%">Anrufe</th>
            <th style="width:10%;text-align:right">Aktion</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(c => `
            <tr data-id="${c.id}" role="button" tabindex="0">
              <td><strong>${c.name || 'Ohne Namen'}</strong> ${vipPill(c.cat)} ${!c.addr ? '<span class="data-chip warn">Adresse fehlt</span>' : ''}</td>
              <td>${c.phone || '—'}</td>
              <td>${c.cat || '—'}</td>
              <td>${c.order || '—'}</td>
              <td style="text-align:center">${c.calls?.length || 0}</td>
              <td class="row-actions">
                <button class="icon-btn edit-customer" title="Bearbeiten" data-id="${c.id}"><i class="ti ti-edit"></i></button>
                <button class="icon-btn danger delete-customer" title="Löschen" data-id="${c.id}"><i class="ti ti-trash"></i></button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    body.querySelectorAll('tr[data-id]').forEach(row => {
      const handler = (e) => {
        if (e.target.closest('button')) return;
        const customer = store.findById(row.dataset.id);
        if (customer) this.onSelectCustomer?.(customer);
      };
      row.addEventListener('click', handler);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(e); });
    });

    body.querySelectorAll('.edit-customer').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const customer = store.findById(btn.dataset.id);
        if (customer) this.onSelectCustomer?.(customer);
      });
    });

    body.querySelectorAll('.delete-customer').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const customer = store.findById(btn.dataset.id);
        if (!customer) return;
        if (!confirm(`${customer.name || customer.phone} wirklich löschen? Der Eintrag wird lokal und in Google Sheets entfernt.`)) return;
        const deleted = store.deleteCustomer(customer.id);
        this.onDeleteCustomer?.(deleted || customer);
        this._renderTable();
      });
    });
  }
}
