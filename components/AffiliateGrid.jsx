// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

/**
 * Renders up to 8 affiliate links as a compact grid:
 * - 2 columns on phones, 4 on desktop (2 rows max)
 * - Tight gaps; lives above “Common Mistakes”
 */
export default function AffiliateGrid({ links = [] }) {
  const items = (Array.isArray(links) ? links : []).filter(Boolean).slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="rec-gear" className="mt-10">
      <h2 id="rec-gear" className="mb-3 text-xl font-semibold">
        Recommended Gear
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((u, i) => (
          <AffiliateCard key={`${u}-${i}`} url={u} />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </section>
  );
}
