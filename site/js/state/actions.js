import { parseAmount, topupError, withdrawalBlock } from '../domain/rules.js';
import { findTx } from '../domain/transactions.js';
import { bal } from '../domain/wallets.js';
import { createState, isValid, normalize, scenarioState } from './schema.js';

const clearErrors = { tuErr: null, snack: false };

function navigate(state, screen) {
  if (!isValid('screen', screen)) return null;
  return {
    ...clearErrors,
    screen,
    wdDone: false,
    from: screen === 'WD' ? state.from : null,
    wallet: screen === 'TU' && state.wallet === 'gold' ? 'rial' : state.wallet,
  };
}

/** Each handler returns a patch, or null when nothing should change. */
const HANDLERS = {
  go: (state, { value }) => navigate(state, value),
  set(state, { key, value }) {
    if (!['phase', 'seg', 'L', 'N', 'screen', 'wallet', 'vp', 'naming'].includes(key) || !isValid(key, value)) return null;
    if (key === 'screen') return navigate(state, value);
    return key === 'phase' ? { phase: value, fv: false } : { [key]: value };
  },
  wallet: (state, { value }) => isValid('wallet', value) ? { wallet: value, filter: 'all' } : null,
  tx(state, { value, wallet }) {
    const found = findTx(state, value);
    return found && { wallet: wallet ?? found.w, txId: value, screen: 'TX', fv: false };
  },
  wdfrom: () => ({ wallet: 'rial', from: 'CN', screen: 'WD', wdDone: false }),
  wdsubmit(state) {
    const wallet = state.wallet === 'gold' ? 'rial' : state.wallet;
    return state.sheba === 'ok' && !withdrawalBlock(bal(state, wallet)) ? { wdDone: true } : null;
  },
  fvopen: () => ({ fv: true, screen: 'W' }),
  fvclose: () => ({ fv: false }),
  fvtx: () => ({ fv: false, wallet: 'rial', txId: 'n-transfer', screen: 'TX' }),
  guide: () => ({ guide: true }),
  guideclose: () => ({ guide: false }),
  cotoggle: (state, { value }) => ['rial', 'legacy'].includes(value)
    ? { coOff: { ...state.coOff, [value]: !state.coOff[value] } }
    : null,
  tuinput: (state, { value }) => ({ tuAmount: value.trim() ? String(parseAmount(value)) : '' }),
  tuchip: (state, { value }) => ({ ...clearErrors, tuAmount: String(parseAmount(value)) }),
  tusubmit(state) {
    const tuErr = topupError(parseAmount(state.tuAmount));
    return { tuErr, snack: tuErr !== null };
  },
  filter: (state, { value }) => isValid('filter', value) ? { filter: value } : null,
  legacyTx: (state, { checked }) => ({ legacyTx: checked }),
  badges: (state, { checked }) => ({ badges: checked }),
};

const KEEPS_SCENARIO = new Set(['fvclose', 'guide', 'guideclose', 'badges']);

export function reduce(state, action) {
  if (action.type === 'reset') return createState();
  if (action.type === 'sc') {
    const { vp, naming, badges } = state;
    return scenarioState(action.value, { vp, naming, badges }) ?? state;
  }
  if (!Object.hasOwn(HANDLERS, action.type)) return state;
  const patch = HANDLERS[action.type](state, action);
  if (!patch) return state;
  const sc = KEEPS_SCENARIO.has(action.type) ? state.sc : null;
  return normalize({ ...state, ...patch, sc });
}
