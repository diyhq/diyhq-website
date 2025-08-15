// lib/ptComponents.js
import React from "react";

export const ptComponents = {
  // Blocks (paragraphs, headings, quotes…)
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => <p className="my-4">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-4 italic my-4">{children}</blockquote>
    ),
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

  // Inline marks
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const ext = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          className="underline"
          target={ext ? "_blank" : undefined}
          rel={ext ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};
