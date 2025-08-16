// components/SocialShareBar.jsx
import React from 'react';

/**
 * Lightweight share bar: X, Facebook, Pinterest, Reddit, LinkedIn, Email, Copy
 * No extra packages. Mobile will try the native share sheet when available.
 */
export default function SocialShareBar({ url, title, media }) {
  if (!url) return null;

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title || '');
  const m = encodeURIComponent(media || '');

  const links = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      label: 'Share on X (Twitter)',
      icon: '𝕏',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      label: 'Share on Facebook',
      icon: 'f',
    },
    {
      name: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${u}&media=${m}&description=${t}`,
      label: 'Share on Pinterest',
      icon: 'P',
    },
    {
      name: 'Reddit',
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
      label: 'Share on Reddit',
      icon: 'r',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      label: 'Share on LinkedIn',
      icon: 'in',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${t}&body=${u}`,
      label: 'Share via Email',
      icon: '✉️',
    },
  ];

  const openWin = (e, href) => {
    e.preventDefault();
    const w = 640;
    const h = 480;
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    window.open(
      href,
      '_blank',
      `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`
    );
  };

  const onCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    } catch {
      alert(url);
    }
  };

  const onNativeShare = async (e) => {
    if (navigator.share) {
      e.preventDefault();
      try {
        await navigator.share({ title, url });
      } catch {
        // ignore user cancel
      }
    }
  };

  return (
    <div className="flex items-center gap-3 py-3 border-y mt-2 mb-6">
      {/* Native share (mobile) */}
      <a
        href={url}
        onClick={onNativeShare}
        className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm"
        aria-label="Share"
      >
        Share
      </a>

      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          onClick={(e) => openWin(e, l.href)}
          aria-label={l.label}
          title={l.label}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold hover:bg-gray-100"
        >
          {l.icon}
        </a>
      ))}

      <a
        href={url}
        onClick={onCopy}
        aria-label="Copy link"
        title="Copy link"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold hover:bg-gray-100"
      >
        ⧉
      </a>
    </div>
  );
}
