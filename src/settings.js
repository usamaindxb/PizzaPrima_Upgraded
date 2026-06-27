import { store } from './store.js';
import { FRITZBOX_SIP } from './sip.js';
import { SheetsSync, isValidAppsScriptExecUrl } from './sheets.js';
import { showToast } from './utils.js';

export class SettingsView {
  constructor(container, { sipManager, onSIPConnected, onSIPDisconnected, onSheetsConnected }) {
    this.container         = container;
    this.sipManager        = sipManager;
    this.onSIPConnected    = onSIPConnected;
    this.onSIPDisconnected = onSIPDisconnected;
    this.onSheetsConnected = onSheetsConnected;
  }

  renderSIP() {
    const cfg = store.getSIPConfig();

    this.container.innerHTML = `
      <!-- Fritz!Box info box -->
      <div class="vf-box">
        <div class="vf-header">
          <div class="vf-logo" style="background:#0059A3">
            <i class="ti ti-router"></i>
          </div>
          <div>
            <div class="vf-title" style="color:#003D73">FRITZ!Box 6490 Cable</div>
            <div class="vf-sub" style="color:#005A9E">Internes IP-Telefon via LAN/WLAN · Vodafone (NRW/Hessen)</div>
          </div>
        </div>

        <div class="field-row">
          <label>Registrar <span class="prefill-tag">Fritz!Box</span></label>
          <div class="field-box prefilled">${FRITZBOX_SIP.registrar} &nbsp;·&nbsp; ${FRITZBOX_SIP.registrarAlt}</div>
        </div>
        <div class="field-row">
          <label>WebSocket-Port <span class="prefill-tag">Fritz!Box</span></label>
          <div class="field-box prefilled">${FRITZBOX_SIP.wsPort} (WSS) · Pfad: ${FRITZBOX_SIP.wsPath}</div>
        </div>
        <div class="field-row">
          <label>Rufnummern <span class="prefill-tag">Vodafone</span></label>
          <div class="field-box prefilled" style="line-height:1.8">
            ${FRITZBOX_SIP.numbers.join('<br>')}
          </div>
        </div>

        <hr class="divider" style="border-color:#B5D0E8" />

        <div class="field-row">
          <label>Benutzername</label>
          <div class="field-box">
            <input type="text" id="sipUser"
              placeholder="Fritz!Box SIP username"
              value="${cfg.user || ''}"
              autocomplete="username" />
          </div>
        </div>
        <div class="field-row">
          <label>Kennwort</label>
          <div class="field-box">
            <input type="password" id="sipPass"
              placeholder="Fritz!Box SIP-Kennwort"
              autocomplete="current-password" />
          </div>
        </div>
        <div class="field-row">
          <label>Registrar</label>
          <div class="field-box">
            <input type="text" id="sipRegistrar"
              value="${cfg.registrar || FRITZBOX_SIP.registrar}"
              placeholder="fritz.box oder 192.168.178.1" />
          </div>
        </div>
        <div class="field-row">
          <label>Ausgehende Rufnr.</label>
          <div class="field-box">
            <select id="sipNumber" style="width:100%;border:none;background:transparent;font-size:12.5px;color:var(--text);font-family:var(--font);outline:none">
              ${FRITZBOX_SIP.numbers.map(n =>
                `<option value="${n}" ${cfg.number === n ? 'selected' : ''}>${n}</option>`
              ).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="notice n-info" style="margin-bottom:12px">
        <i class="ti ti-info-circle"></i>
        <div>
          Benutzername und Kennwort finden Sie in Ihrer Fritz!Box unter
          <strong>Telefonie → Telefoniegeräte → IP-Telefon → Anmeldedaten</strong>.
          <br>Fritz!Box Admin-Seite: <strong><a href="http://fritz.box" target="_blank" style="color:var(--blue)">http://fritz.box</a></strong>
          &nbsp;oder&nbsp;
          <strong><a href="http://192.168.178.1" target="_blank" style="color:var(--blue)">http://192.168.178.1</a></strong>
        </div>
      </div>

      <div id="sipNotice" class="notice n-warn" style="margin-bottom:10px">
        <i class="ti ti-alert-triangle"></i>
        Bitte Kennwort eingeben. Benutzername ist bereits vorausgefüllt.
      </div>

      <div id="sipBtnArea">
        <button class="btn btn-primary" id="btnSIPConnect">
          <i class="ti ti-plug"></i> Mit Fritz!Box verbinden
        </button>
      </div>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="sec-label">Wie es funktioniert</div>
        <div class="step-list">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-txt">
              Ihr PC / Laptop muss im selben Netzwerk wie die Fritz!Box sein (LAN-Kabel oder WLAN <strong>your restaurant Wi-Fi</strong>).
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-txt">
              Die App meldet sich als <strong>IP-Telefon</strong> an der Fritz!Box an —
              genau wie "IP-Telefon 1" in Ihrer Geräteliste. Klingelt die Festnetzleitung,
              erscheint das Popup sofort auf Ihrem Bildschirm.
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-txt">
              Die Fritz!Box leitet Anrufe von Vodafone automatisch weiter —
              keine weiteren Vodafone-Zugangsdaten erforderlich.
            </div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-txt">
              In der Fritz!Box unter <strong>Telefoniegeräte → Neues Gerät → LAN/WLAN (IP-Telefon)</strong>
              einen neuen Eintrag für diesen Browser anlegen und die angezeigten Anmeldedaten hier eintragen.
            </div>
          </div>
        </div>
      </div>

      <div id="sipToast" style="margin-top:10px"></div>`;

    document.getElementById('btnSIPConnect').addEventListener('click', () => this._connectSIP());

    if (this.sipManager?.connected) this._showSIPConnected(cfg.registrar || FRITZBOX_SIP.registrar);
  }

