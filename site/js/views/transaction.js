import { t } from '../content/copy.js';
import { allRows, findTx, transactionCode } from '../domain/transactions.js';
import { isPre, legacyName, wname } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { MS, fa } from '../ui/format.js';
import { backBtn } from './chrome.js';

export function txPage(state) {
  const f = findTx(state, state.txId) || { r: allRows(state, state.wallet)[0], w: state.wallet };
  if (!f.r) return `${backBtn()}<div class="box empty">${t('hist.empty')}</div>`;
  const { r, w } = f;
  let why = '', extra = '';
  if (r.type === 'transfer') {
    why = t('txd.why.transfer');
    const other = w === 'rial' ? 'legacy' : 'rial';
    extra = `<button class="link" data-act="tx" data-v="${w === 'rial' ? 'l-transfer' : 'n-transfer'}" data-w="${other}">${t('txd.counterpart', { other: wname(state, other) })}</button>`;
  } else if (r.type === 'comm' && r.nonauto) why = t('txd.why.commNonAuto');
  else if (r.type === 'reward' && !isPre(state)) why = t('txd.why.reward');
  else if (r.type === 'refund') why = t('txd.why.refund', { legacy: legacyName(state) });
  else if (r.type === 'adjust') why = t('txd.why.adjust');
  const typeName = { transfer: 'انتقال موجودی', comm: 'کارمزد', reward: 'پاداش', refund: 'برگشت وجه', adjust: r.amt < 0 ? 'اصلاحیه' : 'مغایرت', withdraw: 'برداشت', purchase: 'خرید', topup: 'واریز به کیف پول' }[r.type];
  return `${backBtn()}
  <div class="box">
    <div class="titlerow"><h1>${t('txd.title')}</h1><span class="st st-inline">${t(r.st)}</span></div>
    <div class="big tx-amount ${r.amt < 0 ? 'neg' : ''}">${MS(r.amt)} <small class="unit">تومان</small></div>
    <div class="tx-name">${r.title}${(r.badges || []).length ? B(...r.badges) : ''}</div>
    <dl class="kv">
      <dt>${t('txd.wallet')}</dt><dd>${isPre(state) ? t('name.rial') : wname(state, w)}</dd>
      <dt>${t('txd.type')}</dt><dd>${typeName}${r.tag ? `<span class="tag2">${r.tag}</span>` : ''}</dd>
      <dt>${t('txd.date')}</dt><dd>${r.date}، ساعت ${r.time}</dd>
      <dt>${t('txd.id')}</dt><dd><span class="num">${fa(transactionCode(r.id))}</span></dd>
      ${r.ref ? `<dt>${t('txd.ref')}</dt><dd>${r.ref} <button class="link gap-start" data-act="toast">${t('txd.seeOrder')}</button></dd>` : ''}
    </dl>
    ${why ? `<div class="callout"><div class="at">${t('txd.why')}</div>${why}${extra ? `<div class="mt-8">${extra}</div>` : ''}</div>` : ''}
  </div>`;
}
