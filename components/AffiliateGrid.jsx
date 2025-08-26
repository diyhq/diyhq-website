// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

export default function AffiliateGrid({ links = [] }) {
  if (!Array.isArray(links) || links.length === 0) return null;

  // Ensure unique URLs (remove accidental dupes)
  const unique = Array.from(new Set(links.filter(Boolean)));

  return (
    <section aria-labelledby="rec-gear" className="mt-8 md:mt-12">
      <h2 id="rec-gear" className="text-xl font-bold mb-3">Recommended Gear</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {unique.map((u) => (
          <AffiliateCard key={u} url={u} />
        ))}
      </div>

      {/* Single disclosure line only (no duplicates) */}
      <p className="mt-3 text-xs text-gray-500">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </section>
  );
}
