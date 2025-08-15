// components/ptComponents.js
import React from 'react';

const ptComponents = {
  // Headings & paragraphs
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => <p className="my-4">{children}</p>,
  },

  // Lists
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },

  // Inline marks (bold/italic/links)
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href = value?.href || '#';
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          className="underline"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default ptComponents;
