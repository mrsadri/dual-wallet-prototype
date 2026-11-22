import { CHANGE_DATE } from '../config.js';
import { t } from '../content/copy.js';
import { isPre, legacyName, transferAmt } from './wallets.js';

export const TRANSACTION_IDS = [
  'p-1', 'p-2', 'p-3', 'p-4', 'p-5',
  'n-transfer', 'n-comm1', 'n-comm2', 'n-wd', 'n-comm3', 'n-adj',
  'l-transfer', 'l-refund', 'l-wd', 'l-mismatch', 'l-adj',
];

export const transactionCode = id => `TX-${90211 + TRANSACTION_IDS.indexOf(id)}`;

export function row(o) { return Object.assign({ st: o.amt < 0 ? (o.type === 'withdraw' ? 'st.out' : o.type === 'purchase' ? 'st.paid' : 'st.deducted') : 'st.in' }, o); }

export function preRows() {
  return [
    row({ id: 'p-1', type: 'comm', title: 'کارمزد فروش بیمه ثالث', sub: 'بیمه‌نامه ۱۰۰۰۰۲', date: 'جمعه ۶ بهمن ۱۴۰۲', time: '۱۲:۴۰', amt: 860000, ref: 'بیمه‌نامه‌ی شخص ثالث ۱۰۰۰۰۲' }),
    row({ id: 'p-2', type: 'reward', title: 'پاداش دعوت همکار', sub: 'فروش بیمه ثالث', date: 'شنبه ۳۰ دی ۱۴۰۲', time: '۱۱:۱۸', amt: 100000 }),
    row({ id: 'p-3', type: 'comm', title: 'کارمزد فروش قسطی', sub: 'بدنه، کد رهگیری ۱۰۰۰۰۰۱', date: 'شنبه ۳۰ دی ۱۴۰۲', time: '۱۰:۱۸', amt: 234000 }),
    row({ id: 'p-4', type: 'purchase', title: 'خرید بیمه درمان', sub: 'سفارش ۲۰۰۰۰۱', date: 'شنبه ۲۳ دی ۱۴۰۲', time: '۱۵:۰۲', amt: -980000, ref: 'سفارش ۲۰۰۰۰۱، بیمه‌ی درمان انفرادی' }),
    row({ id: 'p-5', type: 'topup', title: 'واریز به کیف پول', sub: 'از کارت •••• ۱۲۳۴', date: 'جمعه ۱۵ دی ۱۴۰۲', time: '۰۹:۱۲', amt: 5000000 }),
  ];
}

