import { t } from '../content/copy.js';
import { I } from '../ui/icons.js';

export function header() {
  return `<div class="hdr">
    <div class="logo"><i></i><span><small>پنل</small>نمایندگان</span></div>
    <nav class="nav">
      <a href="#" data-act="go" data-v="CA">بیمه وسایل نقلیه</a><a href="#" data-act="go" data-v="CN">بیمه اشخاص</a>
      <a href="#" data-act="toast">بیمه اموال</a><a href="#" class="plain" data-act="toast">تماس با ما</a><a href="#" data-act="toast">پشتیبانی</a>
    </nav>
    <div class="user">کاربر نمونه ⌄</div>
    <button class="burger" data-act="toast" aria-label="منو">☰</button>
  </div>`;
}

export function side(state) {
  const a = (txt, act, on, em) => `<a href="#" data-act="${act}" ${act === 'go' ? 'data-v="W"' : ''} class="${on ? 'on' : ''}"><i></i>${txt}${em ? `<em>${em}</em>` : ''}</a>`;
  return `<aside class="side">
    <h4>صفحه اصلی</h4>${a('خانه', 'toast')}${a('مدیریت مشتریان', 'toast')}
    <h4>مالی</h4>${a('گزارش مالی', 'toast')}${a('مدیریت اقساط', 'toast')}${a('کیف پول', 'go', state.screen !== 'CA' && state.screen !== 'CN')}
    <h4>فروش و تمدید</h4>${a('سررسید', 'toast', 0, '(+۹۹)')}${a('فروش قسطی با چک', 'toast')}${a('تمدید بیمه‌نامه', 'toast')}
    <h4>مشتریان و بیمه‌ها</h4>${a('مشتریان پیشنهادی', 'toast', 0, '(۱۰)')}
  </aside>`;
}

export function footer() {
  return `<div class="foot"><span>پروتوتایپ نمایشی با داده‌های فرضی</span><span>متعلق به هیچ سرویس واقعی نیست</span></div>`;
}

export function backBtn() { return `<div><button class="back" data-act="go" data-v="W">${I.back} ${t('btn.back')}</button></div>`; }
