import { NOTES } from '../content/notes.js';
import { t } from '../content/copy.js';
import { isPre } from '../domain/wallets.js';
import { reduce } from '../state/actions.js';
import { isModified, neighbours } from '../state/browsing.js';
import { decodeState, encodeState } from '../state/url.js';
import { appHTML, layerHTML } from '../views/app.js';
import { ctlHTML } from '../views/control-panel.js';
import { scenarioBar } from '../views/scenario-bar.js';
import { scenarioList } from '../views/scenario-list.js';
import { siteNav } from '../views/site-nav.js';
import { createFit } from './fit.js';
import { createPanel } from './panel.js';

const TOAST_MS = 2600;
const RESETS_SCROLL = new Set(['sc', 'go', 'tx', 'wdfrom', 'fvtx']);
const CHANGE_ACTIONS = new Set(['filter', 'legacyTx', 'badges']);

const frame = document.querySelector('.frame');
const announcer = document.getElementById('announcer');
const list = document.getElementById('scenario-list');
const settings = document.getElementById('settings');
const bar = document.getElementById('scenario-bar');
const search = document.getElementById('scenario-search');
const requiredOnly = document.getElementById('required-only');

const panel = createPanel({
  element: document.getElementById('controls'),
  toggle: document.getElementById('panel-toggle'),
  stage: document.querySelector('.stage'),
  scrim: document.querySelector('.pt-scrim'),
});
const fit = createFit({
  stage: document.querySelector('.stagebody'),
  holder: document.querySelector('.frame-holder'),
  frame,
  zoomButton: document.getElementById('zoom'),
});

let state = decodeState(location.hash);
let toastElement = null;
let toastTimer;
let modalOpener = null;

const modalIsOpen = () => state.guide || (state.fv && state.screen === 'W' && !isPre(state));

/** Rendering replaces nodes, so controls are identified by their data attributes. */
function describe(element) {
  if (!element?.matches('[data-act], #tuIn')) return null;
  if (element.id === 'tuIn') return { selector: '#tuIn', index: 0 };
  const selector = ['act', 'k', 'v', 'b']
    .filter(key => element.dataset[key] !== undefined)
    .map(key => `[data-${key}="${CSS.escape(element.dataset[key])}"]`)
    .join('');
  return { selector, index: [...document.querySelectorAll(selector)].indexOf(element) };
}

const locate = target => target && document.querySelectorAll(target.selector)[target.index];

function renderList() {
  list.innerHTML = scenarioList(state.base, { query: search.value, requiredOnly: requiredOnly.checked });
}

function renderBar() {
  bar.innerHTML = scenarioBar(state, { ...neighbours(state.base, requiredOnly.checked), modified: isModified(state) });
}

/** Scrolls only the list, only as far as needed. */
function revealCurrent() {
  const current = list.querySelector('[aria-current]');
  if (!current?.getClientRects().length) return;
  const area = list.getBoundingClientRect();
  const item = current.parentElement.getBoundingClientRect();
  const headingHeight = list.querySelector('.pt-group').offsetHeight;
  if (item.top < area.top + headingHeight) list.scrollTop -= area.top + headingHeight - item.top;
  else if (item.bottom > area.bottom) list.scrollTop += Math.min(item.bottom - area.bottom, item.top - area.top - headingHeight);
}

function showTab(name) {
  for (const button of document.querySelectorAll('[data-act="tab"]')) {
    button.setAttribute('aria-pressed', String(button.dataset.v === name));
  }
  for (const section of document.querySelectorAll('[data-section]')) section.hidden = section.dataset.section !== name;
}

function render({ keepScroll = true, focus = describe(document.activeElement), keepFocus = false } = {}) {
  const top = keepScroll ? frame.querySelector('.scroller')?.scrollTop ?? 0 : 0;
  const hadModal = frame.querySelector('.modal') !== null;
  const settingsTop = settings.scrollTop;
  const listTop = list.scrollTop;
  const open = modalIsOpen();

  settings.innerHTML = ctlHTML(state);
  settings.scrollTop = settingsTop;
  renderList();
  list.scrollTop = listTop;
  renderBar();
  for (const button of document.querySelectorAll('.pt-devices button')) {
    button.setAttribute('aria-pressed', String(button.dataset.v === state.vp));
  }
  frame.className = `frame ${state.vp}`;
  document.body.classList.toggle('nobadges', !state.badges);
  frame.innerHTML = `<div class="scroller" tabindex="-1" ${open ? 'inert' : ''}>${appHTML(state)}</div>${layerHTML(state)}`;
  if (toastElement) frame.append(toastElement);
  fit.setViewport(state.vp);

  const scroller = frame.querySelector('.scroller');
  scroller.scrollTop = top;

  if (open && !hadModal && !keepFocus) {
    modalOpener = focus;
    frame.querySelector('.modal .acts button').focus({ preventScroll: true });
    return;
  }
  const target = locate(!open && hadModal && !keepFocus ? modalOpener : focus);
  if (target && !target.disabled && !target.closest('[inert]') && target.getClientRects().length) target.focus({ preventScroll: true });
  else if (keepFocus && focus) bar.querySelector('.pt-current').focus({ preventScroll: true });
  else if (focus) scroller.focus({ preventScroll: true });
}