export function rialRows(state) {
  if (isPre(state)) return preRows();
  const r = [], ta = transferAmt(state);
  if (ta !== 0) r.push(row({ id: 'n-transfer', type: 'transfer', title: t('tx.transfer.in', { legacy: legacyName(state) }), sub: t('tx.transfer.sub', { date: CHANGE_DATE }), date: 'یکشنبه ۱۳ اسفند ۱۴۰۲', time: '۰۰:۰۰', amt: ta, st: 'st.moved', badges: ['A5', ta < 0 ? 'OQ7' : null] }));
  if (state.phase === 'P3') {
    r.push(row({ id: 'n-comm1', type: 'comm', title: 'کارمزد فروش بیمه ثالث', sub: 'بیمه‌نامه ۱۰۰۰۰۳، پژو ۲۰۶', date: 'سه‌شنبه ۱۵ اسفند ۱۴۰۲', time: '۱۴:۰۵', amt: 1240000, ref: 'بیمه‌نامه‌ی شخص ثالث ۱۰۰۰۰۳' }));
    if (state.seg === 'S1') r.push(row({ id: 'n-comm2', type: 'comm', title: 'کارمزد فروش بیمه بدنه', sub: 'بیمه‌نامه ۱۰۰۰۰۴', date: 'پنجشنبه ۱۷ اسفند ۱۴۰۲', time: '۱۰:۴۲', amt: 320000, ref: 'بیمه‌نامه‌ی بدنه ۱۰۰۰۰۴' }));
    else if (state.seg === 'S5') r.push(row({ id: 'n-comm2', type: 'reward', title: 'پاداش شبکه فروش', sub: 'پاداش بهمن ۱۴۰۲، ۱۲ زیرمجموعه‌ی فعال', date: 'پنجشنبه ۱۷ اسفند ۱۴۰۲', time: '۱۰:۴۲', amt: 320000, ref: 'پاداش ماهانه‌ی شبکه فروش، بهمن ۱۴۰۲' }));
    else r.push(row({ id: 'n-comm2', type: 'comm', title: 'کارمزد فروش بیمه درمان', sub: 'بیمه‌نامه ۱۰۰۰۰۷', tag: 'غیرخودرویی', nonauto: true, date: 'پنجشنبه ۱۷ اسفند ۱۴۰۲', time: '۱۰:۴۲', amt: 320000, ref: 'بیمه‌نامه‌ی درمان انفرادی ۱۰۰۰۰۷' }));
    if (state.N !== 'N2') r.push(row({ id: 'n-wd', type: 'withdraw', title: 'برداشت از کیف پول', sub: 'به شبای •••• ۱۲۳۴', date: 'دوشنبه ۲۱ اسفند ۱۴۰۲', time: '۰۹:۳۰', amt: -12100000 }));
    if (state.N === 'N1') r.push(row({ id: 'n-comm3', type: 'comm', title: 'کارمزد فروش بیمه ثالث', sub: 'بیمه‌نامه ۱۰۰۰۰۵', date: 'پنجشنبه ۲۴ اسفند ۱۴۰۲', time: '۱۶:۲۰', amt: 60000, ref: 'بیمه‌نامه‌ی شخص ثالث ۱۰۰۰۰۵' }));
    if (state.N === 'N3') r.push(row({ id: 'n-adj', type: 'adjust', title: 'مغایرت بیمه ثالث', sub: 'اصلاح کارمزد بیمه‌نامه ۱۰۰۰۰۳', date: 'پنجشنبه ۲۴ اسفند ۱۴۰۲', time: '۱۶:۲۰', amt: -1200000, ref: 'بیمه‌نامه‌ی شخص ثالث ۱۰۰۰۰۳' }));
    if (state.N === 'N4') r.push(row({ id: 'n-adj', type: 'adjust', title: 'اصلاحیه کارمزد بیمه ثالث', sub: 'اصلاح کارمزد ۴۲ بیمه‌نامه‌ی بهمن ۱۴۰۲', date: 'پنجشنبه ۲۴ اسفند ۱۴۰۲', time: '۱۶:۲۰', amt: -16400000, ref: '۴۲ بیمه‌نامه‌ی شخص ثالث، بهمن ۱۴۰۲' }));
  }
  return r.reverse();
}

