import { fa } from '../ui/format.js';

const DESKTOP = { min: 1080, max: 1440 };
const PHONE = { width: 390, height: 844, bezel: 8 };
const narrow = matchMedia('(max-width: 900px)');

/** Lays the frame out at a realistic width, then scales it into the available space. */
export function createFit({ stage, holder, frame, zoomButton }) {
  let actualSize = false;
  let viewport = 'desktop';

  function update() {
    if (narrow.matches) {
      for (const element of [holder, frame]) {
        element.style.width = '';
        element.style.height = '';
      }
      frame.style.transform = '';
      stage.classList.remove('is-actual');
      return;
    }

    const padding = parseFloat(getComputedStyle(stage).paddingLeft);
    const availableWidth = stage.clientWidth - padding * 2;
    const availableHeight = stage.clientHeight - padding * 2;
    const phone = viewport === 'mobile';

    const width = phone
      ? PHONE.width + PHONE.bezel * 2
      : Math.min(DESKTOP.max, Math.max(DESKTOP.min, availableWidth));
    const fitted = Math.min(1, availableWidth / width);
    const scale = actualSize ? 1 : fitted;
    const height = phone
      ? Math.min(PHONE.height + PHONE.bezel * 2, availableHeight / scale)
      : availableHeight / scale;

    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.transform = scale < 1 ? `scale(${scale})` : '';
    holder.style.width = `${width * scale}px`;
    holder.style.height = `${height * scale}px`;

    stage.classList.toggle('is-actual', actualSize);
    zoomButton.hidden = fitted === 1 && !actualSize;
    zoomButton.textContent = actualSize ? 'جا شدن در صفحه' : `${fa(Math.round(scale * 100))}٪، اندازه‌ی واقعی`;
  }

  new ResizeObserver(update).observe(stage);

  return {
    setViewport(value) {
      viewport = value;
      update();
    },
    toggle() {
      actualSize = !actualSize;
      update();
    },
  };
}
