// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

function normalize(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((x) => {
      if (typeof x === "string") {
        // Legacy shape: just a URL string
        return {
          url: x,
          valueScore: 0,
        };
      }

      if (x && typeof x === "object") {
        const url = x.url || x.href || x.link || "";
        const valueScore =
          typeof x.valueScore === "number" ? x.valueScore : 0;

        return {
          url,
          valueScore,
        };
      }

      return null;
    })
    .filter(
      (item) =>
        item &&
        typeof item.url === "string" &&
        /^https?:\/\//i.test(item.url)
    );
}

export default function AffiliateGrid({ links }) {
  const items = normalize(links);
  if (items.length === 0) return null;

  // Sort by valueScore (highest first), then take top 6
  const sorted = items
    .slice()
    .sort((a, b) => b.valueScore - a.valueScore);
  const top = sorted.slice(0, 6);

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-3">Recommended Gear</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {top.map((item, i) => (
          <AffiliateCard key={`${i}-${item.url}`} url={item.url} />
        ))}
      </div>

      <p className="mt-2 text-xs opacity-70">
        Disclosure: As an Amazon Associate, we may earn from qualifying
        purchases at no extra cost to you.
      </p>
    </section>
  );
}
