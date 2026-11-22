import { TITLES, findScenario } from '../content/scenarios.js';
import { fa } from '../ui/format.js';

const chevron = path => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="${path}"/></svg>`;
const PREVIOUS = chevron('M9 5l7 7-7 7'); // points right in RTL
const NEXT = chevron('M15 5l-7 7 7 7');

export function scenarioBar(state, { previous, next, position, total, modified }) {
  const scenario = state.base ? findScenario(state.base) : null;
  const title = scenario ? TITLES[state.base] : 'سناریویی انتخاب نشده';
  const summary = scenario ? scenario[7] : 'از فهرست انتخاب کن یا با «بعدی» شروع کن.';
  const arrow = (id, label, icon, direction) =>
    `<button class="pt-arrow" data-act="step" data-v="${direction}" aria-label="${id ? `${label}: ${id}، ${TITLES[id]}` : label}" title="${id ? `${label}: ${TITLES[id]}` : label}" ${id ? '' : 'disabled'}>${icon}</button>`;

  return `${arrow(previous, 'سناریوی قبلی', PREVIOUS, 'previous')}
    <button class="pt-current" data-act="details" title="${summary}">
      <span class="pt-heading">${scenario ? `<span class="pt-code pt-current-id">${state.base}</span>` : ''}<span class="pt-current-title">${title}</span></span>
      <span class="pt-summary">${summary}</span>
    </button>
    ${modified ? '<button class="pt-restore" data-act="restore" title="برگشت به حالت اولیه‌ی سناریو"><span>تغییر کرده</span><b>برگشت</b></button>' : ''}
    ${position ? `<span class="pt-count">${fa(position)} از ${fa(total)}</span>` : ''}
    ${arrow(next, 'سناریوی بعدی', NEXT, 'next')}`;
}
