import { CHECKLIST } from '../content/checklist.js';
import { NOTES } from '../content/notes.js';
import { SCENARIOS } from '../content/scenarios.js';

export function scenariosPage() {
  let h = '<div class="doc"><h1>ماتریس سناریوها</h1><p class="hint">هر شناسه را بزن تا همان حالت در پروتوتایپ باز شود. ردیف‌های «P» در ماتریس اجباری‌اند و بقیه اختیاری‌اند، ولی همه ساخته شده‌اند.</p>';
  SCENARIOS.forEach(g => {
    h += `<h2>${g.g}</h2><div class="table-wrap" tabindex="0"><table class="dt"><tr><th>ID</th><th>P</th><th>فاز</th><th>بخش</th><th>لگسی</th><th>جدید</th><th>صفحه</th><th>رفتار مورد انتظار</th><th>پاسخ به</th></tr>`;
    g.items.forEach(x => { h += `<tr><td><a class="idl" href="./#s=${x[0]}">${x[0]}</a></td><td>${x[1] ? '✓' : ''}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${x[5]}</td><td>${x[6]}</td><td>${x[7]}</td><td>${x[8]}</td></tr>`; });
    h += '</table></div>';
  });
  h += '<h2>چک‌لیست اج‌کیس</h2>';
  CHECKLIST.forEach(([g, items]) => { h += `<h3>${g}</h3><div class="table-wrap" tabindex="0"><table class="dt"><tr><th>مورد</th><th>کجای پروتوتایپ</th></tr>${items.map(i => `<tr><td>${i[0]}</td><td>${i[1]}</td></tr>`).join('')}</table></div>`; });
  h += '<h2>فرض‌ها و سوال‌های باز</h2><p class="hint">در پروتوتایپ با برچسب خط‌چین نشان داده شده‌اند. OQ7 سوال تازه‌ای است که موقع ساخت پیدا شد.</p><div class="table-wrap" tabindex="0"><table class="dt"><tr><th>کد</th><th>شرح</th></tr>' + Object.entries(NOTES).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`).join('') + '</table></div></div>';
  return h;
}
