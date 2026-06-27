import './styles/main.css';

import { store }         from './store.js';
import { SIPManager, FRITZBOX_SIP } from './sip.js';
import { SheetsSync, isValidAppsScriptExecUrl } from './sheets.js';
import { CallPopup }     from './popup.js';
import { CallLogView }   from './calllog.js';
import { CustomersView } from './customers.js';
import { CustomerForm }  from './form.js';
import { SettingsView }  from './settings.js';
import { DashboardView } from './dashboard.js';
import { nowTime, nowLabel } from './utils.js';

// ── Spinner keyframe (for loading buttons) ──
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// ── Build shell HTML ──
document.getElementById('app').innerHTML = `
  <!-- Top bar -->
  <div class="topbar">
    <div class="brand">
      <div class="brand-icon">🍕</div>
      <div>
        <div class="brand-name">Pizza Prima</div>
        <div class="brand-sub">Premium Call CRM &mdash; Germany</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="pill" id="vfPill">
        <i class="ti ti-router" style="font-size:13px"></i>
        Fritz!Box · Vodafone
      </div>
      <div class="pill" id="sipPill">
        <span class="sip-dot" id="sipDot"></span>
        <span id="sipLabel">SIP: nicht verbunden</span>
      </div>
      <div class="pill" id="gsPill">
        <i class="ti ti-table" style="font-size:13px"></i>
        <span id="gsLabel">Lokal</span>
      </div>
    </div>
  </div>

  <!-- Popup mount point -->
  <div id="popupMount"></div>

  <!-- Main grid -->
  <div class="main">
    <div class="left-panel">
      <!-- Simulate strip -->
      <div class="sim-strip">
        <span class="sim-label">
          <i class="ti ti-device-landline" style="font-size:14px;vertical-align:-2px;margin-right:3px"></i>
          Testanruf simulieren:
        </span>
        <button class="sim-btn" id="simKnown">
          <i class="ti ti-phone-incoming"></i> Stammkunde
        </button>
        <button class="sim-btn" id="simUnknown">
          <i class="ti ti-phone-incoming"></i> Unbekannte Nr.
        </button>
        <button class="sim-btn" id="simVIP">
          <i class="ti ti-phone-incoming"></i> VIP-Kunde
        </button>
      </div>

      <!-- Card with tabs -->
      <div class="card glass-card" style="flex:1">
        <div class="tabs">
          <div class="tab active" data-tab="dashboard">Dashboard</div>
          <div class="tab" data-tab="log">Anrufliste</div>
          <div class="tab" data-tab="customers">Kunden</div>
          <div class="tab" data-tab="sip">Fritz!Box SIP</div>
          <div class="tab" data-tab="sheets">Google Sheets</div>
        </div>
        <div id="tabContent"></div>
      </div>
    </div>

    <!-- Right panel: customer form -->
    <div class="right-panel" id="rightPanel"></div>
  </div>`;

// ── Instantiate modules ──
let sheetsSync  = null;
let activeTab   = 'dashboard';

// Restore Google Sheets sync after page reload.
// Previously the UI could show "connected" from localStorage, but sheetsSync stayed null
// until the Connect button was clicked again, so Save only stored customers locally.
const savedGSConfig = store.getGSConfig();
if (savedGSConfig?.connected && isValidAppsScriptExecUrl(savedGSConfig?.webAppUrl)) {
  sheetsSync = new SheetsSync({
    webAppUrl: savedGSConfig.webAppUrl,
    sheetName: savedGSConfig.sheetName || 'Customers',
  });
}

const sipManager = new SIPManager({
  onIncomingCall:  ({ number }) => handleIncomingCall(number),
  onCallEnded:     () => setSIPStatus('ok', 'SIP: verbunden'),
  onRegistered:    () => setSIPStatus('ok', 'SIP: verbunden'),
  onUnregistered:  () => setSIPStatus('offline', 'SIP: nicht verbunden'),
  onError:         (msg) => {
    setSIPStatus('offline', 'SIP: Fehler');
    console.error('[SIP]', msg);
  },
});

const popup = new CallPopup(document.getElementById('popupMount'));

const form = new CustomerForm(document.getElementById('rightPanel'), {
  onSaved: () => {
    syncEntireCustomerList('updated');
    if (['dashboard', 'log', 'customers'].includes(activeTab)) renderTab(activeTab);
  },
  onDeleted: () => {
    syncEntireCustomerList('deleted');
    if (['dashboard', 'log', 'customers'].includes(activeTab)) renderTab(activeTab);
  },
});

const dashboardView = new DashboardView(document.getElementById('tabContent'), {
  onOpenCustomer: (customer) => {
    form.load(customer);
    renderTab('customers');
  },
  onOpenSettings: (tab) => renderTab(tab || 'sheets'),
});

const callLogView = new CallLogView(document.getElementById('tabContent'), {
  onSelectCall: (entry) => {
    const customer = store.findByPhone(entry.phone);
    if (customer) form.load(customer);
    else { form.clear(); document.getElementById('f_phone').value = entry.phone; }
  },
});

