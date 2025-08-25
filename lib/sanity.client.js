// lib/sanity.client.js
// Universal server-side Sanity client with your hardcoded token.

import { createClient } from "@sanity/client";

// WARNING: Hardcoding tokens ships secret into your repo history.
// This client MUST only be imported server-side (API routes, getStaticProps/getStaticPaths via dynamic import)
// to avoid leaking the token into the browser bundle.

export const client = createClient({
  projectId: "plkjpsnw",                  // DIY HQ project id
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: true,                           // cached reads are fine for blog posts
  token: "skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F",
});
