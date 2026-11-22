# پروتوتایپ دو کیف پول

پروتوتایپ تعاملی فارسی برای بررسی تجربه‌ی دو کیف پول با قواعد متفاوت در یک دوره‌ی گذار.

همه‌ی نام‌ها، تاریخ‌ها، مبلغ‌ها و شناسه‌ها فرضی‌اند. این پروژه سرویس مالی نیست و به هیچ سرویس واقعی وصل نیست.

**[مشاهده‌ی پروتوتایپ](https://mrsadri.github.io/dual-wallet-prototype/)** · [سناریوها](https://mrsadri.github.io/dual-wallet-prototype/scenarios.html) · [متن‌ها](https://mrsadri.github.io/dual-wallet-prototype/copy.html)

## اجرا

```sh
npm ci
npm run dev        # http://127.0.0.1:4173/dual-wallet-prototype/
npm test           # قواعد، state و معماری
npm run test:e2e   # مرورگر؛ به Chrome نصب‌شده نیاز دارد
```

## کجا چه چیزی را تغییر بدهم؟

| تغییر | فایل |
|---|---|
| متن رابط | `site/js/content/copy.js` |
| سناریو | `site/js/content/scenarios.js` |
| آستانه، مبلغ و تاریخ | `site/js/config.js` |
| قواعد | `site/js/domain/` |
| صفحه‌ها | `site/js/views/` |
| رنگ‌ها | `site/styles/tokens.css` |

## انتشار

هر push به `main` تست می‌شود و فقط در صورت موفقیت، پوشه‌ی `site/` منتشر می‌شود. ریپو و سایت عمومی‌اند. داده‌ی واقعی یا سند داخلی commit نکن.

## مستندات

- [معماری](docs/ARCHITECTURE.md)
- [تکنولوژی‌ها](docs/TECH-STACK.md)
- [Todo](docs/TODO.md)
- [چک‌لیست](docs/CHECKLIST.md)

## مجوز

فونت Vazirmatn با [OFL 1.1](site/assets/fonts/OFL.txt) منتشر شده است. برای بقیه‌ی پروژه مجوز استفاده‌ی مجدد داده نشده است.
