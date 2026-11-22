import { CHANGE_DATE } from '../config.js';
import { isCritical } from '../domain/rules.js';
import { t } from '../content/copy.js';
import { negCause } from '../domain/transactions.js';
import { bal, isPre, legacyName, wname } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { M } from '../ui/format.js';

export function negAlertInline(state, w) {
  const b = bal(state, w), c = negCause(state, w);
  const cause = c ? `${c.title}، ${c.sub}` : '';
  return `<div class="alert alert-inline"><span class="ai">!</span><div class="grow">
    <div class="at">${t('neg.title', { name: wname(state, w) })}</div>
    <p>${t('neg.cause', { cause })} ${c ? `<button class="link" data-act="tx" data-v="${c.id}">${t('btn.seeTx')}</button>` : ''}</p>
    <p>${t('neg.keep')}</p>
    <p>${w === 'legacy' ? t('neg.fix.legacy') + B('OQ2') : t('neg.fix.rial') + B('A3')}</p>
    ${w === 'rial' ? `<div class="aa"><button class="btn sm" data-act="go" data-v="TU">${t('btn.topupToFix')}</button></div>` : ''}
  </div></div>`;
}

export function pageAlerts(state) {
  if (isPre(state)) return '';
  const negs = ['rial', 'legacy'].filter(w => bal(state, w) < 0);
  const crit = negs.filter(w => isCritical(bal(state, w)));
  if (negs.length === 2) {
    const red = crit.length > 0;
    return `<div class="alert ${red ? 'red' : ''}"><span class="ai">!</span><div class="grow">
      <div class="at">${t('neg.both.title')}</div>
      <ul>${negs.map(w => { const c = negCause(state, w); return `<li><b>${wname(state, w)}:</b> ${M(bal(state, w))} تومان${c ? `، ${t('neg.cause', { cause: c.title })} <button class="link" data-act="tx" data-v="${c.id}">${t('btn.seeTx')}</button>` : ''}${isCritical(bal(state, w)) ? ' (کمتر از منفی ۱۵ میلیون تومان)' : ''}</li>`; }).join('')}</ul>
      <p>${t('neg.both.body')}</p>
      ${red ? `<p>${t('neg.critical.body')}</p><div class="aa"><button class="btn red sm" data-act="support">${t('btn.support')}</button></div>` : ''}
    </div></div>`;
  }
  return crit.map(w => {
    const c = negCause(state, w);
    return `<div class="alert red"><span class="ai">!</span><div class="grow">
      <div class="at">${t('neg.critical.title', { name: wname(state, w) })}${w === 'rial' ? B('A1') : ''}</div>
      <p>موجودی: ${M(bal(state, w))} تومان${c ? `. ${t('neg.cause', { cause: c.title + '، ' + c.sub })}` : ''}</p>
      <p>${t('neg.critical.body')}</p>
      <div class="aa"><button class="btn red sm" data-act="support">${t('btn.support')}</button>${c ? `<button class="link" data-act="tx" data-v="${c.id}">${t('btn.seeTx')}</button>` : ''}</div>
    </div></div>`;
  }).join('');
}

export function p1Banner(state) {
  return `<div class="banner"><div class="at">${t('p1.title', { date: CHANGE_DATE })}</div>
    <ul><li>${t('p1.b1')}</li><li>${t('p1.b2', { legacy: legacyName(state) })}</li><li>${t('p1.b3')}</li></ul>
    <button class="link" data-act="guide">${t('p1.more')}</button></div>`;
}
