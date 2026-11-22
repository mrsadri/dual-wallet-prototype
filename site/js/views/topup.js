import { t } from '../content/copy.js';
import { isPre, legacyName } from '../domain/wallets.js';
import { B } from '../ui/badge.js';
import { parseAmount } from '../domain/rules.js';
import { money } from '../ui/format.js';
import { backBtn } from './chrome.js';

export function topupPage(state) {
  if (state.wallet === 'legacy' && !isPre(state)) return `${backBtn()}<div class="box"><div class="alert"><span class="ai">i</span><div class="grow">${t('tu.legacy', { legacy: legacyName(state) })}</div></div></div>`;
  const err = state.tuErr;
  return `${backBtn()}<div class="box box-narrow">
    <h1 class="page-title">${t('tu.title')}</h1>
    <div class="field-label">${t('tu.amount')}</div>
    <div class="field ${err ? 'err' : ''}"><input id="tuIn" aria-label="${t('tu.amount')}" aria-invalid="${Boolean(err)}" inputmode="numeric" value="${state.tuAmount ? money(parseAmount(state.tuAmount)) : ''}" placeholder="مثلاً ۱٬۰۰۰٬۰۰۰"></div>
    <div class="help ${err ? 'err' : ''}">${err ? t(err === 'min' ? 'tu.err.min' : 'tu.err.max') : t('tu.hint')}${B('A4')}</div>
    <div class="chips"><button data-act="tuchip" data-v="500000">۵۰۰ هزار</button><button data-act="tuchip" data-v="1000000">۱ میلیون</button><button data-act="tuchip" data-v="5000000">۵ میلیون</button></div>
    <div class="field-label">${t('tu.card')}</div>
    <div class="field"><span class="num">•••• •••• •••• ۱۲۳۴</span><span>⌄</span></div>
    <div class="help">${t('tu.card.rule')}</div>
    <button class="btn pri submit" data-act="tusubmit">${t('tu.btn')}</button>
  </div>`;
}
