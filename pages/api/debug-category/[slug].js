// pages/api/debug-category/[slug].js
import { sanityFetch } from "../../../lib/sanityFetch";

const ALIASES = {
  "automotive": ["automotive-diy"],
  "home-repair": ["home-repair-maintenance", "home-repair-and-maintenance"],
  "tools-gear": ["tools-gear-reviews"],
  "renovation": ["renovation-remodeling", "renovation-and-remodeling"],
  "yard-garden": ["yard-garden-outdoor-diy"],
  "smart-home": ["smart-home-ai-diy"],
  "beginner-guides": ["beginner-diy-guides"],
  "cleaning": ["diy-cleaning-maintenance", "cleaning-maintenance"],
  "organization": ["home-organization"],
  "side-hustles": ["diy-business-side-hustles", "business-side-hustles"],
};

function slugSetFor(slug) {
  const set = new Set([slug, `${slug}-diy`, `diy-${slug}`]);
  (ALIASES[slug] || []).forEach((s) => set.add(s));
  return Array.from(set);
}
function titleSetFor(slug) {
  const base = slug.replace(/-/g, ' ');
  const set = new Set([base, `${base} diy`, `diy ${base}`]);
  (ALIASES[slug] || []).forEach((s) => {
    const t = s.replace(/-/g, ' ');
    set.add(t); set.add(`${t} diy`); set.add(`diy ${t}`);
  });
  return Array.from(set);
}

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '').toLowerCase();
    const slugs = slugSetFor(slug);
    const titles = titleSetFor(slug);

    const Q = `
      *[
        _type == "post" &&
        defined(slug.current) &&
        publishedAt < now() &&
        !(_id in path('drafts.**')) &&
        (!defined(hidden) || hidden != true) &&
        (
          (defined(category->slug.current) && category->slug.current in $slugs) ||
          (defined(categories) && count(categories[]->slug.current[@ in $slugs]) > 0) ||
          (defined(category) && lower(category) in $titles)
        )
      ] | order(publishedAt desc){
        _id, title, "slug": slug.current,
        "catRefSlug": category->slug.current,
        "catRefTitle": category->title,
        "legacyString": category
      }
    `;
    const items = await sanityFetch(Q, { slugs, titles });
    res.status(200).json({ slug, slugs, titles, count: items.length, items });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
}
