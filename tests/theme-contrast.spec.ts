import { test, expect, type Page } from '@playwright/test';
import { parseRgb, hexToRgb, contrastRatio, AA_NORMAL_TEXT } from './utils/contrast';

/**
 * `--color-forest*` and `--color-danger*` are declared with no `.dark` override — the
 * codebase's own comment on the token calls them "fixed across light/dark app theme".
 * These are their :root values (src/app/globals.css); asserting the exact rgb() here
 * catches the token silently resolving to nothing (background collapses to
 * transparent) as well as it resolving to the wrong color.
 */
const FOREST_700 = hexToRgb('#132a1c');
const ON_DARK_MUTED = hexToRgb('#a8b3bc');

/**
 * --color-canvas / --color-brand-text (src/app/globals.css): light mode is
 * flat white, dark mode is the brand forest green with white brand text —
 * the pairing this whole suite exists to lock in.
 */
const CANVAS_BY_SCHEME = { light: hexToRgb('#ffffff'), dark: hexToRgb('#0f2318') } as const;
const BRAND_TEXT_BY_SCHEME = { light: hexToRgb('#1a3626'), dark: hexToRgb('#ffffff') } as const;

async function themed(page: Page, scheme: 'light' | 'dark') {
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(new RegExp(scheme));
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test(`page background/foreground meet AA contrast (${scheme})`, async ({ page }) => {
      await themed(page, scheme);

      const body = page.locator('body');
      const bg = parseRgb(await body.evaluate((el) => getComputedStyle(el).backgroundColor));
      const navLink = page.locator('nav a:visible').first();
      const fg = parseRgb(await navLink.evaluate((el) => getComputedStyle(el).color));

      const ratio = contrastRatio(bg, fg);
      expect(ratio, `body bg vs nav link text contrast in ${scheme} mode`).toBeGreaterThanOrEqual(
        AA_NORMAL_TEXT
      );
    });

    test(`header bg-canvas is white in light / brand green in dark (${scheme})`, async ({
      page,
    }) => {
      await themed(page, scheme);

      const header = page.locator('header.bg-canvas');
      const bg = parseRgb(await header.evaluate((el) => getComputedStyle(el).backgroundColor));
      expect(bg, `header bg-canvas computed color in ${scheme} mode`).toEqual(
        CANVAS_BY_SCHEME[scheme]
      );
    });

    test(`navbar brand text (text-brand-text) meets AA contrast against bg-canvas (${scheme})`, async ({
      page,
    }) => {
      await themed(page, scheme);

      const header = page.locator('header.bg-canvas');
      const brand = header.locator('.text-brand-text').first();

      const bg = parseRgb(await header.evaluate((el) => getComputedStyle(el).backgroundColor));
      const fg = parseRgb(await brand.evaluate((el) => getComputedStyle(el).color));
      expect(fg, `text-brand-text computed color in ${scheme} mode`).toEqual(
        BRAND_TEXT_BY_SCHEME[scheme]
      );

      const ratio = contrastRatio(bg, fg);
      expect(
        ratio,
        `text-brand-text vs bg-canvas contrast in ${scheme} mode`
      ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });

    test(`stats band (bg-forest-700) resolves and stays theme-invariant (${scheme})`, async ({
      page,
    }) => {
      await themed(page, scheme);

      const section = page.locator('section.bg-forest-700');
      await expect(section).toBeVisible();

      const bg = parseRgb(await section.evaluate((el) => getComputedStyle(el).backgroundColor));
      expect(bg, `bg-forest-700 computed color in ${scheme} mode`).toEqual(FOREST_700);

      const number = section.locator('span[aria-hidden="true"]').first();
      const numberColor = parseRgb(
        await number.evaluate((el) => getComputedStyle(el).color)
      );
      expect(numberColor, `text-on-dark-muted computed color in ${scheme} mode`).toEqual(
        ON_DARK_MUTED
      );

      const ratio = contrastRatio(bg, numberColor);
      expect(
        ratio,
        `stat number vs bg-forest-700 contrast in ${scheme} mode`
      ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  });
}
