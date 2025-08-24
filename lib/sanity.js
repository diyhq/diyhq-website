// lib/sanity.js
import {createClient} from '@sanity/client';

function readEnv() {
  // Support both server + public names
  const projectId =
    process.env.SANITY_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    '';
  const dataset =
    process.env.SANITY_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production';
  const apiVersion = process.env.SANITY_API_VERSION || '2024-08-20';
  const token = process.env.SANITY_READ_TOKEN || undefined;

  // If a token is present, force fresh reads from API (no CDN)
  const useCdn = !token;

  return { projectId, dataset, apiVersion, token, useCdn };
}

export function hasSanityConfig() {
  const {projectId, dataset} = readEnv();
  return Boolean(projectId && dataset);
}

// Lazily memoized clients, created only when first used
let _publicClient = null;
let _serverClient = null;

export function getPublicClient() {
  if (_publicClient || !hasSanityConfig()) return _publicClient;
  const {projectId, dataset, apiVersion, useCdn} = readEnv();
  _publicClient = createClient({ projectId, dataset, apiVersion, useCdn });
  return _publicClient;
}

export function getServerClient() {
  if (_serverClient || !hasSanityConfig()) return _serverClient;
  const {projectId, dataset, apiVersion, token} = readEnv();
  _serverClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token,          // if undefined, still OK for public datasets
    useCdn: false,  // server should bypass CDN for fresh reads
    perspective: 'published'
  });
  return _serverClient;
}
