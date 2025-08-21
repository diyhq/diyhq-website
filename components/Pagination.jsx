// components/Pagination.jsx
import Link from "next/link";

export default function Pagination({ basePath, page, pageCount }) {
  if (!page || !pageCount || pageCount <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < pageCount ? page + 1 : null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      {prev ? (
        <Link
          href={prev === 1 ? `${basePath}` : `${basePath}/page/${prev}`}
          className="px-3 py-1 border rounded hover:bg-orange-100"
        >
          ← Prev
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded text-gray-400">← Prev</span>
      )}

      <span className="px-3 py-1 text-sm">
        Page {page} of {pageCount}
      </span>

      {next ? (
        <Link
          href={`${basePath}/page/${next}`}
          className="px-3 py-1 border rounded hover:bg-orange-100"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded text-gray-400">Next →</span>
      )}
    </nav>
  );
}
