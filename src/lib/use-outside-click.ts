import { useEffect, type RefObject } from 'react';

/**
 * Closes a dropdown/popover when the user clicks outside it. Accepts more
 * than one container ref so a trigger and a portaled panel (rendered
 * elsewhere in the DOM, e.g. via createPortal) can both count as "inside" —
 * without that, a click on the portaled panel itself would be misread as an
 * outside click and immediately close it.
 */
export function useOutsideClick(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutsideClick: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInside = refList.some((ref) => ref.current && ref.current.contains(target));
      if (!isInside) onOutsideClick();
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onOutsideClick]);
}
