import { LIMITS } from '../config.js';

const DIGIT_SETS = ['۰۱۲۳۴۵۶۷۸۹', '٠١٢٣٤٥٦٧٨٩'];
const MAX_AMOUNT_DIGITS = 15; // keeps the number a safe integer

/** Accepts Latin, Persian and Arabic digits with any separators. */
export function parseAmount(value) {
  let digits = String(value);
  for (const set of DIGIT_SETS) digits = digits.replace(new RegExp(`[${set}]`, 'g'), digit => set.indexOf(digit));
  return Number(digits.replace(/\D/g, '').slice(0, MAX_AMOUNT_DIGITS) || 0);
}

export function withdrawalBlock(balance) {
  if (balance < 0) return 'negative';
  if (balance < LIMITS.minWithdrawal) return 'min';
  return null;
}

/** Exactly the floor is not critical. */
export const isCritical = balance => balance < LIMITS.criticalBalance;

export function topupError(amount) {
  if (amount < LIMITS.minTopup) return 'min';
  if (amount > LIMITS.maxTopup) return 'max';
  return null;
}
