import { findScenario } from '../content/scenarios.js';
import { TRANSACTION_IDS } from '../domain/transactions.js';
import { isPre } from '../domain/wallets.js';

export const DEFAULTS = Object.freeze({
  phase: 'P3', seg: 'S3', L: 'L2', N: 'N2', legacyTx: false, screen: 'W', wallet: 'rial', txId: null,
  vp: 'desktop', naming: 'N1', badges: true, fv: false, guide: false, sheba: 'ok', from: null,
  tuAmount: '', tuErr: null, snack: false, wdDone: false, filter: 'all', sc: null, coOff: Object.freeze({}),
});

const oneOf = (...values) => value => values.includes(value);
const isBoolean = value => typeof value === 'boolean';

const VALIDATORS = {
  phase: oneOf('P0', 'P1', 'P2', 'P3'),
  seg: oneOf('S1', 'S2', 'S3', 'S4', 'S5'),
  L: oneOf('L0', 'L1', 'L2', 'L3', 'L4'),
  N: oneOf('N0', 'N1', 'N2', 'N3', 'N4'),
  screen: oneOf('W', 'TX', 'CA', 'CN', 'WD', 'TU'),
  wallet: oneOf('rial', 'legacy', 'gold'),
  txId: oneOf(null, ...TRANSACTION_IDS),
  vp: oneOf('desktop', 'mobile'),
  naming: oneOf('N1', 'N3'),
  filter: oneOf('all', 'in', 'out', 'comm', 'refund'),
  sheba: oneOf('ok', 'none'),
  from: oneOf(null, 'CN'),
  tuErr: oneOf(null, 'min', 'max'),
  tuAmount: value => typeof value === 'string' && /^\d{0,15}$/.test(value),
  sc: value => value === null || (typeof value === 'string' && findScenario(value) !== undefined),
  coOff: value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.entries(value).every(([key, off]) => ['rial', 'legacy'].includes(key) && typeof off === 'boolean'),
  legacyTx: isBoolean, badges: isBoolean, fv: isBoolean, guide: isBoolean, snack: isBoolean, wdDone: isBoolean,
};

export const isValid = (key, value) => Object.hasOwn(VALIDATORS, key) && VALIDATORS[key](value);

/** The only entry point for untrusted state: unknown keys and values are dropped. */
export function sanitize(input) {
  if (input === null || typeof input !== 'object') return {};
  return Object.fromEntries(Object.entries(input).filter(([key, value]) => isValid(key, value)));
}

export function normalize(state) {
  const next = { ...state };
  if (isPre(next) && next.wallet === 'legacy') next.wallet = 'rial';
  if (next.phase !== 'P3') next.legacyTx = false;
  return next;
}

export const createState = (patch = {}) => normalize({ ...DEFAULTS, coOff: {}, ...patch });

export function scenarioState(id, preferences = {}) {
  const scenario = findScenario(id);
  if (!scenario) return null;
  const preset = scenario[9];
  return createState({ ...preferences, ...preset, snack: Boolean(preset.tuErr), sc: id });
}
