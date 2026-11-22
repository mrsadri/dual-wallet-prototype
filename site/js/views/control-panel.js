import { t } from '../content/copy.js';
import { isPre, legacyName } from '../domain/wallets.js';
import { BALANCE_LEVELS, PHASES, SCREENS, SEGMENTS } from './labels.js';

const levels = prefix => Object.fromEntries(BALANCE_LEVELS.map((label, index) => [`${prefix}${index}`, label]));

function choices(state, key, options, { disabled = [], codes = true } = {}) {
  const buttons = Object.entries(options).map(([value, label]) =>
    `<button class="${state[key] === value ? 'on' : ''}" aria-pressed="${state[key] === value}" data-act="set" data-k="${key}" data-v="${value}" ${disabled.includes(value) ? 'disabled' : ''}><span>${label}</span>${codes ? `<small>${value}</small>` : ''}</button>`);
  return `<div class="pt-choices">${buttons.join('')}</div>`;
}

const field = (title, body, note = '') =>
  `<fieldset><legend>${title}</legend>${note ? `<p class="pt-note">${note}</p>` : ''}${body}</fieldset>`;

export function ctlHTML(state) {
  const pre = isPre(state);
  const legacyLevels = levels('L');
  const legacyNote = pre
    ? 'پیش از تغییر، این کیف پول وجود ندارد.'
    : state.phase === 'P2' ? 'در اولین ورود همیشه صفر است.' : '';
  const rialNote = pre ? 'موجودی فعلی' : state.phase === 'P2' ? 'مبلغ منتقل‌شده' : '';
  const legacyActivity = state.phase === 'P3' && state.L === 'L0'
    ? `<label class="pt-check"><input type="checkbox" data-act="legacyTx" ${state.legacyTx ? 'checked' : ''}> بعد از انتقال تراکنش داشته</label>`
    : '';

  return `<h3 class="pt-section">شرایط نماینده</h3>
  ${field('زمان', choices(state, 'phase', PHASES))}
  ${field('نوع نماینده', choices(state, 'seg', SEGMENTS))}
  ${field('موجودی کیف پول ریالی', choices(state, 'N', levels('N')), rialNote)}
  ${field(`موجودی ${legacyName(state)}`, choices(state, 'L', legacyLevels, { disabled: state.phase === 'P3' ? [] : Object.keys(legacyLevels) }) + legacyActivity, legacyNote)}
  <h3 class="pt-section">چه چیزی دیده شود</h3>
  ${field('صفحه', choices(state, 'screen', SCREENS))}
  ${field('کیف پول انتخاب‌شده', choices(state, 'wallet', { rial: t('name.rial'), legacy: legacyName(state), gold: t('name.gold') }, { disabled: pre ? ['legacy'] : [], codes: false }))}
  ${field('پنجره‌ها', `<div class="pt-choices"><button data-act="fvopen" ${pre ? 'disabled' : ''}>معرفی اولین ورود</button><button data-act="guide">راهنمای کیف پول‌ها</button></div>`)}
  ${field('نام کیف پول قبلی (آزمون نام‌گذاری)', choices(state, 'naming', { N1: t('name.legacy.N1'), N3: t('name.legacy.N3') }))}
  <label class="pt-check"><input type="checkbox" data-act="badges" ${state.badges ? 'checked' : ''}> نمایش برچسب فرض‌ها و سوال‌های باز</label>
  <button class="pt-button pt-reset" data-act="reset">پاک کردن سناریو و تنظیمات</button>`;
}
