import { withdrawalBlock } from '../domain/rules.js';
import { t } from '../content/copy.js';
import { bal, isPre, wname } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { M } from '../ui/format.js';
import { backBtn } from './chrome.js';

export function withdrawPage(state) {
  const w = state.wallet === 'gold' ? 'rial' : state.wallet, b = bal(state, w), name = isPre(state) ? t('name.rial') : wname(state, w);
  const head = `${backBtn()}<div class="box"><h1 class="page-title">${t('wd.title', { name })}</h1>`;
  if (state.wdDone) return `${head}<div class="okbox"><div class="ok">✓</div><div class="done-title">${t('wd.done', { amount: M(b) })}</div><div class="help">${t('wd.time')}${B('OQ3')}</div><button class="btn mt-14" data-act="go" data-v="W">${t('btn.back')}</button></div></div>`;
  if (withdrawalBlock(b)) return `${head}<div class="alert ${b < 0 ? 'red' : ''} mt-14"><span class="ai">!</span><div class="grow">
      <div class="at">${b < 0 ? t('wd.blocked.neg') + B('A6') : t('wd.blocked.min')}</div>
      <p>${t('card.balance', { amount: M(b) })}</p>
      ${b >= 0 && b > 0 && !isPre(state) ? `<p>${t(w === 'legacy' ? 'panel.withdraw.min.legacy' : 'panel.withdraw.min.rial')}</p>` : ''}
    </div></div></div>`;
  const sheba = state.sheba === 'ok'
    ? `<div class="opt on"><span class="cb">✓</span><div class="grow"><div class="ttl"><span class="num">IR•• •••• •••• •••• ۱۲۳۴</span><span>بانک نمونه</span></div><div class="s">به نام کاربر نمونه</div></div></div>`
    : `<div class="alert mt-8"><span class="ai">!</span><div class="grow">${t('wd.sheba.none')}<div class="aa"><button class="btn sm" data-act="toast">${t('wd.sheba.add')}</button></div></div></div>`;
  return `${head}
    <div class="field-label">${t('wd.amount')}</div>
    <div class="field locked"><span class="locked-amount">${M(b)} تومان</span><span aria-hidden="true">🔒</span></div>
    <div class="help">${t('wd.lock')}</div>
    <div class="field-label">${t('wd.sheba')}</div>
    ${sheba}
    <div class="help">${t('wd.sheba.rule')}</div>
    <div class="help mt-12">${t('wd.time')}${B('OQ3')}</div>
    ${state.from === 'CN' ? `<div class="callout">${t('wd.afterNonAuto')}</div>` : ''}
    <button class="btn pri submit" data-act="wdsubmit" ${state.sheba !== 'ok' ? 'disabled' : ''}>${t('wd.btn')}</button>
  </div>`;
}
