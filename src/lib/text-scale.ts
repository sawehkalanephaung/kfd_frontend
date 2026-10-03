/**
 * localStorage key for the reader's text size. Lives outside the
 * `'use client'` TextResizer module because the root layout (a server
 * component) inlines it into the boot script - a value imported from a
 * client module arrives there as a reference, not a string.
 */
export const TEXT_SCALE_STORAGE_KEY = 'kfd-text-scale';
