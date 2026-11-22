import { CHANGE_DATE } from '../config.js';
import { t } from '../content/copy.js';
import { allRows, legacyRows, passFilter } from '../domain/transactions.js';
import { isPre } from '../domain/wallets.js';
import { B, BS } from '../ui/badge.js';
import { MS } from '../ui/format.js';
import { I } from '../ui/icons.js';

export function txRow(state, r) {
  const ic = r.type === 'transfer' ? I.swap : r.amt < 0 ? I.out : I.in;
  return `<button class="rowx ${state.txId === r.id && state.screen === 'W' ? 'hl' : ''}" data-act="tx" data-v="${r.id}">
    <span class="di">${ic}</span>
    <span class="tt"><b>${r.title}${r.tag ? `<span class="tag2">${r.tag}</span>` : ''}${(r.badges || []).length ? BS(...r.badges) : ''}</b><span>${r.sub}</span></span>
    <span class="dt">${r.date}<br>ساعت ${r.time}</span>
    <span class="am ${r.amt < 0 ? 'neg' : ''}">${MS(r.amt)} <small>تومان</small></span>
    <span class="st">${t(r.st)}</span>
    <span class="chev">${I.chev}</span>
  </button>`;
}

export function histBox(state) {
  const w = state.wallet;
  let list = '';
  if (w === 'legacy' && !isPre(state)) {
    const x = legacyRows(state);
    const a = x.after.filter(r => passFilter(state, r)), b = x.before.filter(r => passFilter(state, r));
    list = a.map(r => txRow(state, r)).join('') + (b.length ? `<div class="divider">${t('hist.divider', { date: CHANGE_DATE })}${B('OQ6')}</div>` + b.map(r => txRow(state, r)).join('') : '');
    if (!a.length && !b.length) list = `<div class="empty">${t('hist.empty')}</div>`;
  } else {
    const rows = allRows(state, w).filter(r => passFilter(state, r));
    list = rows.length ? rows.map(r => txRow(state, r)).join('') : `<div class="empty">${t('hist.empty')}</div>`;
  }
  const opt = (v, k) => `<option value="${v}" ${state.filter === v ? 'selected' : ''}>${t(k)}</option>`;
  return `<div class="box hist">
    <div class="search"><input aria-label="${t('hist.searchBtn')}" placeholder="${t('hist.search')}"><span>${t('hist.searchBtn')} ‹</span></div>
    <div class="filters">
      <div class="fld"><select data-act="filter" aria-label="نوع تراکنش">${opt('all', 'hist.filter.all')}${opt('in', 'hist.filter.in')}${opt('out', 'hist.filter.out')}${opt('comm', 'hist.filter.comm')}${opt('refund', 'hist.filter.refund')}</select></div>
      <div class="fld"><span>۴ آذر ۱۴۰۲</span>${I.cal}</div>
      <div class="fld"><span>۲۵ اسفند ۱۴۰۲</span>${I.cal}</div>
    </div>
    ${list}
  </div>`;
}
