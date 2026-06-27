import { store } from './store.js';
import { avatarClass, initials, badgeHTML, setHTML } from './utils.js';

export class CallLogView {
  constructor(container, { onSelectCall }) {
    this.container = container;
    this.onSelectCall = onSelectCall;
  }

  render() {
    const log = store.getLog();
    const total  = log.length;
    const known  = log.filter(c => c.name).length;
    const missed = log.filter(c => c.type === 'miss').length;

    const rows = log.map((entry, i) => {
      const av = avatarClass(entry.name);
      const ini = entry.name
        ? `<span>${initials(entry.name)}</span>`
        : `<i class="ti ti-user-question" style="font-size:13px"></i>`;
      const nameHTML = entry.name
        ? entry.name
        : `<span style="color:var(--text-2)">Unbekannte Nummer</span>`;

      return `
        <div class="call-row" data-index="${i}" role="button" tabindex="0">
          <div class="av ${av}">${ini}</div>
          <div class="cinfo">
            <div class="cname">${nameHTML}</div>
            <div class="cnum">${entry.phone}</div>
          </div>
          <div class="cright">
            <div class="ctime">Heute ${entry.time}</div>
            ${badgeHTML(entry.type)}
          </div>
        </div>`;
    }).join('');

    this.container.innerHTML = `
      <div class="stats-row">
        <div class="stat"><div class="stat-val">${total}</div><div class="stat-lbl">Heute gesamt</div></div>
        <div class="stat"><div class="stat-val">${known}</div><div class="stat-lbl">Bekannt</div></div>
        <div class="stat"><div class="stat-val">${missed}</div><div class="stat-lbl">Verpasst</div></div>
      </div>
      <div id="callRows">${rows || '<div class="empty"><i class="ti ti-phone-off"></i>Noch keine Anrufe heute.</div>'}</div>`;

    this.container.querySelectorAll('.call-row').forEach(row => {
      const handler = () => {
        const idx = parseInt(row.dataset.index);
        const entry = store.getLog()[idx];
        this.onSelectCall?.(entry);
      };
      row.addEventListener('click', handler);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });
  }
}