function toast(message) {
  toastElement?.remove();
  toastElement = document.createElement('div');
  toastElement.className = 'toast';
  toastElement.textContent = message;
  frame.append(toastElement);
  announcer.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.remove();
    toastElement = null;
    announcer.textContent = '';
  }, TOAST_MS);
}

function syncUrl() {
  history.replaceState(null, '', location.pathname + location.search + encodeState(state));
}

function dispatch(action, focus) {
  state = reduce(state, action);
  syncUrl();
  // Browsing scenarios and adjusting settings must not move focus into the product.
  const keepFocus = action.type === 'sc' || action.type === 'set';
  render({ keepScroll: !RESETS_SCROLL.has(action.type) && action.key !== 'screen', focus, keepFocus });
  if (action.type === 'sc') revealCurrent();
}

function step(direction) {
  if (direction !== 'previous' && direction !== 'next') return;
  const id = neighbours(state.base, requiredOnly.checked)[direction];
  if (id) dispatch({ type: 'sc', value: id }, describe(bar.querySelector(`[data-v="${direction}"]`)));
}

async function copyLink() {
  syncUrl();
  try {
    await navigator.clipboard.writeText(location.href);
    toast('لینک این حالت کپی شد');
  } catch {
    toast('کپی نشد. لینک را از نوار آدرس بردارید.');
  }
}

/** Effects that do not change state. */
const EFFECTS = {
  paid: () => toast('پرداخت شبیه‌سازی شد'),
  support: () => toast('تماس با پشتیبانی: شماره‌ی نمونه'),
  badge: ({ b }) => toast(`${b}: ${NOTES[b]}`),
  toast: () => toast(t('toast.off')),
  copylink: copyLink,
  panel() {
    panel.set(!panel.isOpen());
    if (panel.isOpen()) revealCurrent();
  },
  closepanel: () => panel.set(false),
  details() {
    showTab('scenarios');
    search.value = '';
    renderList();
    panel.set(true);
    revealCurrent();
    list.querySelector('[aria-current]')?.focus({ preventScroll: true });
  },
  tab({ v }) {
    showTab(v);
    if (v === 'scenarios') revealCurrent();
  },
  zoom: () => fit.toggle(),
  step: ({ v }) => step(v),
  restore: () => dispatch({ type: 'sc', value: state.base }, describe(bar.querySelector('.pt-current'))),
};

document.addEventListener('click', event => {
  const element = event.target.closest('[data-act]');
  if (!element || CHANGE_ACTIONS.has(element.dataset.act)) return;
  if (element.tagName === 'A') event.preventDefault();

  const { act, v, k, w } = element.dataset;
  if (Object.hasOwn(EFFECTS, act)) {
    EFFECTS[act](element.dataset);
    return;
  }
  let focus = describe(element);
  const fromDrawer = panel.isDrawer() && element.closest('.ctl') !== null;
  if (fromDrawer && ['sc', 'fvopen', 'guide'].includes(act)) {
    panel.set(false);
    focus = describe(bar.querySelector('.pt-current'));
  }
  dispatch({ type: act, value: v, key: k, wallet: w }, focus);
  if (act === 'tusubmit' && !state.tuErr) toast('واریز شبیه‌سازی شد');
});

document.addEventListener('change', event => {
  const element = event.target.closest('[data-act]');
  if (!element || !CHANGE_ACTIONS.has(element.dataset.act)) return;
  dispatch({ type: element.dataset.act, value: element.value, checked: element.checked }, describe(element));
});

requiredOnly.addEventListener('change', () => {
  renderList();
  renderBar();
});

search.addEventListener('input', () => {
  renderList();
  list.scrollTop = 0;
});

document.addEventListener('input', event => {
  if (event.target.id !== 'tuIn') return;
  // No render here: it would move the caret while typing.
  state = reduce(state, { type: 'tuinput', value: event.target.value });
  syncUrl();
  renderBar();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (panel.isDrawer()) panel.set(false);
    else if (modalIsOpen()) dispatch({ type: state.guide ? 'guideclose' : 'fvclose' });
  } else if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="checkbox"]')) {
    event.preventDefault();
    event.target.click();
  }
});

window.addEventListener('hashchange', () => {
  state = decodeState(location.hash);
  render({ keepScroll: false, focus: null });
  revealCurrent();
});

document.querySelector('.topnav').insertAdjacentHTML('beforeend', siteNav('prototype'));
render({ keepScroll: false, focus: null });
revealCurrent();
