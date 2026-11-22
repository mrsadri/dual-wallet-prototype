import { SCENARIOS, TITLES } from '../content/scenarios.js';
import { PHASES, SEGMENTS } from './labels.js';

/** Makes Arabic and Persian spellings, digits and spacing equivalent. */
const searchable = text => text.toLowerCase()
  .replace(/ي/g, 'ی')
  .replace(/ك/g, 'ک')
  .replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
  .replace(/[\s\u200c]+/g, '');

function details([id, , phase, segment, , , , expected, answers]) {
  const who = segment === 'همه' ? 'همه‌ی نمایندگان' : segment.split('/').map(code => SEGMENTS[code]).join(' و ');
  return `<div class="pt-details" id="details-${id}">
    <p>${expected}</p>
    <dl>
      <dt>زمان</dt><dd>${PHASES[phase]}</dd>
      <dt>نماینده</dt><dd>${who}</dd>
      ${answers ? `<dt>پاسخ به</dt><dd>${answers}</dd>` : ''}
    </dl>
  </div>`;
}

function item(scenario, current) {
  const [id, required] = scenario;
  const selected = id === current;
  return `<li>
    <button class="pt-item" data-act="sc" data-v="${id}" ${selected ? `aria-current="true" aria-describedby="details-${id}"` : ''}><span class="pt-code">${id}</span><span class="pt-item-title">${TITLES[id]}</span>${required ? '' : '<span class="pt-optional">اختیاری</span>'}</button>
    ${selected ? details(scenario) : ''}
  </li>`;
}

export function scenarioList(current, { query = '', requiredOnly = false } = {}) {
  const needle = searchable(query);
  const matches = ([id, required, , , , , , expected]) =>
    (!requiredOnly || required) && searchable(`${id} ${TITLES[id]} ${expected}`).includes(needle);

  const groups = SCENARIOS.map(group => {
    const items = group.items.filter(matches);
    if (!items.length) return '';
    return `<h3 class="pt-group"><span>${group.g}</span><span>${items.length.toLocaleString('fa-IR')}</span></h3>
      <ul>${items.map(scenario => item(scenario, current)).join('')}</ul>`;
  }).join('');

  return groups || '<p class="pt-empty">سناریویی پیدا نشد. عبارت یا فیلتر را تغییر بده.</p>';
}
