/* Office Plus · tableaux de bord du dirigeant · données d'illustration */
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NB = new Intl.NumberFormat('fr-FR');
const n0 = v => NB.format(Math.round(v)).replace(/\u202f|\u00a0/g, ' ');
const pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d).replace('.', ',') : '–') + ' %';
const money = v => { const a = Math.abs(v); if (a >= 1e9) return (v / 1e9).toFixed(2).replace('.', ',') + ' Md'; if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace('.', ',') + ' M'; if (a >= 1e4) return Math.round(v / 1e3) + ' k'; return n0(v); };
const moneyF = v => money(v) + ' F';
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOISL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const fd = d => d.toISOString().slice(0, 10);
const add = (s, n) => { const d = pd(s); d.setUTCDate(d.getUTCDate() + n); return fd(d); };
const diff = (a, b) => Math.round((pd(a) - pd(b)) / 864e5);
const dfr = s => { const d = pd(s); return d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()]; };
const dfrY = s => { const d = pd(s); return d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const dnum = s => s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4);
const ICO = {
  up: '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  dn: '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M7 7l10 10M17 9v8H9"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>'
};
const CATCOL = { fournitures: '#00A877', cartouches: '#111418', materiel: '#F07C1E', mobilier: '#9AA7B4' };
const PAYCOL = { 'Mobile Money': '#F07C1E', 'Virement': '#111418', 'Espèces': '#00A877' };

let D, P = {}, CL = {}, ORD = [], TODAY, charts = [], map = null;
const S = { per: '30j', cat: '', com: '', vend: '' };
const PAGES = {
  matin: ['Le matin du dirigeant', 'Où en est la journée, la semaine et le mois'],
  ventes: ['Ventes', 'Ce qui se vend, à qui et où'],
  clients: ['Clients', 'Qui relancer, qui arrive, qui décroche'],
  stock: ['Stock', 'Ruptures, stock bas et argent immobilisé'],
  commercial: ['Commercial', 'Devis, appels d\'offres et prospection'],
  reseaux: ['Réseaux et site', 'Présence en ligne et demandes reçues']
};

/* ---------- données ---------- */
fetch('data/donnees.json').then(r => r.json()).then(init);
function init(d) {
  D = d; TODAY = d.aujourdhui;
  d.produits.forEach(p => P[p.id] = p);
  d.clients.forEach(c => CL[c.id] = c);
  ORD = d.cmd.map(a => {
    const o = { id: a[0], d: a[1], cl: a[2], vend: a[3], commune: a[4], canal: a[5], pay: a[6], st: a[7], enc: a[8], mt: a[9], cout: a[10], lg: a[11], h: a[12], orig: a[13], bycat: {} };
    o.lg.forEach(([k, q]) => { const p = P[k], b = o.bycat[p.cat] || (o.bycat[p.cat] = [0, 0]); b[0] += p.prix * q; b[1] += p.cout * q; });
    return o;
  });
  $('#maj').textContent = dfrY(TODAY) + ', ' + d.heure;
  fillSel('#f-cat', [['', 'Toutes']].concat(Object.entries(d.cats)));
  fillSel('#f-com', [['', 'Toutes']].concat(d.communes.map(c => [c, c])));
  fillSel('#f-vend', [['', 'Tous']].concat(Object.entries(d.commerciaux)));
  ['per', 'cat', 'com', 'vend'].forEach(k => $('#f-' + k).addEventListener('change', e => { S[k] = e.target.value; render(); }));
  $('#raz').addEventListener('click', () => { Object.assign(S, { per: '30j', cat: '', com: '', vend: '' }); ['per', 'cat', 'com', 'vend'].forEach(k => $('#f-' + k).value = S[k]); render(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDrawer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  window.addEventListener('hashchange', render);
  Chart.defaults.font.family = 'Inter, system-ui, sans-serif'; Chart.defaults.font.size = 11.5; Chart.defaults.color = '#6B7079';
  Chart.defaults.plugins.legend.display = false; Chart.defaults.animation.duration = 500;
  Chart.defaults.plugins.tooltip.backgroundColor = '#111418'; Chart.defaults.plugins.tooltip.padding = 10; Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600' }; Chart.defaults.plugins.tooltip.boxPadding = 4;
  render();
}
function fillSel(sel, opts) { $(sel).innerHTML = opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join(''); }

/* ---------- filtres ---------- */
function range(per = S.per) {
  let a;
  if (per === 'mois') a = TODAY.slice(0, 8) + '01';
  else if (per === '30j') a = add(TODAY, -29);
  else if (per === '90j') a = add(TODAY, -89);
  else a = add(TODAY, -364);
  const len = diff(TODAY, a) + 1;
  let pa, pb;
  if (per === 'mois') { const d = pd(a); d.setUTCMonth(d.getUTCMonth() - 1); pa = fd(d); pb = add(pa, len - 1); }
  else { pb = add(a, -1); pa = add(pb, -(len - 1)); }
  return { a, b: TODAY, pa, pb, len };
}
const amt = o => S.cat ? (o.bycat[S.cat] || [0])[0] : o.mt;
const cost = o => S.cat ? (o.bycat[S.cat] || [0, 0])[1] : o.cout;
function orders(a, b, opt = {}) {
  return ORD.filter(o => o.d >= a && o.d <= b && (opt.noCom || !S.com || o.commune === S.com) && (!S.vend || o.vend === S.vend) && amt(o) > 0);
}
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
function delta(cur, prev, inverse) {
  if (!prev) return '<span class="delta eq">nouveau</span>';
  const v = (cur - prev) / prev, good = inverse ? v < 0 : v >= 0;
  const cls = Math.abs(v) < .005 ? 'eq' : good ? 'up' : 'dn';
  if (cls === 'eq') return '<span class="delta eq">stable</span>';
  const p = Math.round(v * 100);
  return `<span class="delta ${cls}">${v >= 0 ? ICO.up : ICO.dn}${(p > 0 ? '+' : p === 0 ? (v > 0 ? '+' : '−') : '') + (p === 0 ? '<1' : p)} %</span>`;
}
function perLabel() { return { mois: 'mois en cours', '30j': '30 derniers jours', '90j': '90 derniers jours', '12m': '12 derniers mois' }[S.per]; }
function cmpLabel() { return { mois: 'vs même période du mois dernier', '30j': 'vs 30 jours précédents', '90j': 'vs 90 jours précédents', '12m': 'vs 12 mois précédents' }[S.per]; }
function chips(extra) {
  const c = [`<span class="chip">Période : <b>${perLabel()}</b></span>`];
  if (S.cat) c.push(`<span class="chip">Catégorie : <b>${esc(D.cats[S.cat])}</b></span>`);
  if (S.com) c.push(`<span class="chip">Commune : <b>${esc(S.com)}</b></span>`);
  if (S.vend) c.push(`<span class="chip">Commercial : <b>${esc(D.commerciaux[S.vend])}</b></span>`);
  if (extra) c.push(`<span class="chip" style="color:var(--mute)">${extra}</span>`);
  $('#chips').innerHTML = c.join('');
}

/* ---------- rendu ---------- */
function render() {
  const pg = (location.hash || '#matin').slice(1); const page = PAGES[pg] ? pg : 'matin';
  charts.forEach(c => c.destroy()); charts = [];
  if (map) { map.remove(); map = null; }
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.p === page));
  $('#titre').textContent = PAGES[page][0];
  $('#eyebrow').textContent = cap(JOURS[pd(TODAY).getUTCDay()]) + ' ' + dfrY(TODAY) + ' · ' + PAGES[page][1];
  badges();
  ({ matin, ventes, clients, stock, commercial, reseaux })[page]();
  window.scrollTo({ top: 0 });
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function chart(id, cfg) { const el = document.getElementById(id); if (!el) return; const c = new Chart(el, cfg); charts.push(c); return c; }
const gridX = { grid: { display: false }, border: { display: false } };
const gridY = (cb) => ({ grid: { color: '#F0F0EB' }, border: { display: false }, ticks: { callback: cb || (v => money(v)), maxTicksLimit: 5 } });
function spark(id, data, color = '#00A877') {
  chart(id, { type: 'line', data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 1.6, pointRadius: 0, tension: .35, fill: true, backgroundColor: ctx => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 30); g.addColorStop(0, color + '33'); g.addColorStop(1, color + '00'); return g; } }] },
    options: { responsive: false, plugins: { tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false } });
}
function daily(a, b, f = amt, opt) { const m = {}; orders(a, b, opt).forEach(o => m[o.d] = (m[o.d] || 0) + f(o)); const out = []; for (let d = a; d <= b; d = add(d, 1)) out.push(m[d] || 0); return out; }

