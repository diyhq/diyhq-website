import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import sanityConfig from './sanity';

const client = createClient(sanityConfig);

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}