  async _connectSIP() {
    const user      = document.getElementById('sipUser')?.value.trim();
    const pass      = document.getElementById('sipPass')?.value.trim();
    const number    = document.getElementById('sipNumber')?.value;
    const registrar = document.getElementById('sipRegistrar')?.value.trim() || FRITZBOX_SIP.registrar;

    if (!user || !pass) {
      showToast('sipToast', '<i class="ti ti-alert-triangle"></i> Bitte Benutzername und Kennwort eingeben.', 'warn');
      return;
    }

    const btn = document.getElementById('btnSIPConnect');
    btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Verbinde mit Fritz!Box…';
    btn.disabled = true;

    store.saveSIPConfig({ user, pass, number, registrar, connected: false });

    const ok = await this.sipManager.connect({ user, pass, number, registrar });

    if (ok) {
      store.saveSIPConfig({ user, pass, number, registrar, connected: true });
      this._showSIPConnected(registrar);
      showToast('sipToast', '<i class="ti ti-check"></i> Fritz!Box verbunden! Eingehende Anrufe erscheinen jetzt als Popup.', 'ok');
      this.onSIPConnected?.();
    } else {
      btn.innerHTML = '<i class="ti ti-plug"></i> Erneut versuchen';
      btn.disabled = false;
      showToast('sipToast',
        '<i class="ti ti-alert-triangle"></i> Verbindung fehlgeschlagen. Prüfen Sie: 1) PC im selben Netz wie Fritz!Box? 2) Kennwort korrekt? 3) Neues IP-Telefon in Fritz!Box angelegt?',
        'warn'
      );
    }
  }

  _showSIPConnected(registrar) {
    const notice  = document.getElementById('sipNotice');
    const btnArea = document.getElementById('sipBtnArea');
    if (notice) {
      notice.className = 'notice n-ok';
      notice.innerHTML = `<i class="ti ti-check"></i> Verbunden mit <strong>${registrar}</strong> (Fritz!Box 6490 Cable) – Festnetz aktiv, Popup erscheint bei Anruf.`;
    }
    if (btnArea) {
      btnArea.innerHTML = `
        <div style="display:flex;gap:8px">
          <div class="btn-connected" style="flex:1">
            <i class="ti ti-check" style="font-size:13px;vertical-align:-1px;margin-right:4px"></i>
            Verbunden · ${registrar}
          </div>
          <button class="btn btn-sec" style="width:auto;padding:9px 14px" id="btnSIPDisconnect">
            Trennen
          </button>
        </div>`;
      document.getElementById('btnSIPDisconnect')?.addEventListener('click', () => {
        this.sipManager.disconnect();
        this.onSIPDisconnected?.();
        this.renderSIP();
      });
    }
  }

  // ── Google Sheets ──────────────────────────────────────────────

