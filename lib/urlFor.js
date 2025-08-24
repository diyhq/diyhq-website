// lib/urlFor.js
import imageUrlBuilder from '@sanity/image-url';
import {getPublicClient, hasSanityConfig} from './sanity';

// a tiny no-op builder so calling .width().height().fit().url() won't explode
const dummy = { width(){return this;}, height(){return this;}, fit(){return this;}, url(){return '';} };

let _builder = null;

export function urlFor(source) {
  if (!hasSanityConfig()) return dummy;
  if (!_builder) {
    const client = getPublicClient();
    if (!client) return dummy;
    _builder = imageUrlBuilder(client);
  }
  return _builder.image(source);
}