/* ---------- état clients ---------- */
function clientStats() {
  const st = {};
  ORD.forEach(o => {
    if (o.cl === 'CL000') return;
    const s = st[o.cl] || (st[o.cl] = { id: o.cl, ds: [], ca12: 0, ca90: 0, cap90: 0, n: 0, prods: {} });
    s.ds.push(o.d); s.n++;
    const v = amt(o);
    if (o.d > add(TODAY, -365)) s.ca12 += v;
    if (o.d > add(TODAY, -90)) s.ca90 += v; else if (o.d > add(TODAY, -180)) s.cap90 += v;
    o.lg.forEach(([k, q]) => s.prods[k] = (s.prods[k] || 0) + q);
  });
  Object.values(st).forEach(s => {
    s.ds.sort(); s.last = s.ds[s.ds.length - 1]; s.first = s.ds[0]; s.since = diff(TODAY, s.last);
    const gaps = []; for (let i = 1; i < s.ds.length; i++) gaps.push(diff(s.ds[i], s.ds[i - 1])); gaps.sort((a, b) => a - b);
    s.freq = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
    s.c = CL[s.id];
  });
  return st;
}
function clientOk(c) { return (!S.com || c.commune === S.com) && (!S.vend || c.com === S.vend); }
function aRelancer(st) {
  return Object.values(st).filter(s => clientOk(s.c) && s.since >= 45 && s.freq && s.freq <= 60 && s.n >= 3).sort((a, b) => b.ca12 - a.ca12);
}
function badges() {
  const st = clientStats(); const n = aRelancer(st).filter(s => !relances()[s.id]).length;
  $('#nav-45').textContent = n || '';
  $('#nav-rupt').textContent = D.produits.filter(p => p.stock === 0).length || '';
}
const relances = () => { try { return JSON.parse(localStorage.getItem('op-relances') || '{}'); } catch (e) { return {}; } };

/* =========================================================
   1. LE MATIN
   ========================================================= */
