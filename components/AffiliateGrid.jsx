// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

export default function AffiliateGrid({ links = [] }) {
  const urls = Array.isArray(links) ? links.filter(Boolean).slice(0, 4) : [];
  if (urls.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Recommended Gear</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {urls.map((u, i) => (
          <AffiliateCard key={`${u}-${i}`} url={u} />
        ))}
      </div>
      <p className="mt-2 text-[11px] opacity-60">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </section>
  );
}
