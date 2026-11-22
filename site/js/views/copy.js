import { CHANGE_DATE } from '../config.js';
import { COPY } from '../content/copy.js';
import { fa } from '../ui/format.js';

export function copyPage() {
  const esc = s => s.replace(/</g, '&lt;');
  let h = `<div class="doc"><h1>متن‌های استفاده‌شده</h1><p class="hint">${fa(COPY.length)} متن. متغیرها داخل آکولاد هستند: {legacy} نام کیف پول لگسی است (N1 یا N3)، {amount} مبلغ و {date} تاریخ تغییر ساختار (${CHANGE_DATE}).</p><div class="table-wrap" tabindex="0"><table class="dt"><tr><th>شناسه</th><th>متن</th><th>کجا</th></tr>`;
  COPY.forEach(c => { h += `<tr><td class="cid">${c[0]}</td><td>${esc(c[1])}</td><td class="where">${c[2]}</td></tr>`; });
  return h + '</table></div></div>';
}
