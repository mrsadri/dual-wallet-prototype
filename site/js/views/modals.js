import { BALANCES_AT_TRANSFER, CHANGE_DATE } from '../config.js';
import { t } from '../content/copy.js';
import { legacyName, nonAutoSeller } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { M } from '../ui/format.js';

export function rulesTable(state) {
  return `<table class="mt"><tr><td></td><th>${t('fv.in')}</th><th>${t('fv.use')}</th></tr>
    <tr><td>${t('name.rial')}</td><td>${t('fv.rial.in')}</td><td>${t('fv.rial.use')}</td></tr>
    <tr><td>${legacyName(state)}</td><td>${t('fv.legacy.in')}</td><td>${t('fv.legacy.use')}</td></tr></table>`;
}

export function fvModal(state) {
  const pre = BALANCES_AT_TRANSFER[state.N];
  const lead = pre > 0 ? t('fv.moved', { amount: M(pre), date: CHANGE_DATE }) + B('A5') : pre === 0 ? t('fv.zero', { date: CHANGE_DATE }) : t('fv.negmoved', { amount: M(pre), date: CHANGE_DATE }) + B('OQ7');
  return `<div class="ov"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h3 id="modal-title">${t('fv.title')}</h3>
    <div class="lead">${lead}</div>
    ${rulesTable(state)}
    <div class="note">${t('fv.both')}</div>
    ${nonAutoSeller(state) ? `<div class="note strong">${t('fv.nonauto')}</div>` : ''}
    <div class="small small-strong">${t('fv.why')}${B('OQ4')}</div>
    <div class="acts"><button class="btn pri" data-act="fvclose">${t('fv.cta')}</button>${pre !== 0 ? `<button class="btn" data-act="fvtx">${t('fv.seeTx')}</button>` : ''}</div>
    <div class="small">${t('fv.later')}</div>
  </div></div>`;
}

export function guideModal(state) {
  const q = (a, b) => `<details><summary>${t(a, { legacy: legacyName(state) })}</summary><p>${t(b)}</p></details>`;
  return `<div class="ov"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h3 id="modal-title">${t('guide.title')}</h3>
    ${rulesTable(state)}
    <div class="note">${t('fv.both')}</div>
    <div class="note strong">${t('fv.nonauto')}</div>
    <div class="small small-strong">${t('fv.why')}${B('OQ4')}</div>
    <div class="faq">${q('faq.q1', 'faq.a1')}${q('faq.q2', 'faq.a2')}${q('faq.q3', 'faq.a3')}${q('faq.q4', 'faq.a4')}${q('faq.q5', 'faq.a5')}</div>
    <div class="acts"><button class="btn pri" data-act="guideclose">بستن</button></div>
  </div></div>`;
}
