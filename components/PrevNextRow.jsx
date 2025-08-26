// components/PrevNextRow.jsx
import Link from "next/link";

function Box({ href, label, title, align = "left" }) {
  if (!href || !title) return null;

  return (
    <Link
      href={href}
      className="block rounded-lg border bg-white p-4 hover:shadow-sm transition"
      aria-label={`${label}: ${title}`}
    >
      <div className={`text-xs font-medium text-gray-500 ${align === "right" ? "text-right" : ""}`}>
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold leading-snug text-gray-900 ${
          align === "right" ? "text-right" : ""
        } line-clamp-2`}
      >
        {title}
      </div>
    </Link>
  );
}

export default function PrevNextRow({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Post navigation" className="mt-10 md:mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Box
          href={prev?.slug ? `/post/${prev.slug}` : null}
          label="← Previous"
          title={prev?.title}
          align="left"
        />
        <Box
          href={next?.slug ? `/post/${next.slug}` : null}
          label="Next →"
          title={next?.title}
          align="right"
        />
      </div>
    </nav>
  );
}
