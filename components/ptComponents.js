// components/ptComponents.js
import { urlFor } from '../lib/urlFor';

const ptComponents = {
  /* Render Sanity inline marks */
  marks: {
    em:   ({ children }) => <em className="italic">{children}</em>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    link: ({ value, children }) => {
      const href = value?.href || '#';
      const external = !href.startsWith('/');
      return (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="text-blue-600 underline hover:no-underline"
        >
          {children}
        </a>
      );
    },
  },

  /* Render block-level nodes (paragraphs, headings, quotes) */
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-semibold mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg md:text-xl font-semibold mt-6 mb-3">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  },

  /* Render lists (this is what ensures <ul>/<ol>/<li>) */
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },

  /* Render inline images from Portable Text, if you use them */
  types: {
    image: ({ value }) => {
      const alt = value?.alt || '';
      const src = urlFor(value).width(1200).fit('max').url();
      return (
        <figure className="my-6">
          <img src={src} alt={alt} className="w-full h-auto rounded-md" loading="lazy" />
          {alt && <figcaption className="text-sm text-gray-500 mt-2">{alt}</figcaption>}
        </figure>
      );
    },
  },
};

export default ptComponents;
