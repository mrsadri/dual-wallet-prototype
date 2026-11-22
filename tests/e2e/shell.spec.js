import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SCENARIOS, TITLES } from '../../site/js/content/scenarios.js';

const all = SCENARIOS.flatMap(group => group.items);
const currentId = page => page.locator('.pt-current-id');
const arrow = (page, direction) => page.locator(`.pt-arrow[data-v="${direction}"]`);

test.use({ viewport: { width: 1280, height: 720 } });

test('U1: panel collapses, frees space and is remembered', async ({ page }) => {
  await page.goto('./#s=C02');
  const width = () => page.locator('.stage').evaluate(element => element.clientWidth);
  const before = await width();
  await page.locator('#panel-toggle').click();
  await expect(page.locator('.ctl')).toBeHidden();
  expect(await width()).toBeGreaterThan(before + 300);
  await expect(page.locator('.pt-current-title')).toHaveText(TITLES.C02);
  await page.reload();
  await expect(page.locator('.ctl')).toBeHidden();
  await page.locator('#panel-toggle').click();
  await page.reload();
  await expect(page.locator('.ctl')).toBeVisible();
});

test('U1: works when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }));
  await page.goto('./');
  await page.locator('#panel-toggle').click();
  await expect(page.locator('.ctl')).toBeHidden();
});

test('U2: every scenario shows its title', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.pt-item-title')).toHaveText(all.map(item => TITLES[item[0]]));
  await page.goto('scenarios.html');
  await expect(page.locator('td.scenario-title')).toHaveText(all.map(item => TITLES[item[0]]));
});

for (const [width, height] of [[901, 700], [1024, 768], [1280, 720], [1366, 768], [1440, 900], [1920, 1080]]) {
  test(`U3 and U8: frame and tools fit at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('./#s=C02');
    await expect(page.locator('#panel-toggle')).toHaveAttribute('aria-expanded', String(width >= 1200));
    if (width < 1200) await page.locator('#panel-toggle').click();
    for (const open of [true, false]) {
      if (!open) await page.locator('#panel-toggle').click();
      for (const device of ['desktop', 'mobile']) {
        await page.locator(`.pt-devices [data-v="${device}"]`).click();
        await expect.poll(() => page.evaluate(() => {
          const box = selector => document.querySelector(selector).getBoundingClientRect();
          const [stage, frame, share, toolbar] = ['.stagebody', '.frame', '.pt-share', '.pt-toolbar'].map(box);
          return Math.max(stage.left - frame.left, frame.right - stage.right, frame.bottom - stage.bottom,
            toolbar.left - share.left, share.right - toolbar.right);
        })).toBeLessThanOrEqual(1);
        expect((await page.locator('.frame').boundingBox()).height).toBeGreaterThan(300);
      }
    }
  });
}

test('U3: actual size can be toggled', async ({ page }) => {
  await page.goto('./');
  const width = async () => Math.round((await page.locator('.frame').boundingBox()).width);
  expect(await width()).toBeLessThan(1080);
  await page.locator('#zoom').click();
  expect(await width()).toBe(1080);
  await page.locator('#zoom').click();
  expect(await width()).toBeLessThan(1080);
});

test('U5: origin survives interaction and reload', async ({ page }) => {
  await page.goto('./#s=C02');
  await expect(page.locator('.pt-restore')).toHaveCount(0);
  await page.locator('[data-act="wdfrom"]').click();
  await expect(currentId(page)).toHaveText('C02');
  await page.reload();
  await expect(currentId(page)).toHaveText('C02');
  await page.locator('.pt-restore').click();
  await expect(page).toHaveURL(/#s=C02$/);
  await expect(page.locator('.pt-restore')).toHaveCount(0);
});

test('U6 and U14: keyboard browsing is not captured by dialogs', async ({ page }) => {
  await page.goto('./');
  const next = arrow(page, 'next');
  await next.focus();
  for (const id of ['T01', 'T02', 'T03', 'T04', 'T05', 'T06']) {
    await page.keyboard.press('Enter');
    await expect(currentId(page)).toHaveText(id);
    await expect(next).toBeFocused();
  }
  await arrow(page, 'previous').click();
  await expect(currentId(page)).toHaveText('T05');
});

test('U6: both ends are bounded', async ({ page }) => {
  await page.goto(`./#s=${all[0][0]}`);
  await expect(arrow(page, 'previous')).toBeDisabled();
  await page.evaluate(id => { location.hash = `s=${id}`; }, all.at(-1)[0]);
  await expect(arrow(page, 'next')).toBeDisabled();
});

