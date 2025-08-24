// lib/sanityFetch.js
import { createClient } from "@sanity/client";

// Hardcoded config (replace with your values if needed)
const projectId = "plkjpsnw";
const dataset = "production";
const apiVersion = "2024-08-20"; // keep recent
const token =
  "skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F"; // your pipedream token

// One shared client instance with token (server + API routes)
const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Optionally, a public client (no token) if you need it for static pages
const publicClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

/**
 * Fetch through Sanity.
 * Defaults to serverClient (with token) so SSR and API always work.
 */
export async function sanityFetch(query, params = {}, opts = {}) {
  try {
    const client = opts.usePublic ? publicClient : serverClient;
    if (!client) return [];
    return await client.fetch(query, params);
  } catch (err) {
    console.error("Sanity fetch error:", err.message);
    return [];
  }
}

// Backward compatibility export
export const USE_CATEGORY_REFERENCE = true;
