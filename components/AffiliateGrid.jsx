// components/AffiliateGrid.jsx
import AffiliateCard from "./AffiliateCard";

function normalize(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((x) => {
      if (typeof x === "string") {
        return {
          url: x,
        };
      }

      if (x && typeof x === "object") {
        const url = x.url || x.href || x.link || "";
        return {
          url,
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

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function AffiliateGrid({ links }) {
  const items = normalize(links);
  if (items.length === 0) return null;

  // Shuffle and take up to 6 items
  const shuffled = shuffle(items);
  const top = shuffled.slice(0, 6);

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
