// components/AffiliateGrid.jsx
import AffiliateCard from './AffiliateCard';

export default function AffiliateGrid({ links = [] }) {
  if (!links || links.length === 0) return null;

  // use at most 4 here; you can raise this if desired
  const items = links.slice(0, 4);

  return (
    <section aria-labelledby="rec-gear-heading" className="mt-8">
      <h2 id="rec-gear-heading" className="sr-only">
        Recommended Gear
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {items.map((u, i) => (
          <AffiliateCard key={i} url={u} />
        ))}
      </div>

      <p className="mt-2 text-[11px] text-gray-500">
        Disclosure: As an Amazon Associate, we may earn from qualifying purchases at no extra cost to
        you.
      </p>
    </section>
  );
}
