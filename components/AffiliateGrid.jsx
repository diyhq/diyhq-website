// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

function normalize(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") return x.url || x.href || x.link || "";
      return "";
    })
    .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
}

export default function AffiliateGrid({ links }) {
  const urls = normalize(links);
  if (urls.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-3">Recommended Gear</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {urls.map((u, i) => (
          <AffiliateCard key={`${i}-${u}`} url={u} />
        ))}
      </div>

      <p className="mt-2 text-xs opacity-70">
        Disclosure: As an Amazon Associate, we may earn from qualifying
        purchases at no extra cost to you.
      </p>
    </section>
  );
}
