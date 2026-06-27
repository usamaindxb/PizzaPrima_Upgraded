import { store } from './store.js';
import { mapsHref, mailHref, nowLabel, phoneHref, showToast, whatsappHref } from './utils.js';

export class CustomerForm {
  constructor(container, { onSaved, onDeleted }) {
    this.container = container;
    this.onSaved = onSaved;
    this.onDeleted = onDeleted;
    this._activePhone = null;
    this._editingId = null;
    this._originalCustomer = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div id="activeBanner" style="display:none" class="active-banner">
        <div class="ab-dot"></div>
        <span class="ab-txt" id="bannerTxt">Eingehender Anruf</span>
        <span class="ab-num" id="bannerNum"></span>
      </div>

      <div class="form-header">
        <div class="form-title" id="fTitle">Kundendaten eingeben</div>
        <div class="form-sub" id="fSub">Während des Anrufs ausfüllen und speichern</div>
      </div>

      <div class="form-body">
        <div class="fg2">
          <div class="ff">
            <label for="f_name">Name</label>
            <input id="f_name" type="text" placeholder="Max Mustermann" autocomplete="name" />
          </div>
          <div class="ff">
            <label for="f_phone">Telefon</label>
            <input id="f_phone" type="tel" placeholder="+49 XXX XXXXXX" />
          </div>
        </div>

        <div class="ff">
          <label for="f_addr">Adresse</label>
          <input id="f_addr" type="text" placeholder="Musterstraße 12, 48143 Münster" />
        </div>

        <div class="fg2">
          <div class="ff">
            <label for="f_plz">PLZ</label>
            <input id="f_plz" type="text" placeholder="48XXX" maxlength="5" />
          </div>
          <div class="ff">
            <label for="f_cat">Kategorie</label>
            <select id="f_cat">
              <option value="">— wählen —</option>
              <option>Stammkunde</option>
              <option>Neukunde</option>
              <option>VIP</option>
              <option>Lieferant</option>
              <option>Sonstiges</option>
            </select>
          </div>
        </div>

        <div class="ff">
          <label for="f_email">E-Mail</label>
          <input id="f_email" type="email" placeholder="kunde@beispiel.de" />
        </div>

        <div class="ff">
          <label for="f_order">Letzte Bestellung</label>
          <input id="f_order" type="text" placeholder="z.B. Pizza Salami groß, Cola…" />
        </div>

        <div class="ff">
          <label for="f_notes">Notizen</label>
          <textarea id="f_notes" placeholder="Lieferpräferenzen, Allergien, Stammbestellung…"></textarea>
        </div>

        <div id="quickActions" class="quick-actions" style="display:none">
          <a id="qaCall" class="qa-btn" href="#"><i class="ti ti-phone"></i> Anrufen</a>
          <a id="qaWhatsApp" class="qa-btn" href="#" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp"></i> WhatsApp</a>
          <a id="qaMail" class="qa-btn" href="#"><i class="ti ti-mail"></i> E-Mail</a>
          <a id="qaMap" class="qa-btn" href="#" target="_blank" rel="noopener"><i class="ti ti-map-pin"></i> Route</a>
        </div>

        <div id="dupWarning" style="display:none" class="notice n-warn compact-note"></div>

        <div id="histBlock" style="display:none">
          <div class="sec-label" style="margin-bottom:6px">Anrufverlauf</div>
          <div id="histItems"></div>
        </div>

        <div id="formToast"></div>
      </div>

      <div class="form-footer">
        <button class="btn btn-primary btn-glow" id="btnSave">
          <i class="ti ti-device-floppy"></i> Speichern
        </button>
        <button class="btn btn-sec" id="btnClear">Leeren</button>
        <button class="btn btn-danger" id="btnDelete" style="display:none">
          <i class="ti ti-trash"></i> Löschen
        </button>
      </div>`;

    document.getElementById('btnSave').addEventListener('click', () => this._save());
    document.getElementById('btnClear').addEventListener('click', () => this.clear());
    document.getElementById('btnDelete').addEventListener('click', () => this._delete());
    document.getElementById('f_phone').addEventListener('input', () => this._checkDuplicate());
  }

  /** Load a customer record into the form */
  load(customer) {
    this._editingId = customer.id || null;
    this._originalCustomer = { ...customer };
    document.getElementById('btnDelete').style.display = customer.id ? 'inline-flex' : 'none';
    document.getElementById('btnSave').innerHTML = '<i class="ti ti-edit"></i> Änderungen speichern';
    document.getElementById('f_name').value  = customer.name  || '';
    document.getElementById('f_phone').value = customer.phone || '';
    document.getElementById('f_email').value = customer.email || '';
    document.getElementById('f_addr').value  = customer.addr  || '';
    document.getElementById('f_plz').value   = customer.plz   || '';
    document.getElementById('f_cat').value   = customer.cat   || '';
    document.getElementById('f_order').value = customer.order || '';
    document.getElementById('f_notes').value = customer.notes || '';
    this._updateQuickActions(customer);
    this._checkDuplicate();

    document.getElementById('fTitle').textContent = customer.name || 'Kundendaten bearbeiten';
    document.getElementById('fSub').textContent   = (customer.cat || '') + (customer.phone ? ' · ' + customer.phone : '');

    // Call history
    const calls = customer.calls || [];
    const histBlock = document.getElementById('histBlock');
    const histItems = document.getElementById('histItems');
    if (calls.length) {
      histBlock.style.display = 'block';
      histItems.innerHTML = calls.map(c =>
        `<div class="hist-item"><i class="ti ti-phone" style="font-size:12px"></i>${c.label || c}</div>`
      ).join('');
    } else {
      histBlock.style.display = 'none';
    }

    this._hideBanner();
  }

  /** Pre-fill phone number for unknown caller */
  setIncomingPhone(phone) {
    this._activePhone = phone;
    this._editingId = null;
    this._originalCustomer = null;
    document.getElementById('btnDelete').style.display = 'none';
    document.getElementById('btnSave').innerHTML = '<i class="ti ti-device-floppy"></i> Speichern';
    document.getElementById('f_phone').value = phone;
    document.getElementById('quickActions').style.display = 'none';
    document.getElementById('fTitle').textContent = 'Neuer Kunde';
    document.getElementById('fSub').textContent   = 'Daten während des Anrufs aufnehmen';
    this._showBanner(phone, 'Eingehender Anruf');
    document.getElementById('f_name').focus();
  }

  _showBanner(phone, label = 'Eingehender Anruf') {
    document.getElementById('activeBanner').style.display = 'flex';
    document.getElementById('bannerTxt').textContent = label;
    document.getElementById('bannerNum').textContent = phone;
  }

  _hideBanner() {
    document.getElementById('activeBanner').style.display = 'none';
    this._activePhone = null;
  }

  clear() {
    ['f_name','f_phone','f_email','f_addr','f_plz','f_order','f_notes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f_cat').value = '';
    document.getElementById('fTitle').textContent = 'Kundendaten eingeben';
    document.getElementById('fSub').textContent   = 'Während des Anrufs ausfüllen und speichern';
    document.getElementById('histBlock').style.display = 'none';
    document.getElementById('formToast').innerHTML = '';
    document.getElementById('dupWarning').style.display = 'none';
    document.getElementById('quickActions').style.display = 'none';
    this._editingId = null;
    this._originalCustomer = null;
    document.getElementById('btnDelete').style.display = 'none';
    document.getElementById('btnSave').innerHTML = '<i class="ti ti-device-floppy"></i> Speichern';
    this._hideBanner();
  }


  _updateQuickActions(customer) {
    const quick = document.getElementById('quickActions');
    if (!quick) return;
    quick.style.display = customer?.phone || customer?.email || customer?.addr ? 'grid' : 'none';
    document.getElementById('qaCall').href = phoneHref(customer.phone);
    document.getElementById('qaWhatsApp').href = whatsappHref(customer.phone);
    document.getElementById('qaMail').href = mailHref(customer.email);
    document.getElementById('qaMap').href = mapsHref(customer.addr);
  }

  _checkDuplicate() {
    const node = document.getElementById('dupWarning');
    if (!node) return;
    const phone = document.getElementById('f_phone')?.value.trim();
    const duplicate = phone ? store.getCustomers().find(c => c.phone === phone && c.id !== this._editingId) : null;
    if (duplicate) {
      node.style.display = 'flex';
      node.innerHTML = `<i class="ti ti-alert-triangle"></i> Diese Telefonnummer ist schon bei <strong>${duplicate.name || duplicate.phone}</strong> gespeichert.`;
    } else {
      node.style.display = 'none';
      node.innerHTML = '';
    }
  }

  _save() {
    const phone = document.getElementById('f_phone').value.trim();
    if (!phone) {
      showToast('formToast', '<i class="ti ti-alert-triangle"></i> Telefonnummer ist erforderlich.', 'warn');
      return;
    }

    const duplicate = store.getCustomers().find(c => c.phone === phone && c.id !== this._editingId);
    if (duplicate && !confirm(`Diese Telefonnummer gehört bereits zu ${duplicate.name || 'einem anderen Kunden'}. Trotzdem speichern?`)) {
      return;
    }

    const rec = {
      id: this._editingId,
      name:  document.getElementById('f_name').value.trim(),
      phone,
      email: document.getElementById('f_email').value.trim(),
      addr:  document.getElementById('f_addr').value.trim(),
      plz:   document.getElementById('f_plz').value.trim(),
      cat:   document.getElementById('f_cat').value,
      order: document.getElementById('f_order').value.trim(),
      notes: document.getElementById('f_notes').value.trim(),
      calls: [{ time: new Date().toISOString(), label: nowLabel() }],
    };

    const saved = store.upsertCustomer(rec);
    this._hideBanner();

    this._editingId = saved.id;
    document.getElementById('btnDelete').style.display = 'inline-flex';
    document.getElementById('btnSave').innerHTML = '<i class="ti ti-edit"></i> Änderungen speichern';

    showToast('formToast',
      `<i class="ti ti-check"></i> ${rec.id ? 'Kundendaten aktualisiert.' : 'Neuer Kunde gespeichert.'}`,
      'ok'
    );

    const previousCustomer = this._originalCustomer;
    this._originalCustomer = { ...saved };

    this._updateQuickActions(saved);

    this.onSaved?.(saved, {
      mode: rec.id ? 'update' : 'create',
      previousCustomer,
    });
  }

  _delete() {
    if (!this._editingId) return;
    const customer = store.findById(this._editingId);
    const label = customer?.name || document.getElementById('f_name').value.trim() || 'diesen Kunden';
    if (!confirm(`${label} wirklich löschen? Der Eintrag wird lokal und in Google Sheets entfernt.`)) return;
    const deleted = store.deleteCustomer(this._editingId);
    const previousCustomer = this._originalCustomer;
    this.clear();
    showToast('formToast', '<i class="ti ti-trash"></i> Kunde gelöscht.', 'ok');
    this.onDeleted?.(deleted || customer || previousCustomer);
  }
}
