// components/RichContent.js
import React from 'react';
import { PortableText } from '@portabletext/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ptComponents from './ptComponents';

/**
 * Accepts `value` as:
 *  - Portable Text array  -> renders with PortableText
 *  - string/array of strings (markdown-ish) -> renders with ReactMarkdown
 */
export default function RichContent({ value, className = 'prose max-w-none' }) {
  // Portable Text shape?
  const looksLikePT =
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    !!value[0]._type;

  if (looksLikePT) {
    return <PortableText value={value} components={ptComponents} />;
  }

  // String/lines -> Markdown
  const md =
    Array.isArray(value) ? value.filter(Boolean).join('\n') :
    typeof value === 'string' ? value :
    '';

  if (md) {
    return (
      <ReactMarkdown className={className} remarkPlugins={[remarkGfm]}>
        {md}
      </ReactMarkdown>
    );
  }

  return null;
}
