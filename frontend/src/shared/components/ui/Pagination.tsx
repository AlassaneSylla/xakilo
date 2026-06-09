import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  currentPage: number;
  total: number;
  onChange: (page: number) => void;
};

function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, total, onChange }: Props) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 select-none">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-sm btn-ghost gap-1 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
      >
        <ChevronLeft size={15} />
        Précédent
      </button>

      <div className="flex items-center gap-1 mx-1">
        {buildPages(currentPage, total).map((page, i) =>
          page === '...' ? (
            <span key={`dot-${i}`} className="w-7 text-center text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onChange(page as number)}
              className={clsx(
                'btn btn-xs w-8 h-8 font-semibold transition-all duration-150 border-0',
                page === currentPage
                  ? 'bg-[var(--black)] text-[var(--brokenWhite)] shadow-md scale-105'
                  : 'btn-ghost text-gray-500 hover:text-[var(--black)] hover:bg-base-300'
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= total}
        className="btn btn-sm btn-ghost gap-1 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
      >
        Suivant
        <ChevronRight size={15} />
      </button>
    </div>
  );
}