test('U7: settings are separate and keep the origin', async ({ page }) => {
  await page.goto('./#s=N01');
  await expect(page.locator('#settings')).toBeHidden();
  await page.locator('[data-act="tab"][data-v="settings"]').click();
  await expect(page.locator('#scenario-list')).toBeHidden();
  await page.locator('#settings [data-k="L"][data-v="L4"]').click();
  await expect(currentId(page)).toHaveText('N01');
  await expect(page.locator('.pt-restore')).toBeVisible();
});

test('U9: the phone is 390 wide inside', async ({ page }) => {
  await page.goto('./#s=L01');
  expect(await page.locator('.scroller').evaluate(element => element.offsetWidth)).toBe(390);
});

test('U10: search and required filter', async ({ page }) => {
  await page.goto('./');
  const search = page.locator('#scenario-search');
  for (const query of ['c02', 'C۰۲']) {
    await search.fill(query);
    await expect(page.locator('.pt-item')).toHaveCount(1);
  }
  await search.fill('كيف پول');
  expect(await page.locator('.pt-item').count()).toBeGreaterThan(0);
  await search.fill('zzz');
  await expect(page.locator('.pt-empty')).toBeVisible();
  await search.fill('');
  await page.locator('#required-only').check();
  await expect(page.locator('.pt-item')).toHaveCount(all.filter(item => item[1]).length);
  await page.evaluate(() => { location.hash = 's=C06'; });
  await expect(currentId(page)).toHaveText('C06');
  await arrow(page, 'next').click();
  await expect(currentId(page)).toHaveText('I01');
});

for (const [width, minimum] of [[1280, 32], [390, 44]]) {
  test(`U12: targets are at least ${minimum}px at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./#s=C02');
    const undersized = () => page.evaluate(size => [...document.querySelectorAll('.topnav a, .topnav button, .ctl button, .pt-toolbar button')]
      .filter(element => element.getClientRects().length && element.offsetHeight < size)
      .map(element => element.outerHTML.slice(0, 100)), minimum);
    expect(await undersized()).toEqual([]);
    if (width < 900) await page.locator('#panel-toggle').click();
    expect(await undersized()).toEqual([]);
    await page.locator('[data-act="tab"][data-v="settings"]').click();
    expect(await undersized()).toEqual([]);
  });
}

test('U15: a forced size does not leak', async ({ page }) => {
  await page.goto('./#s=L01');
  await expect(page.locator('.frame')).toHaveClass(/mobile/);
  await arrow(page, 'next').click();
  await expect(page.locator('.frame')).toHaveClass(/desktop/);
});

test('U4: phone shows the title and has a drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#s=C02');
  await expect(page.locator('.pt-current-title')).toBeVisible();
  await expect(page.locator('.ctl')).toBeHidden();
  await page.locator('.pt-current').click();
  await expect(page.locator('.pt-details')).toBeVisible();
  await expect(page.locator('.pt-item[aria-current]')).toBeFocused();
  await expect(page.locator('.stage')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('.ctl')).toBeHidden();
  await expect(page.locator('#panel-toggle')).toBeFocused();
});

for (const width of [390, 768, 1280]) {
  for (const tab of ['scenarios', 'settings']) {
    test(`shell accessibility: ${tab} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('./#s=C02');
      if (width < 900) await page.locator('#panel-toggle').click();
      await page.locator(`[data-act="tab"][data-v="${tab}"]`).click();
      const { violations } = await new AxeBuilder({ page }).analyze();
      const severe = violations.filter(item => ['critical', 'serious'].includes(item.impact));
      expect(severe.map(item => [item.id, item.nodes.slice(0, 4).map(node => `${node.target} ${node.any[0]?.message ?? ''}`)])).toEqual([]);
    });
  }
}
