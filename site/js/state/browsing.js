import { SCENARIOS } from '../content/scenarios.js';
import { DEFAULTS, scenarioState } from './schema.js';

const ALL = SCENARIOS.flatMap(group => group.items);
const NOT_A_CHANGE = new Set(['sc', 'base', 'vp', 'naming', 'badges']);

/** True when the state has moved away from the scenario it started from. */
export function isModified(state) {
  if (!state.base) return false;
  const preset = scenarioState(state.base);
  return Object.keys(DEFAULTS).some(key => !NOT_A_CHANGE.has(key) && JSON.stringify(state[key]) !== JSON.stringify(preset[key]));
}

export function neighbours(id, requiredOnly = false) {
  const index = ALL.findIndex(item => item[0] === id);
  const included = item => !requiredOnly || Boolean(item[1]);
  const list = ALL.filter(included);
  return {
    previous: index < 0 ? null : ALL.slice(0, index).reverse().find(included)?.[0] ?? null,
    next: ALL.slice(index + 1).find(included)?.[0] ?? null,
    position: list.findIndex(item => item[0] === id) + 1,
    total: list.length,
  };
}
