import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SCENARIOS } from '../../site/js/content/scenarios.js';

const ids = SCENARIOS.flatMap(group => group.items.map(item => item[0]));
let problems;

test.beforeEach(({ page, baseURL }) => {
  problems = [];
  page.on('pageerror', error => problems.push(error.message));
  page.on('console', message => { if (message.type() === 'error') problems.push(message.text()); });
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(baseURL).origin) problems.push(`third party: ${request.url()}`);
  });
});

test.afterEach(() => expect(problems).toEqual([]));

test('every scenario renders and keeps its link', async ({ page }) => {
  await page.goto('./');
  for (const id of ids) {
    await page.evaluate(value => { location.hash = `s=${value}`; }, id);
    await expect(page.locator('.scbox .id')).toHaveText(id);
    await expect(page.locator('.frame .main')).not.toBeEmpty();
  }
});

test('scenario matrix opens the prototype', async ({ page }) => {
  await page.goto('scenarios.html');
  await expect(page.locator('.idl')).toHaveCount(ids.length);
  await page.getByRole('link', { name: 'C02', exact: true }).click();
  await expect(page.locator('.scbox .id')).toHaveText('C02');
});

test('copy page and font load', async ({ page }) => {
  await page.goto('copy.html');
  expect(await page.locator('td.cid').count()).toBeGreaterThan(100);
  expect(await page.evaluate(async () => (await document.fonts.load('16px Vazirmatn', 'سلام')).length)).toBe(1);
});

test('URL cannot inject markup', async ({ page }) => {
  const payload = encodeURIComponent(JSON.stringify({ naming: '<img id="injected" src="x">' }));
  await page.goto(`./#st=${payload}`);
  await expect(page.locator('.frame .main')).not.toBeEmpty();
  await expect(page.locator('#injected')).toHaveCount(0);
});

test('a malformed URL still renders', async ({ page }) => {
  await page.goto('./#%E0%A4');
  await expect(page.locator('.frame .main')).not.toBeEmpty();
});

test('risky checkout leads to withdrawal', async ({ page }) => {
  await page.goto('./#s=C02');
  await page.locator('[data-act="wdfrom"]').click();
  await expect(page.locator('.callout')).toBeVisible();
  await page.locator('[data-act="wdsubmit"]').click();
  await expect(page.locator('.okbox')).toBeVisible();
});

test('top-up validates and then succeeds', async ({ page }) => {
  await page.goto('./#s=M06');
  await page.locator('[data-act="tusubmit"]').click();
  await expect(page.locator('.snack')).toBeVisible();
  await page.locator('#tuIn').fill('۵۰۰۰۰۰');
  await page.locator('[data-act="tusubmit"]').click();
  await expect(page.locator('.toast')).toBeVisible();
  await expect(page.locator('.snack')).toHaveCount(0);
});

test('filter and checkboxes update the state', async ({ page }) => {
  await page.goto('./');
  await page.locator('select').selectOption('comm');
  await expect(page.locator('.rowx')).toHaveCount(2);
  await page.locator('input[data-act="badges"]').click();
  await expect(page.locator('body')).toHaveClass(/nobadges/);
  await page.reload();
  await expect(page.locator('select')).toHaveValue('comm');
  await expect(page.locator('body')).toHaveClass(/nobadges/);
});

test('keyboard works for dialog and payment option', async ({ page }) => {
  await page.goto('./#s=T03');
  await expect(page.locator('.modal [data-act="fvclose"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.modal')).toHaveCount(0);
  await page.goto('./#s=C05');
  const option = page.getByRole('checkbox', { name: /کیف پول ریالی/ });
  await option.press('Space');
  await expect(option).toHaveAttribute('aria-checked', 'false');
  await expect(option).toBeFocused();
});

test('copying reports failure honestly', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('denied'); } } }));
  await page.goto('./');
  await page.locator('[data-act="copylink"]').click();
  await expect(page.locator('.toast')).toContainText('کپی نشد');
});

for (const width of [360, 390, 768, 1280, 1440]) {
  test(`layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./');
    for (const id of ids) {
      await page.evaluate(value => { location.hash = `s=${value}`; }, id);
      await expect(page.locator('.scbox .id')).toHaveText(id);
      const overflow = await page.evaluate(() => {
        const scroller = document.querySelector('.scroller');
        return { page: document.documentElement.scrollWidth - innerWidth, app: scroller.scrollWidth - scroller.clientWidth };
      });
      expect(overflow.page, id).toBeLessThanOrEqual(1);
      expect(overflow.app, id).toBeLessThanOrEqual(1);
    }
    if (width <= 900) {
      expect((await page.locator('.frame').boundingBox()).width).toBe(Math.min(width, 600));
      await page.locator('#panel-toggle').click();
      await page.locator('.qlist [data-v="C02"]').click();
      await expect(page.locator('.ctl')).toBeHidden();
      await expect(page).toHaveURL(/C02|st=/);
    }
    for (const path of ['scenarios.html', 'copy.html']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  });
}

for (const path of ['./', './#s=T03', './#s=C02', './#s=N02', './#s=M06', './#s=I02', './#s=M02', 'scenarios.html', 'copy.html']) {
  for (const width of [390, 1440]) {
    test(`accessibility: ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const severe = violations.filter(item => ['critical', 'serious'].includes(item.impact));
      expect(severe.map(item => [item.id, item.nodes.slice(0, 4).map(node => `${node.target} ${node.any[0]?.message ?? ''}`)])).toEqual([]);
    });
  }
}
