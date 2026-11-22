import { t } from '../content/copy.js';
import { SCENARIOS, findScenario } from '../content/scenarios.js';
import { isPre, legacyName } from '../domain/wallets.js';

const PH = { P0: 'قبل', P1: 'اطلاع‌رسانی', P2: 'اولین ورود', P3: 'دوره‌ی جاری' };
const SG = { S1: 'فقط خودرو', S2: 'ترکیبی', S3: 'غیرخودرو', S4: 'غیرفعال', S5: 'سرشاخه' };
const LL = { L0: 'صفر', L1: 'زیر ۱۰۰ه', L2: '۱۰۰ه به بالا', L3: 'منفی', L4: 'زیر −۱۵م' };
const SCR = { W: 'کیف پول', TX: 'جزئیات', CA: 'خرید خودرو', CN: 'خرید غیرخودرو', WD: 'برداشت', TU: 'شارژ' };

export function segBtns(state, key, map, opts = {}) {
  return `<div class="seg">${Object.keys(map).map(k => `<button class="${state[key] === k ? 'on' : ''}" aria-pressed="${state[key] === k}" data-act="set" data-k="${key}" data-v="${k}" ${opts.dis ? 'disabled' : ''}>${k}<small>${map[k]}</small></button>`).join('')}</div>`;
}

export function ctlHTML(state) {
  const sc = state.sc ? findScenario(state.sc) : null;
  const q = SCENARIOS.map(g => `<div class="group-label">${g.g}</div><div class="qlist">${g.items.map(x => `<button class="${x[1] ? 'p' : ''} ${state.sc === x[0] ? 'on' : ''}" data-act="sc" data-v="${x[0]}" title="${x[7]}">${x[0]}${x[1] ? '' : '°'}</button>`).join('')}</div>`).join('');
  const lockedL = state.phase !== 'P3';
  return `<div class="ctl-head"><h2>کنترل پروتوتایپ</h2><button data-act="panel" class="panel-close">بستن</button></div><p class="hint">سناریوهای پررنگ در ماتریس «P» دارند. ° یعنی اختیاری.</p>
  <fieldset><legend>سناریوها</legend>${q}
    <div class="scbox">${sc ? `<div><span class="id">${sc[0]}</span><span class="tag">${sc[2]}</span><span class="tag">${sc[3]}</span><span class="tag">${sc[6]}</span></div><p>${sc[7]}</p>${sc[8] ? `<p class="ans">پاسخ به: ${sc[8]}</p>` : ''}` : '<b>حالت دستی</b><p class="ans">هر ترکیبی را با کنترل‌های زیر بساز.</p>'}</div>
  </fieldset>
  <fieldset><legend>فاز</legend>${segBtns(state, 'phase', PH)}</fieldset>
  <fieldset><legend>بخش نماینده</legend>${segBtns(state, 'seg', SG)}</fieldset>
  <fieldset><legend>موجودی ${legacyName(state)} (لگسی)${state.phase === 'P2' ? '؛ در P2 همیشه صفر' : isPre(state) ? '؛ قبل از تغییر ساختار وجود ندارد' : ''}</legend>${segBtns(state, 'L', LL, { dis: lockedL })}
    ${state.phase === 'P3' && state.L === 'L0' ? `<label class="chk"><input type="checkbox" data-act="legacyTx" ${state.legacyTx ? 'checked' : ''}> لگسی بعد از انتقال تراکنش داشته</label>` : ''}</fieldset>
  <fieldset><legend>موجودی کیف پول ریالی${isPre(state) ? ' (موجودی فعلی)' : state.phase === 'P2' ? ' (مبلغ منتقل‌شده)' : ''}</legend>${segBtns(state, 'N', { N0: 'صفر', N1: 'زیر ۱۰۰ه', N2: '۱۰۰ه به بالا', N3: 'منفی', N4: 'زیر −۱۵م' })}</fieldset>
  <fieldset><legend>صفحه</legend>${segBtns(state, 'screen', SCR)}
    <div class="row2"><button data-act="fvopen" ${isPre(state) ? 'disabled' : ''}>نمایش معرفی اولین ورود</button><button data-act="guide">راهنما</button></div></fieldset>
  <fieldset><legend>کیف پول انتخاب‌شده</legend>${segBtns(state, 'wallet', { rial: 'ریالی', legacy: 'لگسی', gold: 'طلایی' })}</fieldset>
  <fieldset class="vp-control"><legend>سایز</legend>${segBtns(state, 'vp', { desktop: 'دسکتاپ', mobile: 'موبایل ۳۹۰' })}</fieldset>
  <fieldset><legend>نام کیف پول لگسی (آزمون D5)</legend>${segBtns(state, 'naming', { N1: t('name.legacy.N1'), N3: t('name.legacy.N3') })}</fieldset>
  <fieldset><legend>نمایش</legend><label class="chk"><input type="checkbox" data-act="badges" ${state.badges ? 'checked' : ''}> برچسب فرض‌ها و سوال‌های باز</label>
    <div class="row2"><button data-act="copylink">کپی لینک این حالت</button><button data-act="reset">ریست</button></div></fieldset>`;
}
