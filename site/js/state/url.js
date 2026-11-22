import { DEFAULTS, createState, sanitize, scenarioState } from './schema.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Short form for an untouched scenario, otherwise the difference from the defaults. */
export function encodeState(state) {
  const keys = Object.keys(DEFAULTS);
  if (state.sc) {
    const preset = scenarioState(state.sc);
    if (keys.every(key => same(state[key], preset[key]))) return `#s=${state.sc}`;
  }
  const changed = keys.filter(key => !same(state[key], DEFAULTS[key])).map(key => [key, state[key]]);
  return changed.length ? `#st=${encodeURIComponent(JSON.stringify(Object.fromEntries(changed)))}` : '';
}

export function decodeState(hash) {
  try {
    const value = decodeURIComponent(hash.slice(1));
    if (value.startsWith('s=')) return scenarioState(value.slice(2)) ?? createState();
    if (value.startsWith('st=')) {
      const patch = sanitize(JSON.parse(value.slice(3)));
      // Links made before `base` existed carry only `sc`.
      return createState({ ...patch, base: patch.base ?? patch.sc ?? null });
    }
  } catch {
    // A malformed link falls back to the default state.
  }
  return createState();
}
