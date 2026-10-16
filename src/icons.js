const paths = {
  chip: '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  circuit: '<path d="M3 6h7v12H3M10 12h11M6 3v18M17 7v10"/>',
  book: '<path d="M12 6c-3-3-7-3-10-2v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2zm0 0v15"/>',
  map: '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zm0 0v15m6-12v15"/>',
  graph:
    '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 5h10M6 7l5 10m7-10-5 10"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  github:
    '<path d="M9 19c-4.3 1.3-4.3-2-6-2m12 4v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6a4.3 4.3 0 0 0-.1-3.3S17.3 2.4 15 4a11.5 11.5 0 0 0-6 0C6.7 2.4 5.7 2.7 5.7 2.7A4.3 4.3 0 0 0 5.6 6a4.7 4.7 0 0 0-1.3 3.3c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/>',
  sliders:
    '<path d="M4 7h5m5 0h6M4 17h10m5 0h1"/><circle cx="11" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  bulb: '<path d="M9 18h6m-5 3h4m-5-7c-5-3-3-11 3-11s8 8 3 11v2H9z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  wave: '<path d="M2 12h3V4h5v16h5V8h5v4h2"/>',
  resistor: '<path d="M2 12h4l2-5 3 10 3-10 2 5h6"/>',
  capacitor: '<path d="M2 12h7m0-7v14m6-14v14m0-7h7"/>',
  switch:
    '<path d="M2 15h5m0 0 10-8m0 8h5"/><circle cx="7" cy="15" r="1.5"/><circle cx="17" cy="15" r="1.5"/>',
  source:
    '<path d="M9 18H6a3 3 0 0 1-3-3v-3m12-6h3a3 3 0 0 1 3 3v3M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
};
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.chip}</svg>`;
export const escapeHTML = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
