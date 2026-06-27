import { nowTime, vipPill } from './utils.js';

export class CallPopup {
  constructor(container) {
    this.container = container;
    this._onOpen = null;
    this._onDismiss = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="popup-overlay" id="popupOverlay" style="display:none">
        <div class="popup-card" id="popupCard">
          <div class="popup-header">
            <div class="ph-left">
              <i class="ti ti-phone-incoming ph-icon"></i>
              <div>
                <div class="ph-title">Eingehender Anruf</div>
                <div class="ph-sub" id="popupTime"></div>
              </div>
            </div>
            <button class="ph-close" id="popupClose" aria-label="Schließen">
              <i class="ti ti-x"></i>
            </button>
          </div>
          <div class="popup-body">
            <div class="popup-number" id="popupNumber"></div>
            <div id="popupContent"></div>
            <div class="popup-actions">
              <button class="btn btn-primary" id="popupOpenBtn">
                <i class="ti ti-user"></i> Kundendaten öffnen
              </button>
              <button class="btn btn-sec" id="popupDismissBtn">Ignorieren</button>
            </div>
          </div>
        </div>
      </div>`;

    document.getElementById('popupClose').addEventListener('click', () => this.hide());
    document.getElementById('popupDismissBtn').addEventListener('click', () => this.hide());
    document.getElementById('popupOpenBtn').addEventListener('click', () => {
      this._onOpen?.();
      this.hide();
    });
  }

  show({ number, customer, onOpen }) {
    this._onOpen = onOpen;

    document.getElementById('popupTime').textContent = nowTime();
    document.getElementById('popupNumber').textContent = number;

    const content = document.getElementById('popupContent');
    if (customer) {
      content.innerHTML = `
        <div class="popup-known">
          <div class="pk-name">${customer.name} ${vipPill(customer.cat)}</div>
          ${customer.addr ? `<div class="pk-detail"><i class="ti ti-map-pin" style="font-size:11px;margin-right:3px"></i>${customer.addr}</div>` : ''}
          ${customer.order ? `<div class="pk-detail"><i class="ti ti-pizza" style="font-size:11px;margin-right:3px"></i>${customer.order}</div>` : ''}
          ${customer.calls?.length ? `<div class="pk-detail"><i class="ti ti-history" style="font-size:11px;margin-right:3px"></i>${customer.calls.length} frühere Anruf(e)</div>` : ''}
          ${customer.notes ? `<div class="pk-detail" style="margin-top:5px;font-style:italic;color:#5F5E5A">"${customer.notes}"</div>` : ''}
        </div>`;
    } else {
      content.innerHTML = `
        <span class="popup-new-badge">Neue Nummer</span>
        <div class="popup-new-txt">Kein Eintrag gefunden – bitte Daten aufnehmen.</div>`;
    }

    document.getElementById('popupOverlay').style.display = 'block';

    // Auto-dismiss after 30 seconds
    clearTimeout(this._autoHide);
    this._autoHide = setTimeout(() => this.hide(), 30000);
  }

  hide() {
    clearTimeout(this._autoHide);
    document.getElementById('popupOverlay').style.display = 'none';
    this._onDismiss?.();
  }
}
