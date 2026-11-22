import { t } from '../content/copy.js';
import { isPre } from '../domain/wallets.js';
import { p1Banner, pageAlerts } from './alerts.js';
import { panel } from './balance-panel.js';
import { histBox } from './history.js';
import { card } from './wallet-cards.js';

export function walletPage(state) {
  const cards = isPre(state) ? `<div class="cards two">${card(state, 'rial')}${card(state, 'gold')}</div>` : `<div class="cards">${card(state, 'rial')}${card(state, 'legacy')}${card(state, 'gold')}</div>`;
  const title = isPre(state) ? '' : `<div class="titlerow"><h1>${t('page.title')}</h1><button class="link" data-act="guide">${t('page.guide')}</button></div>`;
  return `${state.phase === 'P1' ? p1Banner(state) : ''}${title}${pageAlerts(state)}${cards}${panel(state)}${histBox(state)}`;
}
