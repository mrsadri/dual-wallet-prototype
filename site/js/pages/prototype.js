import { NOTES } from '../content/notes.js';
import { t } from '../content/copy.js';
import { isPre } from '../domain/wallets.js';
import { reduce } from '../state/actions.js';
import { decodeState, encodeState } from '../state/url.js';
import { appHTML, layerHTML } from '../views/app.js';
import { ctlHTML } from '../views/control-panel.js';
import { siteNav } from '../views/site-nav.js';

const TOAST_MS = 2600;
const RESETS_SCROLL = new Set(['sc', 'go', 'tx', 'wdfrom', 'fvtx']);
const CHANGE_ACTIONS = new Set(['filter', 'legacyTx', 'badges']);

const frame = document.querySelector('.frame');
const panel = document.querySelector('.ctl');
const announcer = document.getElementById('announcer');
const panelToggle = document.getElementById('panel-toggle');

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

function render({ keepScroll = true, focus = describe(document.activeElement) } = {}) {
  const top = keepScroll ? frame.querySelector('.scroller')?.scrollTop ?? 0 : 0;
  const hadModal = frame.querySelector('.modal') !== null;
  const panelTop = panel.scrollTop;
  const open = modalIsOpen();

  panel.innerHTML = ctlHTML(state);
  panel.scrollTop = panelTop;
  frame.className = `frame ${state.vp}`;
  document.body.classList.toggle('nobadges', !state.badges);
  frame.innerHTML = `<div class="scroller" tabindex="-1" ${open ? 'inert' : ''}>${appHTML(state)}</div>${layerHTML(state)}`;
  if (toastElement) frame.append(toastElement);

  const scroller = frame.querySelector('.scroller');
  scroller.scrollTop = top;

  if (open && !hadModal) {
    modalOpener = focus;
    frame.querySelector('.modal .acts button').focus({ preventScroll: true });
    return;
  }
  const target = locate(!open && hadModal ? modalOpener : focus);
  if (target && !target.closest('[inert]') && target.getClientRects().length) target.focus({ preventScroll: true });
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
  render({ keepScroll: !RESETS_SCROLL.has(action.type) && action.key !== 'screen', focus });
}

function setPanel(open) {
  document.body.classList.toggle('ctl-open', open);
  panelToggle.setAttribute('aria-expanded', String(open));
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
  panel: () => setPanel(!document.body.classList.contains('ctl-open')),
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
  dispatch({ type: act, value: v, key: k, wallet: w }, describe(element));
  if (act === 'tusubmit' && !state.tuErr) toast('واریز شبیه‌سازی شد');
  if (act === 'sc' || act === 'fvopen' || (act === 'guide' && panel.contains(element))) setPanel(false);
});

document.addEventListener('change', event => {
  const element = event.target.closest('[data-act]');
  if (!element || !CHANGE_ACTIONS.has(element.dataset.act)) return;
  dispatch({ type: element.dataset.act, value: element.value, checked: element.checked }, describe(element));
});

document.addEventListener('input', event => {
  if (event.target.id !== 'tuIn') return;
  // No render here: it would move the caret while typing.
  state = reduce(state, { type: 'tuinput', value: event.target.value });
  syncUrl();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (document.body.classList.contains('ctl-open')) setPanel(false);
    else if (modalIsOpen()) dispatch({ type: state.guide ? 'guideclose' : 'fvclose' });
  } else if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="checkbox"]')) {
    event.preventDefault();
    event.target.click();
  }
});

window.addEventListener('hashchange', () => {
  state = decodeState(location.hash);
  render({ keepScroll: false, focus: null });
});

document.querySelector('.topnav').insertAdjacentHTML('afterbegin', siteNav('prototype'));
render({ keepScroll: false, focus: null });