  renderSheets() {
    const cfg = store.getGSConfig();

    this.container.innerHTML = `
      <div class="notice n-info" style="margin-bottom:14px">
        <i class="ti ti-table"></i>
        <div>
          Jeder gespeicherte Kunde wird automatisch in Ihr Google Sheet übertragen.<br>
          <strong>Wichtig:</strong> Schreiben funktioniert nicht mit einem API-Schlüssel allein. Verwenden Sie die Google Apps Script Web-App-URL.
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
        <div class="field-row" style="margin-bottom:0">
          <label>Web-App-URL</label>
          <div class="field-box">
            <input type="url" id="gsWebAppUrl" placeholder="https://script.google.com/macros/s/.../exec" value="${cfg.webAppUrl || ''}" />
          </div>
        </div>
        <div class="field-row" style="margin-bottom:0">
          <label>Blattname</label>
          <div class="field-box">
            <input type="text" id="gsSheet" value="${cfg.sheetName || 'Customers'}" />
          </div>
        </div>
      </div>

      <div id="gsNotice" class="notice n-warn" style="margin-bottom:10px">
        <i class="ti ti-alert-triangle"></i>
        Apps Script Web-App-URL eingeben, um die Synchronisierung zu aktivieren.
      </div>

      <div id="gsBtnArea">
        <button class="btn btn-primary" id="btnGSConnect">
          <i class="ti ti-table"></i> Google Sheets verbinden & testen
        </button>
      </div>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="sec-label">Einrichtung</div>
        <div class="step-list">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-txt">Google Sheet öffnen → <strong>Erweiterungen → Apps Script</strong></div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-txt">Den Code aus <code>google-apps-script.gs</code> einfügen und speichern</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-txt"><strong>Bereitstellen → Neue Bereitstellung → Web-App</strong>: Ausführen als <strong>Ich</strong>, Zugriff <strong>Jeder mit dem Link</strong></div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-txt">Die Web-App-URL, die auf <code>/exec</code> endet, hier einfügen und testen</div>
          </div>
        </div>
      </div>

      <div id="gsToast" style="margin-top:10px"></div>`;

    document.getElementById('btnGSConnect').addEventListener('click', () => this._connectSheets());

    if (cfg.connected && isValidAppsScriptExecUrl(cfg.webAppUrl)) this._showSheetsConnected(cfg.sheetName || 'Customers');
    if (cfg.connected && cfg.webAppUrl && !isValidAppsScriptExecUrl(cfg.webAppUrl)) {
      store.saveGSConfig({ webAppUrl: '', sheetName: cfg.sheetName || 'Customers', connected: false });
      showToast('gsToast', '<i class="ti ti-alert-triangle"></i> Gespeicherte Apps-Script-Editor-URL wurde entfernt. Bitte die Web-App-URL mit /exec einfügen.', 'warn');
    }
  }

  async _connectSheets() {
    const webAppUrl = document.getElementById('gsWebAppUrl')?.value.trim();
    const sheetName = document.getElementById('gsSheet')?.value.trim() || 'Customers';

    if (!webAppUrl) {
      showToast('gsToast', '<i class="ti ti-alert-triangle"></i> Google Apps Script Web-App-URL ist erforderlich.', 'warn');
      return;
    }

    if (!isValidAppsScriptExecUrl(webAppUrl)) {
      showToast('gsToast', '<i class="ti ti-alert-triangle"></i> Bitte die Web-App-URL verwenden, die mit /exec endet. Nicht die Apps-Script-Editor-URL /home/projects/.../edit verwenden.', 'warn');
      return;
    }

    const btn = document.getElementById('btnGSConnect');
    btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Teste Verbindung…';
    btn.disabled = true;

    try {
      const sync  = new SheetsSync({ webAppUrl, sheetName });
      const title = await sync.testConnection();
      store.saveGSConfig({ webAppUrl, sheetName, connected: true });
      this._showSheetsConnected(sheetName);
      showToast('gsToast', `<i class="ti ti-check"></i> Verbunden mit "<strong>${title}</strong>" – Synchronisierung aktiv.`, 'ok');
      this.onSheetsConnected?.({ webAppUrl, sheetName });
    } catch (err) {
      showToast('gsToast', `<i class="ti ti-alert-triangle"></i> Fehler: ${err.message}`, 'warn');
      btn.innerHTML = '<i class="ti ti-table"></i> Erneut versuchen';
      btn.disabled = false;
    }
  }

  _showSheetsConnected(sheetName) {
    const notice  = document.getElementById('gsNotice');
    const btnArea = document.getElementById('gsBtnArea');
    if (notice) {
      notice.className = 'notice n-ok';
      notice.innerHTML = `<i class="ti ti-check"></i> Verbunden mit <strong>${sheetName}</strong> – Kundendaten werden automatisch synchronisiert.`;
    }
    if (btnArea) {
      btnArea.innerHTML = `<div class="btn-connected"><i class="ti ti-check" style="font-size:13px;vertical-align:-1px;margin-right:4px"></i>Synchronisierung aktiv – ${sheetName}</div>`;
    }
  }

}
