// ══════════════════════════════════════════════════════
// STATE · Variables globales de la aplicación
// ══════════════════════════════════════════════════════
let currentView    = 'dashboard';
let currentPatient = null;
let consultaTab    = 'resumen';
let pxFilter       = 'todos';
let pxSearch       = '';
let chartInstances = {};
let currentReceipt = null;
let agendaWeekOffset = 0; // legacy — usado por google-calendar.js

// ── VIEWS namespace (se puebla en views/*.js) ──────────
const VIEWS = {};

// ══════════════════════════════════════════════════════
// UTILS · Funciones auxiliares
// ══════════════════════════════════════════════════════
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const calcIMC     = (w, h) => (w / (h * h)).toFixed(1);
const imcCat      = imc => {
  imc = parseFloat(imc);
  if (imc < 18.5) return { label: 'Bajo peso',   c: 'var(--info)' };
  if (imc < 25)   return { label: 'Peso normal',  c: 'var(--sage)' };
  if (imc < 30)   return { label: 'Sobrepeso',    c: 'var(--gold)' };
  return           { label: 'Obesidad',   c: 'var(--terra)' };
};
const calcTMB     = (w, h, age, sexo = 'femenino') => Math.round(10 * w + 6.25 * (h * 100) - 5 * age + (sexo === 'masculino' ? 5 : -161));
const calcWater   = (w, sem = 0, act = 0) => {
  let ml = w * 35;
  if (sem >= 27) ml += 500;
  else if (sem >= 13) ml += 300;
  ml += act; // extra ml por actividad física
  return ml;
};
const calcGanancia = imc => {
  if (imc < 18.5) return { min: 12.5, max: 18,   l: 'Bajo peso' };
  if (imc < 25)   return { min: 11.5, max: 16,   l: 'Normal' };
  if (imc < 30)   return { min: 7,    max: 11.5, l: 'Sobrepeso' };
  return           { min: 5,    max: 9,    l: 'Obesidad' };
};
const fmt$ = n => '$' + n.toLocaleString('es-MX');
const waLink = (p, t) => `https://wa.me/52${p}?text=${encodeURIComponent(t)}`;

const semLabels = { ok: 'Normal', warn: 'Revisar', alert: 'Atención' };
const semClass  = { ok: 'sem-ok', warn: 'sem-warn', alert: 'sem-alert' };
const semDot    = { ok: 'sem-dot-ok', warn: 'sem-dot-warn', alert: 'sem-dot-alert' };

function toast(msg, ico = '✓') {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${ico}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}
function makeChart(id, config) {
  destroyChart(id);
  const c = $(id);
  if (c && window.Chart) chartInstances[id] = new Chart(c, config);
  return chartInstances[id];
}