const customersView = new CustomersView(document.getElementById('tabContent'), {
  onSelectCustomer: (customer) => form.load(customer),
  onDeleteCustomer: () => {
    syncEntireCustomerList('deleted');
    form.clear();
    if (['dashboard', 'log', 'customers'].includes(activeTab)) renderTab(activeTab);
  },
  onDataChanged: (reason) => {
    syncEntireCustomerList(reason || 'changed');
    if (['dashboard', 'log', 'customers'].includes(activeTab)) renderTab(activeTab);
  },
});

const settingsView = new SettingsView(document.getElementById('tabContent'), {
  sipManager,
  onSIPConnected:    () => setSIPStatus('ok', 'SIP: verbunden'),
  onSIPDisconnected: () => setSIPStatus('offline', 'SIP: nicht verbunden'),
  onSheetsConnected: ({ webAppUrl, sheetName }) => {
    sheetsSync = new SheetsSync({ webAppUrl, sheetName });
    document.getElementById('gsLabel').textContent = 'Google Sheets ✓';
  },
});


function syncEntireCustomerList(reason = 'updated') {
  if (!sheetsSync) {
    alert('Google Sheets ist nicht verbunden. Öffne den Tab Google Sheets und füge die Web-App-URL ein, die mit /exec endet.');
    return;
  }
  const customers = store.getCustomers();
  sheetsSync.syncAllCustomers(customers)
    .then(data => {
      console.info(`[Sheets] Full sync ${reason}:`, data);
    })
    .catch(err => {
      console.warn('[Sheets] Full sync failed:', err);
      alert('Google Sheets konnte nicht synchronisiert werden: ' + err.message);
    });
}

// ── Tab routing ──
function renderTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab)
  );

  const content = document.getElementById('tabContent');

  switch (tab) {
    case 'dashboard':
      dashboardView.container = content;
      dashboardView.render();
      break;
    case 'log':
      callLogView.container = content;
      callLogView.render();
      break;
    case 'customers':
      customersView.container = content;
      customersView.render();
      break;
    case 'sip':
      settingsView.container = content;
      settingsView.renderSIP();
      break;
    case 'sheets':
      settingsView.container = content;
      settingsView.renderSheets();
      break;
  }
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => renderTab(tab.dataset.tab));
});

// ── Incoming call handler ──
function handleIncomingCall(number) {
  const customer = store.findByPhone(number);

  // Log the call
  store.addLogEntry({
    name: customer?.name || '',
    phone: number,
    type: 'in',
    time: nowTime().replace(' Uhr', ''),
  });

  // Update active call indicator
  setSIPStatus('ring', 'Klingelt…');

  // Show popup
  popup.show({
    number,
    customer,
    onOpen: () => {
      if (customer) form.load(customer);
      else form.setIncomingPhone(number);
      setSIPStatus('ok', 'SIP: verbunden');
    },
  });

  // Refresh log if visible
  if (activeTab === 'log') renderTab('log');

  // Browser notification (if permitted)
  sendBrowserNotification(number, customer);
}

// ── Simulate incoming calls ──
const FAKE_NUMBERS = ['+49 000 222222', '+49 000 333333', '+49 000 444444', '+49 000 555555'];

document.getElementById('simKnown').addEventListener('click', () => {
  handleIncomingCall(store.getCustomers()[0].phone);
});
document.getElementById('simVIP').addEventListener('click', () => {
  handleIncomingCall(store.getCustomers()[1].phone);
});
document.getElementById('simUnknown').addEventListener('click', () => {
  const num = FAKE_NUMBERS[Math.floor(Math.random() * FAKE_NUMBERS.length)];
  handleIncomingCall(num);
});

// ── SIP status indicator ──
function setSIPStatus(state, label) {
  const dot = document.getElementById('sipDot');
  const lbl = document.getElementById('sipLabel');
  if (dot) { dot.className = 'sip-dot'; if (state !== 'offline') dot.classList.add(state); }
  if (lbl) lbl.textContent = label;
}

// ── Browser notification ──
async function sendBrowserNotification(number, customer) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'granted') {
    const title = customer ? `📞 ${customer.name}` : '📞 Eingehender Anruf';
    const body  = customer
      ? `${number}\n${customer.addr || ''}`
      : `${number} – Neue Nummer`;
    new Notification(title, { body, icon: '/favicon.svg' });
  }
}

// ── Restore Google Sheets connection on startup ──
const gsCfg = store.getGSConfig();
if (gsCfg.connected && isValidAppsScriptExecUrl(gsCfg.webAppUrl)) {
  sheetsSync = new SheetsSync({ webAppUrl: gsCfg.webAppUrl, sheetName: gsCfg.sheetName });
  document.getElementById('gsLabel').textContent = 'Google Sheets ✓';
} else if (gsCfg.connected && gsCfg.webAppUrl) {
  store.saveGSConfig({ webAppUrl: '', sheetName: gsCfg.sheetName || 'Customers', connected: false });
  document.getElementById('gsLabel').textContent = 'Local';
}

// ── Initial render ──
renderTab('dashboard');
