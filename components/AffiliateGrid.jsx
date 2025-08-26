// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

export default function AffiliateGrid({ links = [] }) {
  const clean = (Array.isArray(links) ? links : []).filter(Boolean);
  if (clean.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-2xl font-semibold">Recommended Gear</h2>

      {/* 1 column on mobile, 2 columns on md+ → your “2x2 rectangles” on desktop */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {clean.map((u, i) => (
          <AffiliateCard key={i} url={u} />
        ))}
      </div>

      <p className="mt-3 text-xs opacity-70">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </section>
  );
}
