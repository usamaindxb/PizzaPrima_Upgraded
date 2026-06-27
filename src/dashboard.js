import { store } from './store.js';

function todayKey(ts) {
  const d = ts ? new Date(ts) : new Date();
  return d.toISOString().slice(0, 10);
}

function pct(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export class DashboardView {
  constructor(container, { onOpenCustomer, onOpenSettings }) {
    this.container = container;
    this.onOpenCustomer = onOpenCustomer;
    this.onOpenSettings = onOpenSettings;
  }

  render() {
    const customers = store.getCustomers();
    const log = store.getLog();
    const today = todayKey();
    const todayCalls = log.filter(entry => todayKey(entry.ts || Date.now()) === today);
    const vip = customers.filter(c => String(c.cat || '').toLowerCase() === 'vip');
    const complete = customers.filter(c => c.name && c.phone && c.addr && c.order);
    const recent = [...customers]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 5);
    const gs = store.getGSConfig();

    this.container.innerHTML = `
      <div class="dashboard-hero">
        <div>
          <div class="customer-hero-kicker">Operations cockpit</div>
          <div class="dashboard-title">Pizza Prima läuft im Control-Tower-Modus</div>
          <p class="dashboard-sub">Live customer intelligence, calls, Google Sheets status and useful actions in one place.</p>
        </div>
        <div class="dashboard-orb"><i class="ti ti-dashboard"></i></div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card"><span>Kunden</span><strong>${customers.length}</strong><small>gesamt gespeichert</small></div>
        <div class="kpi-card"><span>Heute</span><strong>${todayCalls.length}</strong><small>Anrufe im Verlauf</small></div>
        <div class="kpi-card"><span>VIP</span><strong>${vip.length}</strong><small>${pct(vip.length, customers.length)} der Kunden</small></div>
        <div class="kpi-card"><span>Datenqualität</span><strong>${pct(complete.length, customers.length)}</strong><small>Name + Telefon + Adresse + Bestellung</small></div>
      </div>

      <div class="insight-grid">
        <section class="insight-card">
          <div class="insight-head"><div><strong>Google Sheets Sync</strong><small>Realtime mirror status</small></div><i class="ti ti-table"></i></div>
          <div class="sync-big ${gs.connected ? 'ok' : 'warn'}">${gs.connected ? 'Connected' : 'Local only'}</div>
          <p>${gs.connected ? 'Every save, edit and delete mirrors the full customer list to your Sheet.' : 'Connect a Web App URL ending in /exec to enable cloud sync.'}</p>
          <button class="btn btn-sec" id="dashSheets"><i class="ti ti-settings"></i> Open Sheets setup</button>
        </section>
        <section class="insight-card">
          <div class="insight-head"><div><strong>Recent customers</strong><small>Fast access</small></div><i class="ti ti-users"></i></div>
          <div class="recent-list">
            ${recent.length ? recent.map(c => `
              <button class="recent-chip" data-id="${c.id}">
                <span>${c.name || c.phone || 'Unnamed customer'}</span>
                <small>${c.cat || 'No category'} · ${c.phone || 'No phone'}</small>
              </button>`).join('') : '<div class="empty mini">No customers yet.</div>'}
          </div>
        </section>
      </div>`;

    this.container.querySelector('#dashSheets')?.addEventListener('click', () => this.onOpenSettings?.('sheets'));
    this.container.querySelectorAll('.recent-chip').forEach(button => {
      button.addEventListener('click', () => {
        const customer = store.findById(button.dataset.id);
        if (customer) this.onOpenCustomer?.(customer);
      });
    });
  }
}
