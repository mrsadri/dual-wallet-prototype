import assert from 'node:assert/strict';
import test from 'node:test';
import { planPayment } from '../../site/js/domain/payment.js';
import { isCritical, parseAmount, topupError, withdrawalBlock } from '../../site/js/domain/rules.js';
import { TRANSACTION_IDS, legacyRows, rialRows, transactionCode } from '../../site/js/domain/transactions.js';
import { bal } from '../../site/js/domain/wallets.js';
import { createState } from '../../site/js/state/schema.js';

test('withdrawal starts at exactly 100,000', () => {
  assert.equal(withdrawalBlock(-1), 'negative');
  assert.equal(withdrawalBlock(0), 'min');
  assert.equal(withdrawalBlock(99_999), 'min');
  assert.equal(withdrawalBlock(100_000), null);
});

test('only below the floor is critical', () => {
  assert.equal(isCritical(-15_000_000), false);
  assert.equal(isCritical(-15_000_001), true);
});

test('top-up accepts both bounds', () => {
  assert.equal(topupError(99_999), 'min');
  assert.equal(topupError(100_000), null);
  assert.equal(topupError(200_000_000), null);
  assert.equal(topupError(200_000_001), 'max');
});

test('amounts accept three digit systems', () => {
  for (const input of ['500,000', '۵۰۰٬۰۰۰', '٥٠٠٠٠٠']) assert.equal(parseAmount(input), 500_000);
  assert.equal(parseAmount(''), 0);
  assert.ok(Number.isSafeInteger(parseAmount('9'.repeat(40))));
});

test('wallet histories add up to their balances', () => {
  const sum = rows => rows.reduce((total, row) => total + row.amt, 0);
  for (const seg of ['S1', 'S3', 'S5']) {
    for (const level of [0, 1, 2, 3, 4]) {
      const state = createState({ seg, L: `L${level}`, N: `N${level}` });
      assert.equal(sum(rialRows(state)), bal(state, 'rial'));
      const afterTransfer = legacyRows(state).after.filter(row => row.type !== 'transfer');
      assert.equal(sum(afterTransfer), bal(state, 'legacy'));
    }
  }
});

test('transaction codes are unique', () => {
  assert.equal(new Set(TRANSACTION_IDS.map(transactionCode)).size, TRANSACTION_IDS.length);
});

test('wallet and gateway always cover the price', () => {
  for (const phase of ['P0', 'P1', 'P2', 'P3']) {
    for (const L of ['L0', 'L1', 'L2', 'L3', 'L4']) {
      for (const N of ['N0', 'N1', 'N2', 'N3', 'N4']) {
        for (const kind of ['CA', 'CN']) {
          const plan = planPayment(createState({ phase, L, N }), kind);
          assert.equal(plan.walletTotal + plan.gateway, plan.price);
          assert.ok(plan.gateway >= 0 && plan.walletTotal >= 0);
        }
      }
    }
  }
});

test('after the change, each purchase spends only from its own wallet', () => {
  const state = createState();
  for (const [kind, allowed, blocked] of [['CA', 'rial', 'legacy'], ['CN', 'legacy', 'rial']]) {
    const { options } = planPayment(state, kind);
    assert.ok(options.find(option => option.wallet === allowed).amount > 0);
    assert.equal(options.find(option => option.wallet === blocked).status, 'restricted');
  }
});
