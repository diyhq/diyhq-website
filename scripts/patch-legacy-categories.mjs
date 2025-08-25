// scripts/patch-legacy-categories.mjs
// Node >=18
// DRY RUN by default. Pass --apply to write changes.

import { createClient } from '@sanity/client';

// --- YOUR SANITY CONFIG (HARDCODED) ---
const PROJECT_ID = 'plkjpsnw';
const DATASET    = 'production';
const TOKEN      = 'skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F';

// --- Canonical category docs (from your snapshot) ---
const CATS = {
  'automotive':      { id: 'category-automotive-diy',            title: 'Automotive' },
  'beginner-guides': { id: 'category-beginner-diy-guides',       title: 'Beginner DIY Guides' },
  'side-hustles':    { id: 'category-diy-business-side-hustles', title: 'DIY Business & Side Hustles' },
  'cleaning':        { id: 'category-diy-cleaning-maintenance',  title: 'DIY Cleaning & Maintenance' },
  'organization':    { id: 'category-home-organization',         title: 'Home Organization' },
  'home-repair':     { id: 'category-home-repair-maintenance',   title: 'Home Repair' },
  'renovation':      { id: 'category-renovation-remodeling',     title: 'Renovation & Remodeling' },
  'smart-home':      { id: 'category-smart-home-ai-diy',         title: 'Smart Home & AI DIY' },
  'tools-gear':      { id: 'category-tools-gear',                title: 'Tools & Gear' },
  'yard-garden':     { id: 'category-yard-garden-outdoor-diy',   title: 'Yard, Garden, & Outdoor DIY' },
};

// forgiving aliases (from Sheet labels etc)
const ALIASES = {
  'automotive diy': 'automotive',
  'beginner diy guides': 'beginner-guides',
  'diy business & side hustle': 'side-hustles',
  'diy cleaning & maintenance': 'cleaning',
  'home organization': 'organization',
  'home repair & maintenance': 'home-repair',
  'renovation & remodeling': 'renovation',
  'smart home & ai diy': 'smart-home',
  'tools & gear': 'tools-gear',
  'yard, garden, & outdoor diy': 'yard-garden',
  // extra forgiving forms
  'home repair and maintenance': 'home-repair',
  'tools and gear': 'tools-gear',
  'yard garden outdoor diy': 'yard-garden',
};

function slugify(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Guess a category slug from post title when the stored string is blank
function guessFromTitle(title = '') {
  const t = title.toLowerCase();

  // check distinct phrases first
  if (t.includes('automotive')) return 'automotive';
  if (t.includes('home repair') || t.includes('repair')) return 'home-repair';
  if (t.includes('smart home') || t.includes('ai')) return 'smart-home';
  if (t.includes('tools & gear') || t.includes('tools and gear') || t.includes('tools') || t.includes('gear'))
    return 'tools-gear';
  if (t.includes('yard') || t.includes('garden') || t.includes('outdoor')) return 'yard-garden';
  if (t.includes('renovation') || t.includes('remodel')) return 'renovation';
  if (t.includes('cleaning') || t.includes('maintenance')) return 'cleaning';
  if (t.includes('organize') || t.includes('organization')) return 'organization';
  if (t.includes('beginner') || t.includes('guide')) return 'beginner-guides';
  if (t.includes('business') || t.includes('hustle')) return 'side-hustles';

  return ''; // no safe guess
}

const APPLY = process.argv.includes('--apply');

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2023-10-12',
  useCdn: false,
});

(async () => {
  // 1) Collect posts that either (a) lack category reference or (b) lack publishedAt
  const docs = await client.fetch(`
    *[
      _type=="post" &&
      defined(slug.current) &&
      (
        !defined(category._ref) || !defined(publishedAt)
      )
    ]{
      _id, title, "slug": slug.current,
      "strCat": string(category),
      "refSlug": category->slug.current,
      publishedAt, _createdAt
    }
  `);

  console.log(`Found ${docs.length} post(s) to review.`);

  // 2) Build patches
  const patches = [];
  for (const d of docs) {
    const set = {};

    // If missing publishedAt, set to createdAt (keeps sort stable)
    if (!d.publishedAt && d._createdAt) {
      set.publishedAt = d._createdAt;
    }

    // If no reference, map category string or guess from title when string is blank
    if (!d.refSlug) {
      const raw = (d.strCat || '').trim();

      // primary: use the given string
      let key =
        ALIASES[raw.toLowerCase()] ||
        ALIASES[slugify(raw)] ||
        slugify(raw);

      // fallback: title-based guess when raw is blank or unmapped
      if (!key) key = guessFromTitle(d.title);

      const cfg = CATS[key];
      if (cfg) {
        set.category = { _type: 'reference', _ref: cfg.id };
      } else {
        console.log(`SKIP (no mapping): ${d._id} — raw:"${raw}" title:"${d.title}"`);
      }
    }

    if (Object.keys(set).length) {
      patches.push({ id: d._id, set });
    }
  }

  console.log(
    `Would patch ${patches.length} post(s). ${APPLY ? '(apply now)' : '(dry run, no writes)'}`
  );

  if (!APPLY || patches.length === 0) return;

  // 3) Apply patches
  // Use batches so huge lists are safe; your set is small so one tx is fine.
  const tx = client.transaction();
  patches.forEach(p => tx.patch(p.id, { set: p.set }));
  const result = await tx.commit();
  console.log('Patched posts:', result?.results?.length || 0);
})().catch((err) => {
  console.error('Patch failed:', err?.response?.body || err);
  process.exit(1);
});
