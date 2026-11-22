import { PRICES } from '../config.js';
import { bal, isPre } from './wallets.js';

/**
 * Splits a purchase between wallet and gateway.
 * An unusable wallet is listed only when it holds money (decision D2).
 */
export function planPayment(state, kind) {
  const price = PRICES[kind];
  const isAuto = kind === 'CA';
  const candidates = isPre(state)
    ? [['rial', true]]
    : [['rial', isAuto], ['legacy', !isAuto]];

  let gateway = price;
  const options = [];
  for (const [wallet, usable] of candidates) {
    const balance = bal(state, wallet);
    if (!usable) {
      if (balance > 0) options.push({ wallet, balance, status: 'restricted', amount: 0 });
    } else if (balance < 0) {
      options.push({ wallet, balance, status: 'negative', amount: 0 });
    } else if (balance === 0) {
      options.push({ wallet, balance, status: 'empty', amount: 0 });
    } else if (state.coOff[wallet]) {
      options.push({ wallet, balance, status: 'off', amount: 0 });
    } else {
      const amount = Math.min(balance, gateway);
      gateway -= amount;
      options.push({ wallet, balance, status: 'on', amount });
    }
  }
  return { price, options, gateway, walletTotal: price - gateway };
}