export function legacyRows(state) {
  if (isPre(state)) return { after: [], before: [] };
  const r = [], ta = transferAmt(state);
  if (ta !== 0) r.push(row({ id: 'l-transfer', type: 'transfer', title: t('tx.transfer.out'), sub: t('tx.transfer.sub', { date: CHANGE_DATE }), date: 'یکشنبه ۱۳ اسفند ۱۴۰۲', time: '۰۰:۰۰', amt: -ta, st: 'st.moved', badges: ['A5', ta < 0 ? 'OQ7' : null] }));
  if (state.phase === 'P3') {
    const L = state.L;
    if (L === 'L0' && state.legacyTx) {
      r.push(row({ id: 'l-refund', type: 'refund', title: 'برگشت وجه لغو بیمه مسافرتی', sub: 'سفارش ۲۰۰۰۰۲', date: 'جمعه ۱۸ اسفند ۱۴۰۲', time: '۱۱:۰۰', amt: 120000, ref: 'سفارش ۲۰۰۰۰۲، بیمه‌ی مسافرتی (پرداخت از درگاه)' }));
      r.push(row({ id: 'l-wd', type: 'withdraw', title: 'برداشت از کیف پول', sub: 'به شبای •••• ۱۲۳۴', date: 'یکشنبه ۲۰ اسفند ۱۴۰۲', time: '۰۸:۴۵', amt: -120000 }));
    }
    if (L === 'L1') r.push(row({ id: 'l-refund', type: 'refund', title: 'برگشت وجه لغو بیمه مسافرتی', sub: 'سفارش ۲۰۰۰۰۲', date: 'جمعه ۱۸ اسفند ۱۴۰۲', time: '۱۱:۰۰', amt: 45000, ref: 'سفارش ۲۰۰۰۰۲، بیمه‌ی مسافرتی (پرداخت از درگاه)' }));
    if (L === 'L2') {
      r.push(row({ id: 'l-refund', type: 'refund', title: 'برگشت وجه لغو بیمه درمان', sub: 'سفارش ۲۰۰۰۰۱، خرید ۲۳ دی', tag: 'غیرخودرویی', date: 'جمعه ۱۸ اسفند ۱۴۰۲', time: '۱۱:۰۰', amt: 980000, ref: 'سفارش ۲۰۰۰۰۱، بیمه‌ی درمان انفرادی، خرید ۲۳ دی ۱۴۰۲ پیش از تغییر ساختار' }));
      r.push(row({ id: 'l-mismatch', type: 'adjust', title: 'مغایرت بیمه آتش‌سوزی', sub: 'اصلاح مبلغ بیمه‌نامه ۱۰۰۰۰۸', date: 'یکشنبه ۲۰ اسفند ۱۴۰۲', time: '۱۳:۳۰', amt: 270000, ref: 'بیمه‌نامه‌ی آتش‌سوزی ۱۰۰۰۰۸' }));
    }
    if (L === 'L3' || L === 'L4') {
      r.push(row({ id: 'l-refund', type: 'refund', title: 'برگشت وجه لغو بیمه مسافرتی', sub: 'سفارش ۲۰۰۰۰۲', date: 'جمعه ۱۸ اسفند ۱۴۰۲', time: '۱۱:۰۰', amt: 400000, ref: 'سفارش ۲۰۰۰۰۲، بیمه‌ی مسافرتی (پرداخت از درگاه)' }));
      r.push(row(L === 'L3'
        ? { id: 'l-adj', type: 'adjust', title: 'اصلاحیه کارمزد بیمه درمان', sub: 'اصلاح کارمزد بیمه‌نامه ۱۰۰۰۰۶', date: 'دوشنبه ۲۱ اسفند ۱۴۰۲', time: '۱۰:۱۵', amt: -2700000, ref: 'بیمه‌نامه‌ی درمان انفرادی ۱۰۰۰۰۶' }
        : { id: 'l-adj', type: 'adjust', title: 'اصلاحیه کارمزد بیمه درمان', sub: 'اصلاح کارمزد ۳۱ بیمه‌نامه‌ی دی و بهمن', date: 'دوشنبه ۲۱ اسفند ۱۴۰۲', time: '۱۰:۱۵', amt: -18200000, ref: '۳۱ بیمه‌نامه‌ی درمان، دی و بهمن ۱۴۰۲' }));
    }
  }
  return { after: r.reverse(), before: preRows() };
}

export function allRows(state, w) {
  if (w === 'rial') return rialRows(state);
  if (w === 'legacy') { const x = legacyRows(state); return x.after.concat(x.before); }
  return [];
}

export function findTx(state, id) {
  for (const w of ['rial', 'legacy']) { const r = allRows(state, w).find(x => x.id === id); if (r) return { r, w }; }
  return null;
}

export function negCause(state, w) {
  const r = allRows(state, w).find(x => x.amt < 0 && (x.type === 'adjust' || x.type === 'transfer'));
  return r || null;
}

export function passFilter(state, r) {
  const f = state.filter;
  if (f === 'all') return true;
  if (f === 'in') return r.amt > 0;
  if (f === 'out') return r.type === 'withdraw' || r.type === 'purchase';
  if (f === 'comm') return r.type === 'comm' || r.type === 'reward';
  if (f === 'refund') return r.type === 'refund' || r.type === 'adjust';
  return true;
}
