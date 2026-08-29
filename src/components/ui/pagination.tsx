import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ItemRange {
  start: number;
  end: number;
  total: number;
  /** e.g. "members", "posts" */
  itemLabel: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Shows "Showing X to Y of Z {itemLabel}" instead of "Page X of Y" when provided. */
  itemRange?: ItemRange;
  className?: string;
}

/**
 * Shared list-page pagination footer. Previously hand-rolled in posts,
 * publications, pages, and media (identical, accessible "Page X of Y"
 * + labeled Previous/Next) and independently again in team/page.tsx
 * (a numbered-button variant whose Previous/Next controls were
 * icon-only with no accessible name at all, and whose numbered-button
 * list had no upper bound - see UI_ACCESSIBILITY_AUDIT §3). This
 * always renders labeled Previous/Next, which scales to any page
 * count without an unbounded button list.
 */
export function Pagination({ currentPage, totalPages, onPageChange, itemRange, className = '' }: PaginationProps) {
  return (
    <div
      className={`px-4 sm:px-6 py-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 bg-canvas rounded-b-lg ${className}`}
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-hairline-strong text-sm font-medium text-steel hover:bg-surface hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-sm w-full sm:w-auto justify-center"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Previous
      </button>

      {itemRange ? (
        <span className="text-sm text-steel text-center">
          Showing <span className="font-medium text-ink">{itemRange.start}</span> to{' '}
          <span className="font-medium text-ink">{itemRange.end}</span> of{' '}
          <span className="font-medium text-ink">{itemRange.total}</span> {itemRange.itemLabel}
        </span>
      ) : (
        <div className="text-sm text-steel text-center">
          Page <span className="font-medium text-ink">{currentPage}</span> of <span className="font-medium text-ink">{totalPages}</span>
        </div>
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-hairline-strong text-sm font-medium text-steel hover:bg-surface hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-sm w-full sm:w-auto justify-center"
      >
        Next
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
