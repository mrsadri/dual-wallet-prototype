import { t } from '../content/copy.js';
import { bal, isPre, legacyHasActivity, legacyName, wname } from '../domain/wallets.js';
import { M } from '../ui/format.js';
import { I } from '../ui/icons.js';

export function card(state, w) {
  const sel = state.wallet === w, b = bal(state, w);
  const ic = w === 'gold' ? I.crown : w === 'legacy' ? I.undo : I.wallet;
  if (w === 'gold') return `<button class="wcard ${sel ? 'sel' : ''}" data-act="wallet" data-v="gold"><span class="ic">${ic}</span><span class="body"><b>${t('name.gold')}</b><span class="bal">${t('card.empty')}</span></span></button>`;
  const neg = b < 0;
  const balTxt = `<span class="bal ${neg ? 'neg' : ''}">${t('card.balance', { amount: M(b) })}${neg ? `<span class="negtag">${t('card.negative')}</span>` : ''}</span>`;
  if (isPre(state)) return `<button class="wcard ${sel ? 'sel' : ''}" data-act="wallet" data-v="rial"><span class="ic">${ic}</span><span class="body"><b>${t('name.rial')}</b>${balTxt}</span></button>`;
  const compact = w === 'legacy' && !sel && b === 0 && !legacyHasActivity(state);
  if (compact) return `<button class="wcard compact" data-act="wallet" data-v="legacy"><span class="ic">${ic}</span><span class="body"><b>${legacyName(state)}</b>${balTxt}<span class="sub">${t('card.legacy.compact')}</span></span></button>`;
  const sub = w === 'rial' ? t('card.rial.sub') : t('card.legacy.sub');
  const chip = w === 'rial' ? t('card.rial.chip') : t('card.legacy.chip');
  return `<button class="wcard ${sel ? 'sel' : ''}" data-act="wallet" data-v="${w}"><span class="ic">${ic}</span><span class="body"><b>${wname(state, w)}</b>${balTxt}<span class="sub">${sub}</span><span class="chip">${chip}</span></span></button>`;
}
