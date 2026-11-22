const PAGES = [
  ['prototype', './', 'پروتوتایپ'],
  ['scenarios', 'scenarios.html', 'ماتریس سناریوها'],
  ['copy', 'copy.html', 'متن‌ها'],
];

export function siteNav(current) {
  const links = PAGES.map(([id, href, label]) =>
    `<a href="${href}" ${id === current ? 'class="on" aria-current="page"' : ''}>${label}</a>`).join('');
  return `<b>دو کیف پول، پروتوتایپ</b>${links}<span class="sp"></span><span class="disclaimer">نسخه‌ی نمایشی، داده‌ی فرضی</span>`;
}
