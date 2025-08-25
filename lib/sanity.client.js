// lib/sanity.client.js
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "plkjpsnw",
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: true,
  token: "skPjTS4ijIzgDMzqHXVez7nhRqSAWsC6FPabQpYxTQgEqBAerNFSrIo7LuYUs7Ky30eki9LxFHVEfId58ChIeDIXUNS89tlimrQqekgzsK1YfpXlyurepVg628ZuFBhHYiR0khLaexUhMbAB3beXyUIMOFLS9j7oZXVDqgbqCm1hWiq76M2F",
});
