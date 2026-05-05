"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const maxButtons = 5;

  if (totalPages <= maxButtons + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 ${className}`}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-card-border bg-card-bg px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-green-accent/30 hover:text-green-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-card-border disabled:hover:text-zinc-300 sm:px-3 sm:text-sm"
        aria-label="Previous page"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1.5 text-xs text-zinc-600 sm:text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[2rem] rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              p === page
                ? "border-green-accent/40 bg-green-accent text-white"
                : "border-card-border bg-card-bg text-zinc-300 hover:border-green-accent/30 hover:text-green-accent"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-card-border bg-card-bg px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-green-accent/30 hover:text-green-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-card-border disabled:hover:text-zinc-300 sm:px-3 sm:text-sm"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}
