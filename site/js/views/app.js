import { t } from '../content/copy.js';
import { isPre } from '../domain/wallets.js';
import { checkout } from './checkout.js';
import { footer, header, side } from './chrome.js';
import { fvModal, guideModal } from './modals.js';
import { topupPage } from './topup.js';
import { txPage } from './transaction.js';
import { walletPage } from './wallet.js';
import { withdrawPage } from './withdraw.js';

export function appHTML(state) {
  let main = '';
  if (state.screen === 'W') main = walletPage(state);
  else if (state.screen === 'TX') main = txPage(state);
  else if (state.screen === 'CA' || state.screen === 'CN') main = checkout(state, state.screen);
  else if (state.screen === 'WD') main = withdrawPage(state);
  else if (state.screen === 'TU') main = topupPage(state);
  return `<div class="app">${header()}<div class="body">${side(state)}<main class="main">${main}</main></div>${footer()}</div>`;
}

export function layerHTML(state) {
  let h = '';
  if (state.fv && state.screen === 'W' && !isPre(state)) h += fvModal(state);
  if (state.guide) h += guideModal(state);
  if (state.tuErr && state.screen === 'TU' && state.snack) h += `<div class="snack" role="alert">${t(state.tuErr === 'min' ? 'tu.err.min' : 'tu.err.max')}</div>`;
  return h;
}