function matin() {
  chips('Les montants du jour, de la semaine et du mois ne dépendent pas de la période choisie');
  const r = range();
  const tO = orders(TODAY, TODAY), tAmt = sum(tO, amt);
  const lw = add(TODAY, -7), lwAmt = sum(orders(lw, lw), amt);
  const dow = (pd(TODAY).getUTCDay() + 6) % 7, wkA = add(TODAY, -dow);
  const wk = sum(orders(wkA, TODAY), amt), wkP = sum(orders(add(wkA, -7), add(TODAY, -7)), amt);
  const mA = TODAY.slice(0, 8) + '01', mo = sum(orders(mA, TODAY), amt);
  const lmA = (() => { const d = pd(mA); d.setUTCMonth(d.getUTCMonth() - 1); return fd(d); })();
  const lmSame = sum(orders(lmA, add(lmA, diff(TODAY, mA))), amt);
  // objectif
  const key = TODAY.slice(0, 7); let objM = D.objectifs[key];
  if (S.cat || S.com || S.vend) { const full = sum(orders(lmA, add(mA, -1)), amt), fullAll = ORD.filter(o => o.d >= lmA && o.d < mA).reduce((s, o) => s + o.mt, 0); objM = objM * (full / fullAll); }
  const ym = pd(mA), dim = new Date(Date.UTC(ym.getUTCFullYear(), ym.getUTCMonth() + 1, 0)).getUTCDate();
  let wdT = 0, wdE = 0; for (let i = 0; i < dim; i++) { const d = add(mA, i), w = pd(d).getUTCDay(); if (w) { wdT++; if (d <= TODAY) wdE++; } }
  const attendu = objM * wdE / wdT, avance = mo - attendu;
  const pO = orders(r.a, r.b), pP = orders(r.pa, r.pb);
  const ca = sum(pO, amt), caP = sum(pP, amt), mg = ca - sum(pO, cost), mgP = caP - sum(pP, cost);
  const pan = pO.length ? ca / pO.length : 0, panP = pP.length ? caP / pP.length : 0;
  const enCours = ORD.filter(o => o.st !== 'Livrée' && (!S.com || o.commune === S.com) && (!S.vend || o.vend === S.vend) && amt(o) > 0);
  const dv = D.devis.filter(v => v.type === 'Devis' && ['Envoyé', 'Relancé', 'Négociation'].includes(v.st) && (!S.vend || v.com === S.vend) && (!S.com || CL[v.cl].commune === S.com) && (!S.cat || v.cat === S.cat));
  const dvOld = dv.filter(v => diff(TODAY, v.d) > 7);
  // encaissements sur la période
  const enc = {}; ORD.forEach(o => { if (o.enc && o.enc >= r.a && o.enc <= r.b && (!S.com || o.commune === S.com) && (!S.vend || o.vend === S.vend) && amt(o) > 0) enc[o.pay] = (enc[o.pay] || 0) + amt(o); });
  const encT = sum(Object.values(enc), x => x);
  const aEnc = ORD.filter(o => !o.enc && o.pay === 'Virement' && (!S.com || o.commune === S.com) && (!S.vend || o.vend === S.vend) && amt(o) > 0);
  const aEncAmt = sum(aEnc, amt), retard = aEnc.filter(o => diff(TODAY, o.d) > 30), retAmt = sum(retard, amt);
  const st = clientStats(), rel = aRelancer(st), ruptures = D.produits.filter(p => p.stock === 0);
  const ao = D.devis.filter(v => v.type !== 'Devis' && v.clo >= TODAY).sort((a, b) => a.clo < b.clo ? -1 : 1);
  const avant10 = tO.filter(o => o.h && o.h < '10:00'), apres10 = tO.filter(o => o.h && o.h >= '10:00');
  const prog = Math.min(1, mo / objM), mark = Math.min(1, attendu / objM);

  $('#page').innerHTML = `
  <div class="g k4">
    <div class="card kpi hero"><div class="lab">Chiffre d'affaires du jour</div><div class="val">${n0(tAmt)}<small>F</small></div>
      <div class="foot">${delta(tAmt, lwAmt)}<span>vs ${JOURS[pd(lw).getUTCDay()]} dernier</span></div><canvas class="spark" id="sp1" width="84" height="30"></canvas></div>
    <div class="card kpi"><div class="lab">Semaine en cours</div><div class="val">${money(wk)}<small>F</small></div>
      <div class="foot">${delta(wk, wkP)}<span>vs même point la semaine dernière</span></div><canvas class="spark" id="sp2" width="84" height="30"></canvas></div>
    <div class="card kpi" style="grid-column:span 2"><div class="lab">Mois de ${MOISL[ym.getUTCMonth()]} contre objectif</div>
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><div class="val">${money(mo)}<small>F</small></div><span style="color:var(--mute);font-size:13px">sur ${money(objM)} F d'objectif · ${pct(mo / objM)}</span></div>
      <div class="progress"><i style="width:${prog * 100}%"></i><b style="left:calc(${mark * 100}% - 1px)" title="Rythme attendu à ce jour"></b></div>
      <div class="foot">${avance >= 0 ? `<span class="pill g">En avance de ${moneyF(avance)}</span>` : `<span class="pill o">En retard de ${moneyF(-avance)}</span>`}<span>sur le rythme attendu (${wdE} jours ouvrés sur ${wdT})</span>${delta(mo, lmSame)}<span>vs même point en ${MOISL[pd(lmA).getUTCMonth()]}</span></div></div>
  </div>
  <div class="g k4">
    <div class="card kpi"><div class="lab">Marge brute · ${perLabel()}</div><div class="val">${money(mg)}<small>F</small></div><div class="foot">${delta(mg, mgP)}<span>taux ${pct(ca ? mg / ca : 0, 1)}</span></div></div>
    <div class="card kpi"><div class="lab">Panier moyen · ${perLabel()}</div><div class="val">${n0(pan)}<small>F</small></div><div class="foot">${delta(pan, panP)}<span>${n0(pO.length)} commandes</span></div></div>
    <div class="card kpi"><div class="lab">Commandes en cours</div><div class="val">${enCours.length}</div><div class="foot"><span class="pill o">${enCours.filter(o => o.st === 'À préparer').length} à préparer</span><span class="pill b">${enCours.filter(o => o.st === 'En livraison').length} en route</span></div></div>
    <div class="card kpi"><div class="lab">Devis en attente de réponse</div><div class="val">${dv.length}<small>· ${money(sum(dv, v => v.mt))} F</small></div><div class="foot">${dvOld.length ? `<span class="pill o">${dvOld.length} sans réponse depuis plus de 7 jours</span>` : '<span class="pill g">Tous récents</span>'}</div></div>
  </div>
  <div class="g c32">
    <div class="card"><div class="card-h"><div><h3>Chiffre d'affaires par jour</h3><p class="sub">${perLabel()}, en francs CFA</p></div><div class="legend"><span><i style="background:#111418"></i>Ventes</span><span><i style="background:#00A877"></i>Moyenne sur 7 jours</span></div></div><div class="chart"><canvas id="ch-jour"></canvas></div></div>
    <div class="card"><div class="card-h"><div><h3>Encaissements</h3><p class="sub">${perLabel()} · par moyen de paiement</p></div></div>
      <div style="font-family:var(--disp);font-size:26px;font-weight:700;letter-spacing:-.03em">${moneyF(encT)}</div>
      <div class="split">${['Mobile Money', 'Virement', 'Espèces'].map(k => `<i style="width:${(enc[k] || 0) / encT * 100}%;background:${PAYCOL[k]}"></i>`).join('')}</div>
      <div class="list">${['Mobile Money', 'Virement', 'Espèces'].map(k => `<div class="li"><span style="width:9px;height:9px;border-radius:3px;background:${PAYCOL[k]}"></span><div class="main"><b>${k}</b><span>${k === 'Mobile Money' ? 'Wave, Orange, MTN, Moov' : k === 'Virement' ? 'Comptes entreprises et administrations' : 'Comptoir et livraison'}</span></div><div class="amt">${moneyF(enc[k] || 0)}</div><span class="m" style="width:42px;text-align:right;color:var(--mute);font-size:12px">${pct((enc[k] || 0) / encT)}</span></div>`).join('')}</div>
      <div class="note" style="margin-top:6px">${ICO.clock}<span>Virements attendus : <b style="color:var(--ink)">${moneyF(aEncAmt)}</b>, dont <b style="color:var(--red)">${moneyF(retAmt)}</b> à plus de 30 jours (${retard.length} factures).</span></div></div>
  </div>
  <div class="g c2">
    <div class="card"><div class="card-h"><div><h3>Commandes en cours</h3><p class="sub">Livrées le jour même si commandées avant 10 h</p></div><span class="pill g">${avant10.length} avant 10 h · ${apres10.length} après</span></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>Commande</th><th>Client</th><th class="hide-m">Commune</th><th>Statut</th><th class="n">Montant</th></tr></thead><tbody>
      ${enCours.sort((a, b) => (b.d + (b.h || '')) > (a.d + (a.h || '')) ? 1 : -1).slice(0, 8).map(o => `<tr><td><span class="strong">${o.id}</span><div class="m">${o.d === TODAY ? 'Aujourd\'hui ' + (o.h || '').replace(':', ' h ') : dfr(o.d)}</div></td><td>${esc(CL[o.cl].nom)}</td><td class="hide-m m">${esc(o.commune)}</td><td>${stPill(o.st)}</td><td class="n strong">${n0(amt(o))}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Aucune commande en cours avec ces filtres.</td></tr>'}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><div><h3>À regarder ce matin</h3><p class="sub">Ce qui demande une décision aujourd'hui</p></div></div>
      <div class="list">
        ${ruptures.length ? `<div class="alert"><div class="ic r">${ICO.box}</div><div><b>${ruptures.length} articles en rupture</b><p>${ruptures.map(p => esc(p.nom)).join(', ')}</p></div><a href="#stock">Voir</a></div>` : ''}
        ${rel.length ? `<div class="alert"><div class="ic o">${ICO.user}</div><div><b>${rel.length} clients sans commande depuis 45 jours</b><p>${moneyF(sum(rel, s => s.ca12))} de chiffre d'affaires annuel en jeu</p></div><a href="#clients">Relancer</a></div>` : ''}
        ${dvOld.length ? `<div class="alert"><div class="ic b">${ICO.doc}</div><div><b>${dvOld.length} devis à relancer</b><p>${moneyF(sum(dvOld, v => v.mt))} en attente depuis plus de 7 jours</p></div><a href="#commercial">Voir</a></div>` : ''}
        ${ao.length ? `<div class="alert"><div class="ic g">${ICO.clock}</div><div><b>Appel d'offres : clôture le ${dfr(ao[0].clo)}</b><p>${esc(ao[0].objet)} · ${moneyF(ao[0].mt)}</p></div><a href="#commercial">Voir</a></div>` : ''}
        ${retard.length ? `<div class="alert"><div class="ic r">${ICO.warn}</div><div><b>${moneyF(retAmt)} de virements en retard</b><p>${retard.length} factures à plus de 30 jours</p></div></div>` : ''}
      </div></div>
  </div>`;
  spark('sp1', daily(add(TODAY, -13), TODAY));
  spark('sp2', daily(add(TODAY, -27), TODAY).reduce((acc, v, i) => { if (i % 7 === 0) acc.push(0); acc[acc.length - 1] += v; return acc; }, []), '#111418');
  const dd = daily(r.a, r.b), labs = []; for (let d = r.a; d <= r.b; d = add(d, 1)) labs.push(d);
  if (S.per === '12m' || S.per === '90j') { // agrégation par semaine
    const W = [], WL = []; dd.forEach((v, i) => { if (i % 7 === 0) { W.push(0); WL.push(labs[i]); } W[W.length - 1] += v; });
    chart('ch-jour', { type: 'bar', data: { labels: WL.map(dfr), datasets: [{ data: W, backgroundColor: '#111418', borderRadius: 4, maxBarThickness: 18 }] }, options: { maintainAspectRatio: false, scales: { x: { ...gridX, ticks: { maxTicksLimit: 8 } }, y: gridY() }, plugins: { tooltip: { callbacks: { title: i => 'Semaine du ' + i[0].label, label: i => ' ' + moneyF(i.raw) } } } } });
  } else {
    const ma = dd.map((_, i) => { const s = dd.slice(Math.max(0, i - 6), i + 1); return s.reduce((a, b) => a + b, 0) / s.length; });
    chart('ch-jour', { type: 'bar', data: { labels: labs.map(dfr), datasets: [{ type: 'line', data: ma, borderColor: '#00A877', borderWidth: 2, pointRadius: 0, tension: .35 }, { data: dd, backgroundColor: labs.map(d => d === TODAY ? '#F07C1E' : '#111418'), borderRadius: 4, maxBarThickness: 16 }] },
      options: { maintainAspectRatio: false, scales: { x: { ...gridX, ticks: { maxTicksLimit: 8 } }, y: gridY() }, plugins: { tooltip: { callbacks: { label: i => ' ' + (i.datasetIndex ? 'Ventes ' : 'Moyenne 7 j ') + moneyF(i.raw) } } } } });
  }
}
function stPill(s) { return `<span class="pill ${{ 'À préparer': 'o', 'En livraison': 'b', 'Livraison demain': 'n', 'Montage planifié': 'b', 'Livrée': 'g' }[s] || 'n'}">${s}</span>`; }

/* =========================================================
   2. VENTES
   ========================================================= */
function ventes() {
  chips();
  const r = range(), O = orders(r.a, r.b), OP = orders(r.pa, r.pb);
  const ca = sum(O, amt), caP = sum(OP, amt), mg = ca - sum(O, cost), mgP = caP - sum(OP, cost);
  const nc = new Set(O.map(o => o.cl)).size, ncP = new Set(OP.map(o => o.cl)).size;
  // catégories
  const cat = {}; O.forEach(o => Object.entries(o.bycat).forEach(([k, v]) => { if (!S.cat || k === S.cat) cat[k] = (cat[k] || 0) + v[0]; }));
  const catP = {}; OP.forEach(o => Object.entries(o.bycat).forEach(([k, v]) => { if (!S.cat || k === S.cat) catP[k] = (catP[k] || 0) + v[0]; }));
  // produits
  const pr = {}; O.forEach(o => o.lg.forEach(([k, q]) => { const p = P[k]; if (S.cat && p.cat !== S.cat) return; const x = pr[k] || (pr[k] = { q: 0, ca: 0 }); x.q += q; x.ca += q * p.prix; }));
  const top = Object.entries(pr).sort((a, b) => b[1].ca - a[1].ca).slice(0, 10); const topMax = top.length ? top[0][1].ca : 1;
  // clients
  const cli = {}; O.forEach(o => { const x = cli[o.cl] || (cli[o.cl] = { ca: 0, n: 0 }); x.ca += amt(o); x.n++; });
  const topC = Object.entries(cli).sort((a, b) => b[1].ca - a[1].ca).slice(0, 8);
  // communes (sans le filtre commune, pour la carte)
  const com = {}; orders(r.a, r.b, { noCom: true }).forEach(o => com[o.commune] = (com[o.commune] || 0) + amt(o));
  const comT = sum(Object.values(com), x => x);
  // 12 mois
  const months = []; { const d = pd(TODAY); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 11); for (let i = 0; i < 12; i++) { months.push(fd(d).slice(0, 7)); d.setUTCMonth(d.getUTCMonth() + 1); } }
  const m12 = {}, m12c = {}; orders(months[0] + '-01', TODAY).forEach(o => { const k = o.d.slice(0, 7); m12[k] = (m12[k] || 0) + amt(o); });
  const prevY = {}; orders(add(months[0] + '-01', -365), add(TODAY, -365)).forEach(o => { const k = o.d.slice(0, 7); prevY[k] = (prevY[k] || 0) + amt(o); });

  $('#page').innerHTML = `
  <div class="g k5">
    ${kpi('Chiffre d\'affaires', money(ca), 'F', delta(ca, caP), cmpLabel())}
    ${kpi('Marge brute', money(mg), 'F', delta(mg, mgP), 'taux ' + pct(ca ? mg / ca : 0, 1))}
    ${kpi('Commandes', n0(O.length), '', delta(O.length, OP.length), cmpLabel())}
    ${kpi('Panier moyen', n0(O.length ? ca / O.length : 0), 'F', delta(O.length ? ca / O.length : 0, OP.length ? caP / OP.length : 0), cmpLabel())}
    ${kpi('Clients actifs', n0(nc), '', delta(nc, ncP), 'ont commandé sur la période')}
  </div>
  <div class="g c21">
    <div class="card"><div class="card-h"><div><h3>Évolution sur 12 mois</h3><p class="sub">Chiffre d'affaires mensuel et objectif${S.cat || S.com || S.vend ? ' (objectif affiché sans filtre seulement)' : ''}</p></div><div class="legend"><span><i style="background:#111418"></i>Réalisé</span><span><i style="background:#F07C1E"></i>Objectif</span></div></div><div class="chart l"><canvas id="ch-12m"></canvas></div><p class="note">${ICO.info}<span>Le mois de ${MOISL[pd(TODAY).getUTCMonth()]} est en cours (${pd(TODAY).getUTCDate()} jours).</span></p></div>
    <div class="card"><div class="card-h"><div><h3>Par catégorie</h3><p class="sub">${perLabel()}</p></div></div><div class="chart s"><canvas id="ch-cat"></canvas></div>
      <div class="list" style="margin-top:8px">${Object.entries(cat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="li"><span style="width:9px;height:9px;border-radius:3px;background:${CATCOL[k]}"></span><div class="main"><b>${esc(D.cats[k])}</b></div><div class="amt">${moneyF(v)}</div>${delta(v, catP[k] || 0)}</div>`).join('')}</div></div>
  </div>
  <div class="g c2">
    <div class="card"><div class="card-h"><div><h3>Top 10 des produits</h3><p class="sub">Par chiffre d'affaires · ${perLabel()}</p></div></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>Produit</th><th class="n">Qté</th><th class="hide-m" style="width:28%"></th><th class="n">CA</th></tr></thead><tbody>
      ${top.map(([k, x], i) => `<tr><td><span class="rank">${i + 1}</span>${esc(P[k].nom)}</td><td class="n m">${n0(x.q)}</td><td class="hide-m"><div class="bar"><div class="t"><i style="width:${x.ca / topMax * 100}%;background:${CATCOL[P[k].cat]}"></i></div></div></td><td class="n strong">${money(x.ca)}</td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><div><h3>Meilleurs clients</h3><p class="sub">${perLabel()}</p></div></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>Client</th><th class="hide-m">Commune</th><th class="n">Cdes</th><th class="n">CA</th><th class="n">Part</th></tr></thead><tbody>
      ${topC.map(([k, x], i) => `<tr><td><span class="rank">${i + 1}</span>${esc(CL[k].nom)}<div class="m" style="margin-left:30px">${esc(CL[k].type)}</div></td><td class="hide-m m">${esc(CL[k].commune)}</td><td class="n m">${x.n}</td><td class="n strong">${money(x.ca)}</td><td class="n m">${pct(x.ca / ca)}</td></tr>`).join('')}
      </tbody></table></div></div>
  </div>
  <div class="g c32">
    <div class="card"><div class="card-h"><div><h3>Ventes par commune d'Abidjan</h3><p class="sub">${perLabel()} · plus la couleur est foncée, plus la commune achète${S.com ? ' · ' + esc(S.com) + ' entourée' : ''}</p></div></div><div id="carte"></div></div>
    <div class="card"><div class="card-h"><div><h3>Classement des communes</h3><p class="sub">Part du chiffre d'affaires</p></div></div>
      <div class="list">${Object.entries(com).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="li" style="padding:8px 0${S.com === k ? ';background:var(--green-s);margin:0 -8px;padding:8px;border-radius:8px' : ''}"><div class="main" style="flex:0 0 96px"><b>${esc(k)}</b></div><div class="bar" style="flex:1"><div class="t"><i style="width:${v / Math.max(...Object.values(com)) * 100}%;background:var(--green)"></i></div></div><div class="amt" style="width:64px;text-align:right">${money(v)}</div><span style="width:40px;text-align:right;color:var(--mute);font-size:12px">${pct(v / comT)}</span></div>`).join('')}</div></div>
  </div>`;
  chart('ch-12m', { type: 'bar', data: { labels: months.map(m => MOIS[+m.slice(5) - 1] + ' ' + m.slice(2, 4)), datasets: [
    { type: 'line', label: 'Objectif', data: S.cat || S.com || S.vend ? months.map(() => null) : months.map(m => D.objectifs[m] || null), borderColor: '#F07C1E', borderWidth: 2, borderDash: [5, 4], pointRadius: 3, pointBackgroundColor: '#F07C1E', tension: .2 },
    { label: 'Réalisé', data: months.map(m => m12[m] || 0), backgroundColor: months.map((m, i) => i === 11 ? '#C9CCD1' : '#111418'), borderRadius: 6, maxBarThickness: 34 }] },
    options: { maintainAspectRatio: false, scales: { x: gridX, y: gridY() }, plugins: { tooltip: { callbacks: { label: i => ' ' + i.dataset.label + ' : ' + moneyF(i.raw) } } } } });
  const ck = Object.keys(cat).sort((a, b) => cat[b] - cat[a]);
  chart('ch-cat', { type: 'doughnut', data: { labels: ck.map(k => D.cats[k]), datasets: [{ data: ck.map(k => cat[k]), backgroundColor: ck.map(k => CATCOL[k]), borderWidth: 3, borderColor: '#fff', hoverOffset: 4 }] },
    options: { maintainAspectRatio: false, cutout: '72%', plugins: { tooltip: { callbacks: { label: i => ' ' + moneyF(i.raw) + ' · ' + pct(i.raw / ca) } } } },
    plugins: [{ id: 'c', afterDraw(c) { const { ctx, chartArea: a } = c; ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#111418'; ctx.font = '700 20px "Plus Jakarta Sans"'; ctx.fillText(money(ca), (a.left + a.right) / 2, (a.top + a.bottom) / 2 + 2); ctx.font = '500 11px Inter'; ctx.fillStyle = '#6B7079'; ctx.fillText('F CFA', (a.left + a.right) / 2, (a.top + a.bottom) / 2 + 18); ctx.restore(); } }] });
  carte(com);
}
function kpi(lab, val, unit, d, sub) { return `<div class="card kpi"><div class="lab">${lab}</div><div class="val">${val}${unit ? `<small>${unit}</small>` : ''}</div><div class="foot">${d || ''}<span>${sub || ''}</span></div></div>`; }
let GEO = null;
function carte(com) {
  const go = g => {
    GEO = g; const el = $('#carte'); if (!el) return;
    map = L.map(el, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
    map.attributionControl.setPrefix(false); map.attributionControl.addAttribution('Contours © OpenStreetMap');
    const mx = Math.max(1, ...Object.values(com));
    const col = v => { const t = Math.sqrt((v || 0) / mx); const a = [231, 246, 240], b = [0, 126, 89]; return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`; };
    const lay = L.geoJSON(g, {
      style: f => ({ color: S.com === f.properties.nom ? '#F07C1E' : '#fff', weight: S.com === f.properties.nom ? 3 : 1.4, fillColor: col(com[f.properties.nom]), fillOpacity: .88 }),
      onEachFeature: (f, l) => {
        l.bindTooltip(`<b>${esc(f.properties.nom)}</b><br>${moneyF(com[f.properties.nom] || 0)}`, { sticky: true });
        l.on('click', () => { S.com = S.com === f.properties.nom ? '' : f.properties.nom; $('#f-com').value = S.com; render(); });
      }
    }).addTo(map);
    g.features.forEach(f => { const c = L.geoJSON(f).getBounds().getCenter(); L.tooltip({ permanent: true, direction: 'center', className: 'lbl-com' }).setLatLng(c).setContent(esc(f.properties.nom)).addTo(map); });
    map.fitBounds(L.geoJSON(g.features.filter(f => !['Anyama', 'Songon'].includes(f.properties.nom))).getBounds(), { padding: [6, 6] });
  };
  GEO ? go(GEO) : fetch('data/communes.geojson').then(r => r.json()).then(go);
}

/* =========================================================
   3. CLIENTS
   ========================================================= */
function clients() {
  chips('« Sans commande depuis 45 jours » ne retient que les clients qui commandent d\'habitude au moins tous les deux mois');
  const r = range(), st = clientStats(), all = Object.values(st).filter(s => clientOk(s.c));
  const rel = aRelancer(st), R = relances();
  const nouveaux = all.filter(s => s.first >= r.a).sort((a, b) => b.first < a.first ? -1 : 1), nouveauxP = all.filter(s => s.first >= r.pa && s.first <= r.pb);
  const risque = all.filter(s => s.since < 45 && s.cap90 > 300000 && s.ca90 < s.cap90 * .6).map(s => ({ ...s, chute: 1 - s.ca90 / s.cap90 })).sort((a, b) => (b.cap90 - b.ca90) - (a.cap90 - a.ca90));
  const actifs = all.filter(s => s.since <= 90).length;
  const ca12 = all.map(s => s.ca12).sort((a, b) => b - a), tot12 = sum(ca12, x => x), top10 = sum(ca12.slice(0, 10), x => x);
  const top10l = all.slice().sort((a, b) => b.ca12 - a.ca12).slice(0, 10);
  const enjeu = sum(rel, s => s.ca12);
  const done = rel.filter(s => R[s.id]).length;

  $('#page').innerHTML = `
  <div class="g k5">
    ${kpi('Clients actifs', n0(actifs), '', '', 'commande dans les 90 derniers jours')}
    ${kpi('Sans commande depuis 45 jours', n0(rel.length), '', `<span class="pill o">${moneyF(enjeu)} par an en jeu</span>`, '')}
    ${kpi('Nouveaux clients', n0(nouveaux.length), '', delta(nouveaux.length, nouveauxP.length), perLabel())}
    ${kpi('Clients à risque', n0(risque.length), '', `<span class="pill r">−${moneyF(sum(risque, s => s.cap90 - s.ca90))}</span>`, 'sur 90 jours')}
    ${kpi('Part des 10 premiers clients', pct(tot12 ? top10 / tot12 : 0), '', top10 / tot12 > .4 ? '<span class="pill o">Dépendance forte</span>' : '<span class="pill g">Risque réparti</span>', '12 derniers mois')}
  </div>
  <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Clients sans commande depuis 45 jours</h3><p class="sub">À relancer cette semaine, du plus gros au plus petit · la relance suit le déroulé du kit de prospection (jour 45, 50, 57, 65, 90)</p></div><span class="pill ${done === rel.length && rel.length ? 'g' : 'n'}">${done} / ${rel.length} relancés</span></div>
    <div class="scroll"><table class="tbl"><thead><tr><th>Client</th><th class="hide-m">Commune</th><th class="hide-m">Commercial</th><th class="n">Dernière commande</th><th class="n hide-m">Rythme habituel</th><th class="n">CA 12 mois</th><th>Étape</th><th></th></tr></thead><tbody>
    ${rel.slice(0, S.all45 ? 999 : 10).map(s => { const e = etape(s.since); return `<tr><td class="strong">${esc(s.c.nom)}<div class="m">${esc(s.c.type)}</div></td><td class="hide-m m">${esc(s.c.commune)}</td><td class="hide-m m">${esc(D.commerciaux[s.c.com].split(' · ')[0])}</td><td class="n"><span class="strong">${s.since} j</span><div class="m">${dfr(s.last)}</div></td><td class="n m hide-m">tous les ${s.freq} j</td><td class="n strong">${money(s.ca12)}</td><td><span class="pill ${s.since >= 90 ? 'r' : s.since >= 65 ? 'o' : 'n'}">${e.court}</span></td><td class="n">${R[s.id] ? `<button class="btn done" data-rel="${s.id}">${ICO.check}Relancé le ${dfr(R[s.id])}</button>` : `<button class="btn pri" data-rel="${s.id}">${ICO.send}Relancer</button>`}</td></tr>`; }).join('') || '<tr><td colspan="8" class="empty">Aucun client à relancer avec ces filtres.</td></tr>'}
    </tbody></table></div>${rel.length > 10 ? `<div style="text-align:center;margin-top:12px"><button class="btn" id="tout45">${S.all45 ? 'Afficher les 10 premiers' : 'Afficher les ' + rel.length + ' clients'}</button></div>` : ''}</div>
  <div class="g c3">
    <div class="card"><div class="card-h"><div><h3>Clients à risque</h3><p class="sub">Commandent encore, mais beaucoup moins : 90 derniers jours contre les 90 précédents</p></div></div>
      <div class="list">${risque.slice(0, 7).map(s => `<div class="li"><div class="main"><b>${esc(s.c.nom)}</b><span>${money(s.cap90)} → ${money(s.ca90)} F · ${esc(s.c.commune)}</span></div><span class="delta dn">${ICO.dn}−${Math.round(s.chute * 100)} %</span></div>`).join('') || '<div class="empty">Aucun client à risque avec ces filtres.</div>'}</div></div>
    <div class="card"><div class="card-h"><div><h3>Nouveaux clients</h3><p class="sub">Première commande sur la période · ${perLabel()}</p></div></div>
      <div class="list">${nouveaux.slice(0, 7).map(s => `<div class="li"><div class="main"><b>${esc(s.c.nom)}</b><span>${esc(s.c.type)} · ${esc(s.c.commune)} · depuis le ${dfr(s.first)}</span></div><div class="amt">${money(s.ca12)}</div></div>`).join('') || '<div class="empty">Aucun nouveau client sur la période.</div>'}</div></div>
    <div class="card"><div class="card-h"><div><h3>Concentration</h3><p class="sub">Poids des 10 premiers clients sur 12 mois</p></div></div>
      <div class="chart s" style="height:150px"><canvas id="ch-conc"></canvas></div>
      <div class="list">${top10l.slice(0, 5).map((s, i) => `<div class="li" style="padding:7px 0"><span class="rank">${i + 1}</span><div class="main"><b style="font-weight:500">${esc(s.c.nom)}</b></div><span style="color:var(--mute);font-size:12px">${pct(s.ca12 / tot12, 1)}</span></div>`).join('')}</div></div>
  </div>`;
  document.querySelectorAll('[data-rel]').forEach(b => b.addEventListener('click', () => openRelance(st[b.dataset.rel])));
  const t45 = $('#tout45'); if (t45) t45.addEventListener('click', () => { S.all45 = !S.all45; const y = window.scrollY; render(); window.scrollTo({ top: y }); });
  chart('ch-conc', { type: 'doughnut', data: { labels: ['10 premiers clients', 'Tous les autres'], datasets: [{ data: [top10, tot12 - top10], backgroundColor: ['#F07C1E', '#ECECE6'], borderWidth: 0 }] },
    options: { maintainAspectRatio: false, cutout: '76%', rotation: -90, circumference: 180, plugins: { tooltip: { callbacks: { label: i => ' ' + moneyF(i.raw) } } } },
    plugins: [{ id: 't', afterDraw(c) { const { ctx, chartArea: a } = c; ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#111418'; ctx.font = '700 22px "Plus Jakarta Sans"'; ctx.fillText(pct(top10 / tot12), (a.left + a.right) / 2, a.bottom - 14); ctx.restore(); } }] });
}
const ETAPES = [
  { j: 45, court: 'Jour 45 · e-mail + WhatsApp', titre: 'Jour 45 : e-mail avec le panier habituel, et WhatsApp le même jour' },
  { j: 50, court: 'Jour 50 · WhatsApp', titre: 'Jour 50 : relance WhatsApp courte' },
  { j: 57, court: 'Jour 57 · appel', titre: 'Jour 57 : appel téléphonique, comprendre ce qui a changé' },
  { j: 65, court: 'Jour 65 · dernier message', titre: 'Jour 65 : dernier message avec l\'avantage décidé par la direction' },
  { j: 90, court: 'À reconquérir', titre: 'Jour 90 : client à reconquérir, visite ou offre de reprise' }];
function etape(j) { let e = ETAPES[0]; ETAPES.forEach(x => { if (j >= x.j) e = x; }); return e; }
function openRelance(s) {
  const e = etape(s.since), last = dnum(s.last);
  const fav = Object.entries(s.prods).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => '• ' + P[k].nom + ' : ' + n0(P[k].prix) + ' F').join('\n');
  const car = Object.entries(s.prods).map(([k]) => P[k]).find(p => p.cat === 'cartouches');
  let msgs;
  if (e.j === 45) msgs = [['E-mail', `Objet : Votre commande habituelle est prête, [Prénom]\n\nBonjour [Prénom],\n\nVotre dernière commande chez Office Plus date du ${last}. Pour vous faire gagner du temps, nous avons préparé votre panier habituel :\n${fav}\n\nIl vous suffit de répondre « OK » à ce message, ou de nous indiquer ce qu'il faut ajouter ou retirer. Nous vous confirmons alors la date de livraison et vous envoyons la facture normalisée.\n\nSi quelque chose ne vous a pas convenu lors de la dernière livraison, dites-le-moi : je m'en occupe personnellement.\n\nBien cordialement,\n[Prénom et nom du commercial]\nOffice Plus · [numéro WhatsApp commercial]`],
    ['WhatsApp', `Bonjour [Prénom], c'est [Prénom du commercial] d'Office Plus. Votre panier habituel est prêt (ramettes, cartouches${car ? ' ' + car.nom.replace(/^(Toner|Cartouche) /, '') : ''}, fournitures). Je vous l'ai envoyé par mail. Un simple « OK » ici et on le prépare pour la livraison. Bonne journée !`]];
  else if (e.j === 50) msgs = [['WhatsApp', `Bonjour [Prénom], je reviens vers vous pour le panier préparé la semaine dernière. Vous restait-il assez de papier et de cartouches ? Si vos besoins ont changé, dites-moi simplement ce qu'il vous faut et j'ajuste.`]];
  else if (e.j === 57) msgs = [['Appel · trois questions, deux minutes', `1. « Nous n'avons pas eu de vos nouvelles depuis votre commande du ${last}. Tout s'est bien passé avec la dernière livraison ? »\n2. « Vos besoins ont-ils changé : moins d'impressions, nouveau personnel, déménagement ? »\n3. « Qu'est-ce qui vous ferait commander à nouveau chez nous ce mois-ci ? »\n\nNoter la réponse mot pour mot : prix, délai, qualité, changement de contact ou de fournisseur.`]];
  else if (e.j === 65) msgs = [['WhatsApp ou e-mail', `Bonjour [Prénom], pour vous remercier de votre fidélité, nous vous proposons [avantage décidé par la direction : livraison offerte, remise sur ce panier ou article offert] sur votre prochaine commande passée avant le [date limite]. Votre panier habituel reste prêt ; un « OK » suffit.`]];
  else msgs = [['Note pour le responsable commercial', `${s.c.nom} ne commande plus depuis ${s.since} jours (dernière commande le ${last}, ${moneyF(s.ca12)} sur 12 mois).\nÀ classer « à reconquérir » : prévoir une visite ou une offre de reprise.\n\nPanier habituel :\n${fav}`]];
  $('#dr-body').innerHTML = `
    <div class="eyebrow">Relance client · ${esc(D.commerciaux[s.c.com])}</div>
    <h2>${esc(s.c.nom)}</h2>
    <p class="sub" style="color:var(--mute);margin:0">${esc(s.c.type)} · ${esc(s.c.commune)} · dernière commande le ${dfr(s.last)} (il y a ${s.since} jours) · commande d'habitude tous les ${s.freq} jours · ${moneyF(s.ca12)} sur 12 mois</p>
    <div class="steps">${ETAPES.map(x => `<div class="${x === e ? 'on' : x.j < e.j ? 'past' : ''}">${x.court}</div>`).join('')}</div>
    <b style="font-size:13.5px">${e.titre}</b>
    ${msgs.map(([t, m], i) => `<div class="msg-h"><b>${t}</b><button class="btn" data-copy="${i}">${ICO.copy}Copier</button></div><div class="msg" id="msg${i}">${esc(m)}</div>`).join('')}
    <p class="note">${ICO.info}<span>Messages repris du kit de prospection d'Office Plus. Le commercial complète ce qui est entre crochets, relit et envoie lui-même : rien ne part depuis ce tableau.</span></p>
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn green" id="mark">${ICO.check}Marquer comme relancé aujourd'hui</button><button class="btn" data-close>Fermer</button></div>`;
  $('#dr-body').querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const t = $('#msg' + b.dataset.copy).textContent; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Message copié'), () => toast('Sélectionnez le texte pour le copier'));
  }));
  $('#mark').addEventListener('click', () => { const R = relances(); R[s.id] = TODAY; localStorage.setItem('op-relances', JSON.stringify(R)); closeDrawer(); toast('Relance notée pour ' + s.c.nom); render(); });
  $('#drawer').hidden = false; document.body.style.overflow = 'hidden';
}
function closeDrawer() { $('#drawer').hidden = true; document.body.style.overflow = ''; }
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }

/* =========================================================
   4. STOCK
   ========================================================= */
function stock() {
  chips('Le stock est celui du jour ; la commune et le commercial ne s\'y appliquent pas');
  const r = range();
  const q90 = {}, q12 = {}, qPer = {};
  ORD.forEach(o => o.lg.forEach(([k, q]) => { if (o.d > add(TODAY, -90)) q90[k] = (q90[k] || 0) + q; if (o.d > add(TODAY, -365)) q12[k] = (q12[k] || 0) + q; if (o.d >= r.a) qPer[k] = (qPer[k] || 0) + q; }));
  const items = D.produits.filter(p => !S.cat || p.cat === S.cat).map(p => {
    const dly = (q90[p.id] || 0) / 90, cov = dly ? p.stock / dly : Infinity;
    let st = 'OK', cls = 'g';
    if (p.stock === 0) { st = 'Rupture'; cls = 'r'; } else if (!q90[p.id]) { st = 'Dormant'; cls = 'n'; } else if (cov < 10) { st = 'Stock bas'; cls = 'o'; }
    return { ...p, dly, cov, st, cls, val: p.stock * p.cout, perdu: p.stock === 0 ? dly * 7 * p.prix : 0 };
  });
  const rupt = items.filter(i => i.st === 'Rupture'), bas = items.filter(i => i.st === 'Stock bas'), dorm = items.filter(i => i.st === 'Dormant');
  const valT = sum(items, i => i.val), valD = sum(dorm, i => i.val);
  const cogs12 = sum(items, i => (q12[i.id] || 0) * i.cout), rot = valT ? cogs12 / valT : 0;
  const rotCat = {}; Object.keys(D.cats).filter(c => !S.cat || c === S.cat).forEach(c => { const it = items.filter(i => i.cat === c), v = sum(it, i => i.val); rotCat[c] = v ? sum(it, i => (q12[i.id] || 0) * i.cout) / v : 0; });
  const cart = D.produits.filter(p => p.cat === 'cartouches').map(p => [p, qPer[p.id] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const order = { 'Rupture': 0, 'Stock bas': 1, 'Dormant': 2, 'OK': 3 };
  $('#page').innerHTML = `
  <div class="g k5">
    ${kpi('Articles en rupture', rupt.length, '', rupt.length ? `<span class="pill r">≈ ${moneyF(sum(rupt, i => i.perdu))} de ventes par semaine</span>` : '', '')}
    ${kpi('Stock bas', bas.length, '', '<span class="pill o">moins de 10 jours de ventes</span>', '')}
    ${kpi('Valeur du stock', money(valT), 'F', '', 'au prix d\'achat')}
    ${kpi('Rotation du stock', rot.toFixed(1).replace('.', ','), 'fois/an', '', 'soit ' + Math.round(365 / rot) + ' jours de stock en moyenne')}
    ${kpi('Stock dormant', money(valD), 'F', `<span class="pill n">${dorm.length} articles</span>`, 'aucune vente en 90 jours')}
  </div>
  <div class="g c32">
    <div class="card"><div class="card-h"><div><h3>À commander en priorité</h3><p class="sub">Ruptures et stocks bas, avec le nombre de jours de ventes restants</p></div></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>Article</th><th>Statut</th><th class="n">En stock</th><th class="n hide-m">Ventes / sem.</th><th class="n">Jours restants</th></tr></thead><tbody>
      ${rupt.concat(bas.sort((a, b) => a.cov - b.cov)).map(i => `<tr><td class="strong">${esc(i.nom)}<div class="m">${esc(D.cats[i.cat])}</div></td><td><span class="pill ${i.cls}">${i.st}</span></td><td class="n">${n0(i.stock)}</td><td class="n m hide-m">${(i.dly * 7).toFixed(1).replace('.', ',')}</td><td class="n strong" style="color:${i.stock === 0 ? 'var(--red)' : 'var(--orange-d)'}">${i.stock === 0 ? '0' : Math.round(i.cov)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Rien d\'urgent.</td></tr>'}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><div><h3>Cartouches les plus demandées</h3><p class="sub">Quantités vendues · ${perLabel()}</p></div></div><div class="chart" style="height:300px"><canvas id="ch-cart"></canvas></div></div>
  </div>
  <div class="g c12">
    <div class="card"><div class="card-h"><div><h3>Rotation par catégorie</h3><p class="sub">Nombre de fois où le stock est vendu dans l'année</p></div></div><div class="chart s"><canvas id="ch-rot"></canvas></div>
      <div class="card-h" style="margin:18px 0 6px"><div><h3>Stock dormant</h3><p class="sub">${moneyF(valD)} immobilisés sans aucune vente depuis 90 jours</p></div></div>
      <div class="list">${dorm.sort((a, b) => b.val - a.val).map(i => `<div class="li"><div class="main"><b>${esc(i.nom)}</b><span>${i.stock} en stock</span></div><div class="amt">${moneyF(i.val)}</div></div>`).join('') || '<div class="empty">Aucun stock dormant.</div>'}</div></div>
    <div class="card"><div class="card-h"><div><h3>Tout le stock</h3><p class="sub">${items.length} articles · trié par urgence</p></div></div>
      <div class="scroll" style="max-height:540px;overflow:auto"><table class="tbl"><thead><tr><th>Article</th><th class="hide-m">Catégorie</th><th class="n">Stock</th><th class="n hide-m">Valeur</th><th class="n">Couverture</th><th>Statut</th></tr></thead><tbody>
      ${items.sort((a, b) => order[a.st] - order[b.st] || a.cov - b.cov).map(i => `<tr><td>${esc(i.nom)}</td><td class="hide-m m">${esc(D.cats[i.cat].split(' ')[0])}</td><td class="n">${n0(i.stock)}</td><td class="n m hide-m">${money(i.val)}</td><td class="n">${i.stock === 0 ? '–' : isFinite(i.cov) ? Math.round(i.cov) + ' j' : '∞'}</td><td><span class="pill ${i.cls}">${i.st}</span></td></tr>`).join('')}
      </tbody></table></div></div>
  </div>`;
  chart('ch-cart', { type: 'bar', data: { labels: cart.map(([p]) => p.nom.replace(/^(Toner|Cartouche|Bouteille d'encre) /, '')), datasets: [{ data: cart.map(x => x[1]), backgroundColor: cart.map(([p]) => p.stock === 0 ? '#D93D42' : p.stock && (q90[p.id] || 0) / 90 * 10 > p.stock ? '#F07C1E' : '#111418'), borderRadius: 5, maxBarThickness: 20 }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: { ...gridY(v => v) }, y: { grid: { display: false }, border: { display: false }, ticks: { color: '#111418' } } }, plugins: { tooltip: { callbacks: { label: i => ' ' + i.raw + ' vendues' } } } } });
  const rk = Object.keys(rotCat);
  chart('ch-rot', { type: 'bar', data: { labels: rk.map(k => D.cats[k].split(' ')[0]), datasets: [{ data: rk.map(k => rotCat[k]), backgroundColor: rk.map(k => CATCOL[k]), borderRadius: 6, maxBarThickness: 40 }] },
    options: { maintainAspectRatio: false, scales: { x: gridX, y: gridY(v => v + '×') }, plugins: { tooltip: { callbacks: { label: i => ' ' + i.raw.toFixed(1).replace('.', ',') + ' fois par an' } } } } });
}

/* =========================================================
   5. COMMERCIAL
   ========================================================= */
function commercial() {
  chips('La prospection LinkedIn est suivie pour toute l\'équipe');
  const r = range();
  const dv = D.devis.filter(v => v.type === 'Devis' && v.d >= r.a && v.d <= r.b && (!S.vend || v.com === S.vend) && (!S.com || CL[v.cl].commune === S.com) && (!S.cat || v.cat === S.cat));
  const dvP = D.devis.filter(v => v.type === 'Devis' && v.d >= r.pa && v.d <= r.pb && (!S.vend || v.com === S.vend) && (!S.com || CL[v.cl].commune === S.com) && (!S.cat || v.cat === S.cat));
  const g = a => a.filter(v => v.st === 'Gagné'), l = a => a.filter(v => ['Perdu', 'Sans suite'].includes(v.st)), oc = a => a.filter(v => ['Envoyé', 'Relancé', 'Négociation'].includes(v.st));
  const taux = a => { const d = g(a).length + l(a).length; return d ? g(a).length / d : 0; };
  const tauxV = a => { const d = sum(g(a), v => v.mt) + sum(l(a), v => v.mt); return d ? sum(g(a), v => v.mt) / d : 0; };
  const delai = a => { const x = g(a).filter(v => v.dec); return x.length ? sum(x, v => diff(v.dec, v.d)) / x.length : 0; };
  const cols = [['Envoyé', 'n'], ['Relancé', 'b'], ['Négociation', 'o'], ['Gagné', 'g'], ['Perdu', 'r']];
  const colItems = k => k === 'Perdu' ? l(dv) : dv.filter(v => v.st === k);
  const dv12 = D.devis.filter(v => v.type === 'Devis' && diff(TODAY, v.d) < 365 && (!S.vend || v.com === S.vend) && (!S.com || CL[v.cl].commune === S.com) && (!S.cat || v.cat === S.cat));
  const raisons = {}; l(dv12).forEach(v => raisons[v.raison] = (raisons[v.raison] || 0) + 1);
  const parCom = Object.keys(D.commerciaux).filter(k => !S.vend || k === S.vend).map(k => { const a = dv.filter(v => v.com === k); return { k, n: a.length, g: g(a).length, t: taux(a), ca: sum(g(a), v => v.mt), oc: sum(oc(a), v => v.mt) }; });
  const ao = D.devis.filter(v => v.type !== 'Devis' && (!S.cat || v.cat === S.cat)).sort((a, b) => a.clo < b.clo ? 1 : -1);
  const aoD = ao.filter(v => ['Gagné', 'Perdu'].includes(v.st));
  const li = D.linkedin, liT = k => sum(li, w => w[k]);
  $('#page').innerHTML = `
  <div class="g k5">
    ${kpi('Devis émis', n0(dv.length), '', delta(dv.length, dvP.length), money(sum(dv, v => v.mt)) + ' F proposés')}
    ${kpi('Taux de transformation', pct(taux(dv)), '', delta(taux(dv), taux(dvP)), 'en nombre · ' + pct(tauxV(dv)) + ' en valeur')}
    ${kpi('Devis gagnés', money(sum(g(dv), v => v.mt)), 'F', delta(sum(g(dv), v => v.mt), sum(g(dvP), v => v.mt)), g(dv).length + ' devis')}
    ${kpi('En cours', money(sum(oc(dv), v => v.mt)), 'F', `<span class="pill b">${oc(dv).length} devis</span>`, '')}
    ${kpi('Délai de décision', Math.round(delai(dv)), 'jours', '', 'entre l\'envoi et la commande')}
  </div>
  <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Pipeline des devis</h3><p class="sub">Devis émis sur la période, par étape · ${perLabel()}</p></div></div>
    <div class="pipe">${cols.map(([k, c]) => { const it = colItems(k).sort((a, b) => b.mt - a.mt); return `<div class="pcol"><h4><span class="pill ${c}">${k === 'Perdu' ? 'Perdu ou sans suite' : k}</span><span>${it.length}</span></h4><div class="big">${moneyF(sum(it, v => v.mt))}</div>${it.slice(0, 3).map(v => `<div class="it"><b>${esc(CL[v.cl].nom)}</b><span>${moneyF(v.mt)} · ${dfr(v.d)}</span></div>`).join('')}</div>`; }).join('')}</div></div>
  <div class="g c2">
    <div class="card"><div class="card-h"><div><h3>Par commercial</h3><p class="sub">${perLabel()}</p></div></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>Commercial</th><th class="n">Devis</th><th class="n">Gagnés</th><th class="n">Taux</th><th class="n">CA gagné</th><th class="n hide-m">En cours</th></tr></thead><tbody>
      ${parCom.map(x => `<tr><td class="strong">${esc(D.commerciaux[x.k].split(' · ')[0])}<div class="m">${esc(D.commerciaux[x.k].split(' · ')[1] || '')}</div></td><td class="n">${x.n}</td><td class="n">${x.g}</td><td class="n"><span class="pill ${x.t >= .5 ? 'g' : x.t >= .35 ? 'n' : 'o'}">${pct(x.t)}</span></td><td class="n strong">${money(x.ca)}</td><td class="n m hide-m">${money(x.oc)}</td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><div><h3>Pourquoi on perd</h3><p class="sub">Devis perdus ou sans suite sur 12 mois, par raison notée</p></div></div><div class="chart s"><canvas id="ch-raison"></canvas></div></div>
  </div>
  <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Appels d'offres</h3><p class="sub">Marchés publics et privés suivis · ${aoD.filter(v => v.st === 'Gagné').length} gagnés sur ${aoD.length} décidés · ${moneyF(sum(ao.filter(v => ['En cours', 'En préparation'].includes(v.st)), v => v.mt))} en jeu</p></div></div>
    <div class="scroll"><table class="tbl"><thead><tr><th>Objet</th><th class="hide-m">Catégorie</th><th class="n">Clôture</th><th class="n">Montant</th><th>Statut</th></tr></thead><tbody>
    ${ao.map(v => `<tr><td class="strong">${esc(v.objet)}${v.raison ? `<div class="m">Motif : ${esc(v.raison)}</div>` : ''}</td><td class="hide-m m">${esc(D.cats[v.cat])}</td><td class="n">${dfrY(v.clo)}${v.clo >= TODAY ? `<div class="m">dans ${diff(v.clo, TODAY)} j</div>` : ''}</td><td class="n strong">${moneyF(v.mt)}</td><td><span class="pill ${{ 'Gagné': 'g', 'Perdu': 'r', 'En cours': 'b', 'En préparation': 'o' }[v.st]}">${v.st}</span></td></tr>`).join('')}
    </tbody></table></div></div>
  <div class="g c12">
    <div class="card"><div class="card-h"><div><h3>Prospection LinkedIn</h3><p class="sub">8 dernières semaines · séquence en 4 messages du kit</p></div></div>
      <div class="funnel">${[['Invitations', 'inv', '#111418'], ['Acceptées', 'acc', '#3A4048'], ['Réponses', 'rep', '#00A877'], ['Rendez-vous', 'rdv', '#F07C1E'], ['Devis demandés', 'devis', '#B85A0C']].map(([t, k, c], i, a) => `<div class="row"><span>${t}</span><div class="t"><i style="width:${Math.max(8, liT(k) / liT('inv') * 100)}%;background:${c}">${liT(k)}</i></div><span class="r">${i ? pct(liT(k) / liT(a[i - 1][1])) : ''}</span></div>`).join('')}</div>
      <p class="note">${ICO.info}<span>Repère du kit : 20 invitations par semaine, envoyées le lundi.</span></p></div>
    <div class="card"><div class="card-h"><div><h3>Rythme hebdomadaire</h3><p class="sub">Invitations envoyées et rendez-vous obtenus</p></div><div class="legend"><span><i style="background:#111418"></i>Invitations</span><span><i style="background:#F07C1E"></i>Rendez-vous</span></div></div><div class="chart s"><canvas id="ch-li"></canvas></div></div>
  </div>`;
  const rk = Object.keys(raisons).sort((a, b) => raisons[b] - raisons[a]);
  chart('ch-raison', { type: 'bar', data: { labels: rk, datasets: [{ data: rk.map(k => raisons[k]), backgroundColor: rk.map((_, i) => i ? '#C9CCD1' : '#F07C1E'), borderRadius: 5, maxBarThickness: 22 }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: gridY(v => v), y: { grid: { display: false }, border: { display: false }, ticks: { color: '#111418' } } }, plugins: { tooltip: { callbacks: { label: i => ' ' + i.raw + ' devis' } } } } });
  chart('ch-li', { type: 'bar', data: { labels: li.map(w => 'sem. ' + dfr(w.sem)), datasets: [{ label: 'Invitations', data: li.map(w => w.inv), backgroundColor: '#111418', borderRadius: 4, maxBarThickness: 22 }, { type: 'line', label: 'Rendez-vous', data: li.map(w => w.rdv), borderColor: '#F07C1E', backgroundColor: '#F07C1E', pointRadius: 3, tension: .3, yAxisID: 'y2' }] },
    options: { maintainAspectRatio: false, scales: { x: { ...gridX, ticks: { maxTicksLimit: 4 } }, y: gridY(v => v), y2: { position: 'right', grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 4 }, suggestedMax: 8 } } } });
}

/* =========================================================
   6. RÉSEAUX ET SITE
   ========================================================= */
function reseaux() {
  chips('Comptes et concurrents : relevés publics du 05/11/2026 · demandes reçues : données d\'illustration');
  const R = D.reseaux, r = range();
  const fb = R.comptes[0], jours = diff(TODAY, fb.derniere);
  const dem = D.demandes.filter(x => x[0] >= r.a && x[0] <= r.b), demP = D.demandes.filter(x => x[0] >= r.pa && x[0] <= r.pb);
  const can = {}; dem.forEach(x => can[x[1]] = (can[x[1]] || 0) + 1);
  const canP = {}; demP.forEach(x => canP[x[1]] = (canP[x[1]] || 0) + 1);
  const LIST = [['WhatsApp', '#00A877'], ['Téléphone', '#111418'], ['Comptoir', '#9AA7B4'], ['E-mail', '#3E6FD8'], ['Visite commerciale', '#C9CCD1'], ['Facebook', '#F07C1E'], ['Site internet', '#7A5AF8'], ['TikTok', '#E4405F']];
  const total = dem.length;
  const months = []; { const d = pd(TODAY); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 5); for (let i = 0; i < 6; i++) { months.push(fd(d).slice(0, 7)); d.setUTCMonth(d.getUTCMonth() + 1); } }
  const byM = {}; D.demandes.forEach(([d, c]) => { const m = d.slice(0, 7); if (!months.includes(m)) return; (byM[c] || (byM[c] = {}))[m] = ((byM[c] || {})[m] || 0) + 1; });
  const cal = R.calendrier, faits = cal.filter(c => c[0] < TODAY).length;
  $('#page').innerHTML = `
  <div class="g k4">
    <div class="card kpi"><div class="lab">Abonnés Facebook <i class="tag-reel">Réel</i></div><div class="val">${n0(fb.abonnes)}</div><div class="foot"><span>page Office Plus, relevé du 05/11/2026</span></div></div>
    <div class="card kpi"><div class="lab">Dernière publication <i class="tag-reel">Réel</i></div><div class="val">${n0(jours)}<small>jours</small></div><div class="foot"><span class="pill r">Page en sommeil</span><span>depuis le 16 avr. 2024</span></div></div>
    <div class="card kpi"><div class="lab">Demandes reçues</div><div class="val">${n0(total)}</div><div class="foot">${delta(total, demP.length)}<span>${perLabel()}, tous canaux</span></div></div>
    <div class="card kpi"><div class="lab">Demandes venues du site et de TikTok <i class="tag-reel">Réel</i></div><div class="val">0</div><div class="foot"><span class="pill n">Site hors ligne</span><span class="pill n">Pas de compte TikTok</span></div></div>
  </div>
  <div class="g c32">
    <div class="card"><div class="card-h"><div><h3>Demandes reçues par canal</h3><p class="sub">Commandes, devis et questions · 6 derniers mois</p></div></div><div class="chart l"><canvas id="ch-dem"></canvas></div><div class="legend" style="margin-top:10px">${LIST.map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join('')}</div></div>
    <div class="card"><div class="card-h"><div><h3>Répartition</h3><p class="sub">${perLabel()}</p></div></div>
      <div class="list">${LIST.map(([k, c]) => `<div class="li" style="padding:8px 0"><span style="width:9px;height:9px;border-radius:3px;background:${c}"></span><div class="main"><b style="font-weight:500">${k}</b>${k === 'Site internet' ? '<span>le site ne s\'ouvre plus</span>' : k === 'TikTok' ? '<span>aucun compte</span>' : k === 'Facebook' ? '<span>page sans publication</span>' : ''}</div><div class="amt">${can[k] || 0}</div><span style="width:44px;text-align:right;color:var(--mute);font-size:12px">${pct((can[k] || 0) / total)}</span>${can[k] ? delta(can[k], canP[k] || 0) : '<span class="delta eq">–</span>'}</div>`).join('')}</div></div>
  </div>
  <div class="card" style="margin-bottom:16px"><div class="card-h"><div><h3>Présence en ligne</h3><p class="sub">Comptes trouvés au nom d'Office Plus, relevé public du 05/11/2026</p></div><i class="tag-reel">Réel</i></div>
    <div class="social">${R.comptes.map(c => `<div class="soc"><div class="h"><span class="n">${c.res}</span><span class="pill ${c.statut === 'En sommeil' ? 'o' : c.statut.startsWith('À créer') ? 'n' : 'r'}">${c.statut}</span></div><div class="v">${c.abonnes != null ? n0(c.abonnes) : '–'}</div><div class="c">${esc(c.compte)}${c.derniere ? ' · dernière publication ' + (c.derniere.length > 4 ? dfrY(c.derniere) : 'en ' + c.derniere) : ''}</div></div>`).join('')}</div></div>
  <div class="g c12">
    <div class="card"><div class="card-h"><div><h3>Face aux concurrents</h3><p class="sub">Abonnés Facebook, relevé du 05/11/2026</p></div><i class="tag-reel">Réel</i></div><div class="chart s"><canvas id="ch-conc2"></canvas></div>
      <div class="list" style="margin-top:6px">${R.concurrents.map(c => `<div class="li" style="padding:7px 0"><div class="main"><b style="font-weight:${c.nom === 'Office Plus' ? 700 : 500}">${esc(c.nom)}</b></div><span style="font-size:12px;color:var(--mute)">${c.rythme != null ? String(c.rythme).replace('.', ',') + ' posts / sem.' : 'rythme non relevé'}</span></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><div><h3>Calendrier de relance de la page</h3><p class="sub">12 publications proposées du 6 novembre au 2 décembre · à valider par Office Plus</p></div><span class="pill n">${faits} / ${cal.length} passées</span></div>
      <div class="cal">${cal.map(c => `<div class="d ${c[0] === TODAY ? 'today' : ''}"><div class="dt">${cap(JOURS[pd(c[0]).getUTCDay()]).slice(0, 3)}. ${dfr(c[0])}<span>${c[1]}</span></div><p>${esc(c[3])}</p><span class="pill ${c[2].includes('TikTok') ? 'o' : 'n'}">${esc(c[2])}</span></div>`).join('')}</div></div>
  </div>`;
  chart('ch-dem', { type: 'bar', data: { labels: months.map(m => MOIS[+m.slice(5) - 1]), datasets: LIST.map(([k, c]) => ({ label: k, data: months.map(m => (byM[k] || {})[m] || 0), backgroundColor: c, borderRadius: 2, maxBarThickness: 46 })) },
    options: { maintainAspectRatio: false, scales: { x: { ...gridX, stacked: true }, y: { ...gridY(v => v), stacked: true } }, plugins: { tooltip: { mode: 'index', filter: i => i.raw > 0 } } } });
  chart('ch-conc2', { type: 'bar', data: { labels: R.concurrents.map(c => c.nom), datasets: [{ data: R.concurrents.map(c => c.fb), backgroundColor: R.concurrents.map(c => c.nom === 'Office Plus' ? '#F07C1E' : '#111418'), borderRadius: 5, maxBarThickness: 22 }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: gridY(v => n0(v)), y: { grid: { display: false }, border: { display: false }, ticks: { color: '#111418' } } }, plugins: { tooltip: { callbacks: { label: i => ' ' + n0(i.raw) + ' abonnés' } } } } });
}
})();
