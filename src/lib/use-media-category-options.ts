import { useEffect, useState } from 'react';
import api from './api';

/**
 * Media assets don't belong to a fixed taxonomy (mediaCategory is a free
 * string column, not a foreign key), but reusing names already defined for
 * Posts/Publications keeps categorization consistent instead of every
 * upload inventing its own spelling. Both lists are fetched and merged as
 * suggestions; the media asset's category stays whatever string is
 * ultimately picked or typed — creating a new one here never writes into
 * either taxonomy's own category table.
 */
export function useMediaCategoryOptions(): string[] {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const extractNames = (res: PromiseSettledResult<{ data: any }>): string[] => {
      if (res.status !== 'fulfilled') return [];
      const data = res.value.data?.content || res.value.data?.data?.content || res.value.data?.data || res.value.data || [];
      return Array.isArray(data) ? data.map((c: any) => c.name).filter(Boolean) : [];
    };

    Promise.allSettled([
      api.get('/api/v1/admin/cms/categories'),
      api.get('/api/v1/admin/cms/publication-categories'),
    ]).then(([postCategories, publicationCategories]) => {
      if (cancelled) return;
      const merged = Array.from(new Set([...extractNames(postCategories), ...extractNames(publicationCategories)]));
      merged.sort((a, b) => a.localeCompare(b));
      setOptions(merged);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
