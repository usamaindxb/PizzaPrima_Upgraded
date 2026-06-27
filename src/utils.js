// ── UI Utilities ──

const AV_COLORS = ['av-r', 'av-g', 'av-a', 'av-gr'];

export function avatarClass(name) {
  if (!name) return 'av-gr';
  return AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];
}

export function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function nowTime() {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

export function nowLabel() {
  const d = new Date();
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
    + ' · ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

export function el(id) { return document.getElementById(id); }

export function showToast(containerId, msg, type = 'ok', duration = 3500) {
  const c = el(containerId);
  if (!c) return;
  c.innerHTML = `<div class="toast t-${type}">${msg}</div>`;
  setTimeout(() => { if (c) c.innerHTML = ''; }, duration);
}

export function setHTML(id, html) {
  const node = el(id);
  if (node) node.innerHTML = html;
}

export function show(id) { const n = el(id); if (n) n.style.display = ''; }
export function hide(id) { const n = el(id); if (n) n.style.display = 'none'; }
export function toggle(id, visible) { visible ? show(id) : hide(id); }

export function badgeHTML(type) {
  const map = { in: ['b-in','Eingehend'], miss: ['b-miss','Verpasst'], out: ['b-out','Ausgehend'] };
  const [cls, label] = map[type] || ['b-out','—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function vipPill(cat) {
  return cat === 'VIP' ? '<span class="vip-pill">VIP</span>' : '';
}

export function normalizePhone(value = '') {
  return String(value).replace(/[^+0-9]/g, '');
}

export function phoneHref(value = '') {
  const normalized = normalizePhone(value);
  return normalized ? `tel:${normalized}` : '#';
}

export function whatsappHref(value = '') {
  const normalized = normalizePhone(value).replace(/^\+/, '');
  return normalized ? `https://wa.me/${normalized}` : '#';
}

export function mailHref(value = '') {
  return value ? `mailto:${encodeURIComponent(value)}` : '#';
}

export function mapsHref(address = '') {
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '#';
}

export function downloadTextFile(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
