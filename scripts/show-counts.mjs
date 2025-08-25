// scripts/show-counts.mjs
// Node >=18. Prints counts for each canonical category slug.
// Uses the same tolerant logic as the page/debug: reference OR string prefix.

import { createClient } from '@sanity/client';

const PROJECT_ID = 'plkjpsnw';
const DATASET    = 'production';
const TOKEN      = 'skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F';

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2023-10-12',
  useCdn: false,
});

// your 10 canonical slugs
const SLUGS = [
  'automotive',
  'beginner-guides',
  'side-hustles',
  'cleaning',
  'organization',
  'home-repair',
  'renovation',
  'smart-home',
  'tools-gear',
  'yard-garden',
];

async function countFor(slug) {
  const slugPrefix = `${slug}*`;
  const q = `
    count(
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(defined(hidden) && hidden == true) &&
        (
          (defined(category->slug.current) && category->slug.current == $slug) ||
          (!defined(category._ref) && lower(string(category)) match $slugPrefix)
        )
      ]
    )
  `;
  return client.fetch(q, { slug, slugPrefix });
}

(async () => {
  const result = {};
  let total = 0;
  for (const s of SLUGS) {
    const n = await countFor(s);
    result[s] = n;
    total += n;
  }
  console.log('Counts by category:', result);
  console.log('Total (across all categories, tolerant match):', total);
})();
