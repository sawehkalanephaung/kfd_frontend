import { test, expect } from '@playwright/test';
import { parseRgb } from './utils/contrast';

/**
 * Pages whose page-background layer (canvas/surface tokens, or the plain
 * literals that stood in for them) must be flat white in light mode.
 * `exclude` lists class-name substrings for elements that are DELIBERATELY
 * not white — a fixed-dark accent band, same idea as the stats section's
 * always-dark forest green, unrelated to the light/dark theme toggle — so a
 * real regression elsewhere on the page isn't masked by skipping the whole
 * page.
 */
const WHITE_PAGES: { path: string; exclude?: string[] }[] = [
  { path: '/', exclude: ['bg-forest-900', 'bg-forest-700', 'bg-teal-deep'] },
  { path: '/terms-of-use' },
  { path: '/privacy-policy' },
  { path: '/accessibility' },
  // PageHero (src/components/ui/page-hero.tsx) is a shared always-dark
  // band used on most interior pages, independent of the theme toggle.
  { path: '/history', exclude: ['bg-forest-950'] },
  { path: '/about', exclude: ['bg-forest', 'bg-teal-deep'] },
  { path: '/about/chairman', exclude: ['bg-[#0b1f14]', 'bg-[#12271b]', 'bg-teal-deep'] },
];

/**
 * Pages with a deliberately distinct background NOT converted to white —
 * a self-contained sub-theme (Resources' document-viewer palette, a news
 * article's "paper" reading theme) or a fixed-dark accent panel (Contact's
 * card). Recorded here, not silently skipped, so the exclusion is visible.
 */
const KNOWN_NON_WHITE_PAGES: Record<string, string> = {
  '/contact': 'dark green contact-card accent panel (bg-[#091810] etc.) — not converted',
  '/resources': 'self-contained document-viewer palette (bg-[#eef1f5] etc.) — not converted',
};

test.describe('light mode backgrounds', () => {
  test.use({ colorScheme: 'light' });

  for (const { path, exclude = [] } of WHITE_PAGES) {
    test(`${path} — page background is flat white outside known accent bands`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(path);
      await expect(page.locator('html')).toHaveClass(/light/);

      // Layout-level containers only (direct children of <main>, plus any
      // <section>) — this codebase's convention for where a page sets its
      // background layer. Walking every descendant would also catch
      // decorative micro-elements (badge pills, divider rules, image
      // placeholders) that were never part of the "page background" this
      // check is about.
      const offenders = await page.evaluate((excludeList: string[]) => {
        const nodes = document.querySelectorAll('main > *, section');
        const bad: { selector: string; bg: string }[] = [];
        nodes.forEach((el) => {
          const cls = (el.className || '').toString();
          if (excludeList.some((ex) => cls.includes(ex))) return;
          // an excluded ancestor's descendants inherit its accent color —
          // don't re-flag them individually.
          if (el.closest(excludeList.map((ex) => `[class*="${ex}"]`).join(',') || 'nope')) return;

          const bg = getComputedStyle(el).backgroundColor;
          if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return;
          if (bg !== 'rgb(255, 255, 255)') {
            bad.push({ selector: `${el.tagName.toLowerCase()}.${cls.slice(0, 60)}`, bg });
          }
        });
        return bad;
      }, exclude);

      expect(offenders, `non-white backgrounds found on ${path}`).toEqual([]);
    });
  }

  for (const [path, reason] of Object.entries(KNOWN_NON_WHITE_PAGES)) {
    test(`${path} — known non-white exception (${reason})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      const res = await page.goto(path);
      expect(res?.ok(), `${path} should load`).toBeTruthy();
    });
  }

  test('header/body resolve to white; footer stays its deliberate dark teal', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    for (const selector of ['body', 'header.bg-canvas']) {
      const bg = parseRgb(
        await page.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundColor)
      );
      expect(bg, `${selector} background`).toEqual([255, 255, 255]);
    }

    // Footer is bg-teal-deep by design (fixed dark, like the stats band) —
    // not part of the "page background" this suite checks. Asserted here
    // only so a future accidental whitening shows up as a failure too.
    const footerBg = parseRgb(
      await page.locator('footer').first().evaluate((el) => getComputedStyle(el).backgroundColor)
    );
    expect(footerBg, 'footer background (deliberately not white)').not.toEqual([255, 255, 255]);
  });
});
