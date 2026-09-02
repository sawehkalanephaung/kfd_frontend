/**
 * The public site has ~9 pages/sections that fetch a specific, hardcoded CMS
 * page slug (see the call sites listed in `usedIn` below). This is the single
 * source of truth for that list — both the admin "Pages" screen (well-known
 * pages panel + the create-form slug datalist) and every public fetcher
 * import from here, so the two can't drift apart the way they already had
 * (the old hardcoded admin datalist was missing "home").
 */
export interface ReservedPage {
  slug: string;
  /** Short label for the admin UI. */
  label: string;
  /** Prefilled as the page Title when creating this page from the admin panel. */
  defaultTitle: string;
  /** Shown in the admin UI to explain what this page controls. */
  description: string;
  /** Where this slug is fetched from, for the admin UI's benefit. */
  usedIn: string;
  /**
   * Whether the public layout for this slug renders the slider gallery. Most
   * reserved pages are prose-only, so the admin form hides the field for them
   * rather than offering an upload that nothing displays.
   */
  usesSlider?: boolean;
}

export const RESERVED_PAGES: ReservedPage[] = [
  {
    slug: 'home',
    label: 'Homepage Hero',
    defaultTitle: "Protecting Kawthoolei's Forests for Future Generations",
    description: 'Headline and intro paragraph shown in the homepage hero banner.',
    usedIn: '/ (homepage)',
    usesSlider: true,
  },
  {
    slug: 'about-us',
    label: 'About Us',
    defaultTitle: 'About Us',
    description: 'Hero headline and intro on the About page.',
    usedIn: '/about',
    usesSlider: true,
  },
  {
    slug: 'history',
    label: 'History',
    defaultTitle: 'History',
    description: "Department history — shown on the About page's history block and its own page.",
    usedIn: '/about, /history',
  },
  {
    slug: 'mission',
    label: 'Mission',
    defaultTitle: 'Mission',
    description: 'Mission statement card on the About page.',
    usedIn: '/about',
  },
  {
    slug: 'vision',
    label: 'Vision',
    defaultTitle: 'Vision',
    description: 'Vision statement card on the About page.',
    usedIn: '/about',
  },
  {
    slug: 'objective',
    label: 'Objectives',
    defaultTitle: 'Objective',
    description: 'Objectives list on the About page.',
    usedIn: '/about',
  },
  {
    slug: 'privacy-policy',
    label: 'Privacy Policy',
    defaultTitle: 'Privacy Policy',
    description: 'Full policy content.',
    usedIn: '/privacy-policy',
  },
  {
    slug: 'terms-of-use',
    label: 'Terms of Use',
    defaultTitle: 'Terms Of Use',
    description: 'Full terms content.',
    usedIn: '/terms-of-use',
  },
  {
    slug: 'accessibility-statement',
    label: 'Accessibility Statement',
    defaultTitle: 'Accessibility Statement',
    description: 'Full accessibility statement content.',
    usedIn: '/accessibility',
  },
];

/** Type-safe slug constants for the public fetchers — avoids re-typing the raw strings. */
export const RESERVED_PAGE_SLUGS = {
  HOME: 'home',
  ABOUT_US: 'about-us',
  HISTORY: 'history',
  MISSION: 'mission',
  VISION: 'vision',
  OBJECTIVE: 'objective',
  PRIVACY_POLICY: 'privacy-policy',
  TERMS_OF_USE: 'terms-of-use',
  ACCESSIBILITY_STATEMENT: 'accessibility-statement',
} as const;
