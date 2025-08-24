// lib/sanity.js
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const env = (k) => process.env[k];

export const sanityEnv = {
  projectId:
    env('SANITY_PROJECT_ID') ||
    env('NEXT_PUBLIC_SANITY_PROJECT_ID') ||
    env('NEXT_PUBLIC_SANITY_PROJECTID') ||
    '',
  dataset:
    env('SANITY_DATASET') ||
    env('NEXT_PUBLIC_SANITY_DATASET') ||
    'production',
  apiVersion: env('SANITY_API_VERSION') || '2024-08-20',
  token:
    env('SANITY_READ_TOKEN') ||
    env('SANITY_API_READ_TOKEN') ||
    '',
};

export function hasSanityConfig() {
  return Boolean(sanityEnv.projectId && sanityEnv.dataset);
}

function baseConfig(withToken) {
  return {
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    token: withToken && sanityEnv.token ? sanityEnv.token : undefined,
    useCdn: !withToken,
    perspective: 'published',
    stega: { enabled: false },
  };
}

let _publicClient;
let _serverClient;
let _imgBuilder;

export function getPublicClient() {
  if (!hasSanityConfig()) return null;
  if (!_publicClient) _publicClient = createClient(baseConfig(false));
  return _publicClient;
}

export function getServerClient() {
  if (!hasSanityConfig()) return null;
  if (!_serverClient) _serverClient = createClient(baseConfig(true));
  return _serverClient;
}

// urlFor helper (also re-exported here to satisfy legacy imports)
export function urlFor(source) {
  if (!hasSanityConfig()) {
    // no-op chain to avoid crashes if env is missing
    const noop = {
      width: () => noop,
      height: () => noop,
      fit: () => noop,
      quality: () => noop,
      format: () => noop,
      url: () => '',
    };
    return noop;
  }
  if (!_imgBuilder) _imgBuilder = imageUrlBuilder(getPublicClient());
  return _imgBuilder.image(source);
}

// legacy named export in case something still imports { sanityClient } from './sanity'
export const sanityClient = getPublicClient();
