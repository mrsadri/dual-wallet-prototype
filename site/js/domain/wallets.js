import { BALANCES_AT_TRANSFER, CURRENT_BALANCES, LEGACY_BALANCES, ONGOING_TRANSFER_AMOUNT } from '../config.js';
import { t } from '../content/copy.js';

export const isPre = state => state.phase === 'P0' || state.phase === 'P1';
export const legacyName = state => t(`name.legacy.${state.naming}`);
export const wname = (state, wallet) => wallet === 'rial' ? t('name.rial') : wallet === 'legacy' ? legacyName(state) : t('name.gold');
export const nonAutoSeller = state => ['S2', 'S3', 'S4'].includes(state.seg);

export function balN(state) { return isPre(state) || state.phase === 'P2' ? BALANCES_AT_TRANSFER[state.N] : CURRENT_BALANCES[state.N]; }

export function balL(state) { return isPre(state) ? null : state.phase === 'P2' ? 0 : LEGACY_BALANCES[state.L]; }

export function bal(state, w) { return w === 'rial' ? balN(state) : w === 'legacy' ? balL(state) : 0; }

export function transferAmt(state) { return state.phase === 'P2' ? BALANCES_AT_TRANSFER[state.N] : ONGOING_TRANSFER_AMOUNT; }

export function legacyHasActivity(state) { return state.phase === 'P3' && (state.L !== 'L0' || state.legacyTx); }
