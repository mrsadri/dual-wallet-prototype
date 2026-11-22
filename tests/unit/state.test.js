import assert from 'node:assert/strict';
import test from 'node:test';
import { SCENARIOS } from '../../site/js/content/scenarios.js';
import { TRANSACTION_IDS, allRows } from '../../site/js/domain/transactions.js';
import { reduce } from '../../site/js/state/actions.js';
import { createState, sanitize, scenarioState } from '../../site/js/state/schema.js';
import { decodeState, encodeState } from '../../site/js/state/url.js';

const ids = SCENARIOS.flatMap(group => group.items.map(item => item[0]));
const roundTrip = state => decodeState(encodeState(state));

for (const id of ids) {
  test(`${id}: valid preset and exact link`, () => {
    const state = scenarioState(id);
    assert.deepEqual(sanitize(state), state);
    assert.equal(encodeState(state), `#s=${id}`);
    assert.deepEqual(roundTrip(state), state);
  });
}

test('changes on top of a scenario survive sharing', () => {
  const actions = [
    { type: 'fvclose' },
    { type: 'guide' },
    { type: 'badges', checked: false },
    { type: 'set', key: 'naming', value: 'N3' },
    { type: 'set', key: 'vp', value: 'mobile' },
    { type: 'cotoggle', value: 'rial' },
    { type: 'tuinput', value: '۵۰۰۰۰۰' },
  ];
  for (const action of actions) {
    const state = reduce(scenarioState('T03'), action);
    assert.deepEqual(roundTrip(state), state);
  }
  const preferred = reduce(createState({ naming: 'N3' }), { type: 'sc', value: 'T03' });
  assert.deepEqual(roundTrip(preferred), preferred);
});

test('untrusted URL values are dropped', () => {
  const payload = { naming: '<img src=x onerror=alert(1)>', phase: 'P9', constructor: 'x', coOff: { x: true }, seg: 'S2' };
  assert.deepEqual(decodeState(`#st=${encodeURIComponent(JSON.stringify(payload))}`), createState({ seg: 'S2' }));
});

test('malformed links fall back to the defaults', () => {
  for (const hash of ['#%E0%A4', '#st={', '#st=null', '#s=NOPE', '#s=__proto__', '']) {
    assert.deepEqual(decodeState(hash), createState());
  }
});

test('actions cannot set invalid state', () => {
  const state = createState();
  assert.equal(reduce(state, { type: 'set', key: 'naming', value: '<b>' }), state);
  assert.equal(reduce(state, { type: 'constructor' }), state);
});

test('blocked withdrawal cannot be submitted', () => {
  assert.equal(reduce(createState({ wallet: 'legacy', L: 'L1' }), { type: 'wdsubmit' }).wdDone, false);
});

test('reducer does not mutate its input', () => {
  const state = createState();
  const copy = structuredClone(state);
  reduce(state, { type: 'cotoggle', value: 'rial' });
  assert.deepEqual(state, copy);
});

test('every generated transaction can be linked', () => {
  for (const phase of ['P0', 'P1', 'P2', 'P3']) {
    for (const level of [0, 1, 2, 3, 4]) {
      for (const legacyTx of [false, true]) {
        const state = createState({ phase, L: `L${level}`, N: `N${level}`, legacyTx });
        for (const row of [...allRows(state, 'rial'), ...allRows(state, 'legacy')]) {
          assert.ok(TRANSACTION_IDS.includes(row.id), row.id);
        }
      }
    }
  }
});

test('every scenario has a distinct title', async () => {
  const { TITLES } = await import('../../site/js/content/scenarios.js');
  assert.deepEqual(Object.keys(TITLES), ids);
  assert.equal(new Set(Object.values(TITLES)).size, ids.length);
});

test('links made before `base` keep their scenario', () => {
  assert.equal(decodeState(`#st=${encodeURIComponent('{"sc":"T03","phase":"P2"}')}`).base, 'T03');
});

test('only real changes mark a scenario as modified', async () => {
  const { isModified } = await import('../../site/js/state/browsing.js');
  const start = scenarioState('C05');
  const off = reduce(start, { type: 'cotoggle', value: 'rial' });
  assert.equal(isModified(start), false);
  assert.equal(isModified(off), true);
  assert.equal(isModified(reduce(off, { type: 'cotoggle', value: 'rial' })), false);
  assert.equal(isModified(reduce(start, { type: 'set', key: 'vp', value: 'mobile' })), false);
});
