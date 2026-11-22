import { isCritical, withdrawalBlock } from '../domain/rules.js';
import { t } from '../content/copy.js';
import { bal, isPre, wname } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { M } from '../ui/format.js';
import { negAlertInline } from './alerts.js';

export function panel(state) {
  const w = state.wallet, b = bal(state, w);
  if (w === 'gold') {
    return `<div class="box"><div class="bp"><div><div class="lbl">${t('panel.title', { name: t('name.gold') })}</div><div class="amt">${t('card.empty')}</div></div>
      <div class="acts"><button class="btn" data-act="toast">خرید طلا</button><button class="btn pri" data-act="toast">فروش طلا</button></div></div></div>`;
  }
  if (isPre(state)) {
    return `<div class="box"><div class="bp"><div><div class="lbl">${t('panel.title', { name: t('name.rial') })}</div><div class="amt ${b < 0 ? 'neg' : ''}">${M(b)} <small>تومان</small></div></div>
      <div class="acts"><button class="btn" data-act="go" data-v="TU">${t('btn.topup')}</button><button class="btn pri" data-act="go" data-v="WD" ${withdrawalBlock(b) ? 'disabled' : ''}>${t('btn.withdraw')}</button></div></div></div>`;
  }
  const negs = ['rial', 'legacy'].filter(x => bal(state, x) < 0);
  const inline = b < 0 && !isCritical(b) && negs.length < 2 ? negAlertInline(state, w) : '';
  let reason = '';
  if (withdrawalBlock(b) === 'negative') reason = t('panel.withdraw.negative') + B('A6');
  else if (withdrawalBlock(b)) reason = t('panel.withdraw.min') + (b > 0 ? ' ' + t(w === 'legacy' ? 'panel.withdraw.min.legacy' : 'panel.withdraw.min.rial') : '');
  else reason = t('panel.withdraw.full');
  const wdBtn = `<div class="actcol"><button class="btn pri" data-act="go" data-v="WD" ${withdrawalBlock(b) ? 'disabled' : ''}>${t('btn.withdraw')}</button><div class="why">${reason}</div></div>`;
  const left = w === 'rial'
    ? `<button class="btn self-start" data-act="go" data-v="TU">${t('btn.topup')}</button>${wdBtn}`
    : `<div class="why why-note">${t('panel.legacy.notopup')}</div>${wdBtn}`;
  return `<div class="box">${inline}<div class="bp">
      <div><div class="lbl">${t('panel.title', { name: wname(state, w) })}</div><div class="amt ${b < 0 ? 'neg' : ''}">${M(b)} <small>تومان</small></div></div>
      <div class="acts">${left}</div>
    </div>
    <div class="rules"><span>${t(w === 'rial' ? 'panel.rial.in' : 'panel.legacy.in')}</span><span>${t(w === 'rial' ? 'panel.rial.use' : 'panel.legacy.use')}</span></div>
  </div>`;
}
