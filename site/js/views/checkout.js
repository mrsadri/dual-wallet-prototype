import { CHANGE_DATE } from '../config.js';
import { t } from '../content/copy.js';
import { planPayment } from '../domain/payment.js';
import { legacyName, wname } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { M } from '../ui/format.js';

function selectableOption(state, { wallet, balance, status, amount }, price) {
  const on = status === 'on';
  const split = !on ? '' : amount >= price ? t('co.full') : t('co.partial', { w: M(amount), g: M(price - amount) });
  return `<div class="opt selectable ${on ? 'on' : ''}" data-act="cotoggle" data-v="${wallet}" role="checkbox" aria-checked="${on}" tabindex="0"><span class="cb">${on ? '✓' : ''}</span><div class="grow">
    <div class="ttl"><span>${t('co.useWallet', { name: wname(state, wallet) })}</span><span>${t('card.balance', { amount: M(balance) })}</span></div>
    ${split ? `<div class="s">${split}</div>` : ''}</div></div>`;
}

const disabledOption = (title, body) => `<div class="opt dis"><span class="cb"></span><div class="grow"><div class="ttl">${title}</div>${body}</div></div>`;

function walletOption(state, option, price) {
  const { wallet, balance, status } = option;
  if (status === 'on' || status === 'off') return selectableOption(state, option, price);

  const name = wname(state, wallet);
  const label = `<span>${t('co.useWallet', { name })}</span>`;
  if (status === 'negative') {
    return disabledOption(`${label}<span class="danger">${M(balance)} تومان</span>`, `<div class="s">${t('co.neg', { name })}${B('A2')}</div>`);
  }
  if (status === 'empty') return disabledOption(label, `<div class="s">${t('co.zero', { name })}</div>`);

  const reason = wallet === 'rial'
    ? `<div class="s"><b>${t('co.rial.notForNonAuto')}</b></div><div class="s">${t('co.rial.notForNonAuto.alt')}</div><div class="mt-6"><button class="link" data-act="wdfrom" data-v="rial">${t('co.rial.withdrawLink')}</button></div>`
    : `<div class="s">${t('co.legacy.notForAuto', { legacy: legacyName(state) })}</div>`;
  return disabledOption(`<span>${name}</span><span>${t('card.balance', { amount: M(balance) })}</span>`, reason);
}

function notice(state) {
  if (state.phase !== 'P1') return '';
  return `<div class="alert"><span class="ai">i</span><div class="grow">${t('p1.checkout', { date: CHANGE_DATE })} <button class="link" data-act="guide">${t('p1.more')}</button></div></div>`;
}

export function checkout(state, kind) {
  const { price, options, gateway, walletTotal } = planPayment(state, kind);
  const auto = kind === 'CA';
  return `${notice(state)}
  <div class="two">
    <div class="box">
      <h1 class="page-title">${t(auto ? 'co.auto.title' : 'co.nonauto.title')}</h1>
      <div class="muted">${t(auto ? 'co.auto.item' : 'co.nonauto.item')}</div>
      <h2 class="section-title">${t('co.method')}</h2>
      ${options.map(option => walletOption(state, option, price)).join('')}
      <div class="opt ${gateway > 0 ? 'on' : 'dis'}"><span class="cb">${gateway > 0 ? '✓' : ''}</span><div class="grow"><div class="ttl"><span>${t('co.gateway')}</span>${gateway > 0 ? `<span>${M(gateway)} تومان</span>` : ''}</div></div></div>
    </div>
    <div class="box sum">
      <div><span>${t('co.sum.price')}</span><span>${M(price)} تومان</span></div>
      <div><span>${t('co.sum.wallet')}</span><span>${M(walletTotal)} تومان</span></div>
      <div><span>${t('co.sum.gateway')}</span><span>${M(gateway)} تومان</span></div>
      <button class="btn pri pay" data-act="paid">${gateway > 0 ? t('co.pay.gateway', { amount: M(gateway) }) : t('co.pay.wallet')}</button>
    </div>
  </div>`;
}
