// lib/urlFor.js
import imageUrlBuilder from '@sanity/image-url';
import { getPublicClient, hasSanityConfig } from './sanity';

let _builder = null;

/**
 * Lazily construct the image URL builder.
 * If config is missing, return a no-op builder so UIs don't crash.
 */
function builder() {
  if (_builder) return _builder;
  if (!hasSanityConfig()) {
    // no-op; still returns {url: () => ''} for safety
    return { image: () => ({ url: () => '' }) };
  }
  _builder = imageUrlBuilder(getPublicClient());
  return _builder;
}

export function urlFor(source) {
  return builder().image(source);
}
