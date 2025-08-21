// components/Pagination.jsx
import Link from "next/link";

export default function Pagination({ basePath, page, pageCount }) {
  if (pageCount <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < pageCount ? page + 1 : null;

  // Helpers to build links: /category/slug (page 1) or /category/slug/page/N
  const pageHref = (n) => (n === 1 ? basePath : `${basePath}/page/${n}`);

  // Render up to 7 numbered links (compact)
  const maxShown = 7;
  const pages = [];
  let start = Math.max(1, page - 3);
  let end   = Math.min(pageCount, start + maxShown - 1);
  if (end - start + 1 < maxShown) start = Math.max(1, end - maxShown + 1);

  for (let n = start; n <= end; n++) pages.push(n);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      {prevPage && (
        <Link
          className="px-3 py-1 border rounded hover:bg-gray-50"
          href={pageHref(prevPage)}
          aria-label="Previous page"
        >
          ← Prev
        </Link>
      )}

      {start > 1 && (
        <>
          <Link className="px-3 py-1 border rounded hover:bg-gray-50" href={pageHref(1)}>1</Link>
          {start > 2 && <span className="px-1">…</span>}
        </>
      )}

      {pages.map((n) => (
        <Link
          key={n}
          href={pageHref(n)}
          className={`px-3 py-1 border rounded ${n === page ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </Link>
      ))}

      {end < pageCount && (
        <>
          {end < pageCount - 1 && <span className="px-1">…</span>}
          <Link className="px-3 py-1 border rounded hover:bg-gray-50" href={pageHref(pageCount)}>
            {pageCount}
          </Link>
        </>
      )}

      {nextPage && (
        <Link
          className="px-3 py-1 border rounded hover:bg-gray-50"
          href={pageHref(nextPage)}
          aria-label="Next page"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
