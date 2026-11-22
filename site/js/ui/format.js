import { B } from './badge.js';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export const fa = value => String(value).replace(/\d/g, digit => PERSIAN_DIGITS[digit]);
export const money = amount => (amount < 0 ? '−' : '') + fa(Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
/** Amount markup. */
export const M = amount => `<span class="num">${money(amount)}</span>`;
/** Signed amount markup. */
export const MS = amount => `<span class="num">${amount > 0 ? '+' : ''}${money(amount)}</span>`;
