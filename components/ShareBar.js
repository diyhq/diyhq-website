import { useMemo, useState } from "react";

/**
 * Simple, fast share bar with accessible icons.
 * Tailwind CSS only (no extra packages).
 *
 * Props:
 * - url:   absolute URL of the post (required)
 * - title: post title (required)
 * - media: absolute image URL for Pinterest (optional)
 * - className: optional extra classes
 */
export default function ShareBar({ url, title, media, className = "" }) {
  const [copied, setCopied] = useState(false);

  const enc = (v = "") => encodeURIComponent(v);
  const share = useMemo(() => {
    const base = `${url}${url.includes("?") ? "&" : "?"}utm_source=social&utm_medium=share&utm_campaign=post_share`;
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(base)}&quote=${enc(title)}`,
      x:        `https://twitter.com/intent/tweet?url=${enc(base + "&utm_platform=x")}&text=${enc(title)}`,
      pinterest:`https://pinterest.com/pin/create/button/?url=${enc(base + "&utm_platform=pinterest")}&media=${enc(media || "")}&description=${enc(title)}`,
      reddit:   `https://www.reddit.com/submit?url=${enc(base + "&utm_platform=reddit")}&title=${enc(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(base + "&utm_platform=linkedin")}`,
      email:    `mailto:?subject=${enc(title)}&body=${enc(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${enc(title + " " + base + "&utm_platform=whatsapp")}`,
    };
  }, [url, title, media]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  };

  const IconWrap = ({ label, children }) => (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-100 transition" aria-label={label} title={label}>
      {children}
    </span>
  );

  const A = (props) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-block"
    />
  );

  return (
    <div className={`flex items-center gap-2 my-4 ${className}`}>
      <span className="text-sm font-medium pr-1">Share:</span>

      {/* Facebook */}
      <A href={share.facebook} aria-label="Share on Facebook">
        <IconWrap label="Facebook">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.495v-9.294H9.847V11.06h2.973V8.414c0-2.944 1.796-4.55 4.419-4.55 1.257 0 2.337.093 2.651.135v3.07h-1.82c-1.428 0-1.704.68-1.704 1.676v2.315h3.407l-.444 3.646h-2.963V24h5.81C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/></svg>
        </IconWrap>
      </A>

      {/* X (Twitter) */}
      <A href={share.x} aria-label="Share on X">
        <IconWrap label="X">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black"><path d="M18.244 2H21l-6.58 7.52L22.5 22h-6.24l-4.87-6.35L5.8 22H3l7.15-8.18L1.5 2h6.27l4.41 5.79L18.244 2zM6.56 4.11H4.95l11.96 15.78h1.64L6.56 4.11z"/></svg>
        </IconWrap>
      </A>

      {/* Pinterest */}
      <A href={share.pinterest} aria-label="Share on Pinterest">
        <IconWrap label="Pinterest">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#E60023]"><path d="M12.04 0C5.4 0 0 5.32 0 11.9c0 4.88 3.06 9.05 7.36 10.7-.1-.91-.2-2.3.05-3.3.22-.93 1.42-5.9 1.42-5.9s-.36-.73-.36-1.8c0-1.69.98-2.96 2.2-2.96 1.03 0 1.52.77 1.52 1.7 0 1.04-.66 2.61-1 4.06-.28 1.2.59 2.18 1.75 2.18 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.03-4.81-4.93-4.81-3.36 0-5.33 2.52-5.33 5.13 0 1.02.39 2.12.88 2.72.1.12.11.22.08.34-.09.37-.3 1.2-.35 1.36-.06.2-.19.24-.43.14-1.62-.75-2.64-3.1-2.64-4.99 0-4.07 2.96-7.81 8.53-7.81 4.48 0 7.97 3.2 7.97 7.47 0 4.45-2.81 8.02-6.71 8.02-1.31 0-2.55-.68-2.98-1.48 0 0-.66 2.53-.82 3.16-.25.95-.75 2.04-1.2 2.83.9.28 1.85.43 2.84.43 6.64 0 12.04-5.33 12.04-11.9C24.08 5.32 18.68 0 12.04 0z"/></svg>
        </IconWrap>
      </A>

      {/* Reddit */}
      <A href={share.reddit} aria-label="Share on Reddit">
        <IconWrap label="Reddit">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF4500]"><path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.34-2.78a1.44 1.44 0 00-1.42 1.77 7.12 7.12 0 00-3.23-.87l.55-2.59 1.8.38a1.05 1.05 0 101.1-.98 1.05 1.05 0 00-.96.64l-2.2-.46a.38.38 0 00-.45.28l-.68 3.2a7.67 7.67 0 00-3.4.9 1.45 1.45 0 10-1.58 2.39 3.9 3.9 0 00-.07.73c0 2.35 2.6 4.25 5.8 4.25 3.2 0 5.8-1.9 5.8-4.25 0-.25-.03-.5-.07-.73a1.45 1.45 0 10-1.15-2.27zM9.4 13.2a1.05 1.05 0 110-2.1 1.05 1.05 0 010 2.1zm5.2 0a1.05 1.05 0 110-2.1 1.05 1.05 0 010 2.1zM12 17.42c-1.03 0-1.97-.3-2.64-.8a.38.38 0 01.46-.6c.54.41 1.33.65 2.18.65.84 0 1.64-.24 2.17-.65a.38.38 0 01.46.6c-.67.5-1.6.8-2.63.8z"/></svg>
        </IconWrap>
      </A>

      {/* LinkedIn */}
      <A href={share.linkedin} aria-label="Share on LinkedIn">
        <IconWrap label="LinkedIn">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0A66C2]"><path d="M20.447 20.452h-3.554V14.86c0-1.333-.028-3.046-1.857-3.046-1.86 0-2.144 1.45-2.144 2.949v5.69h-3.553V9h3.414v1.561h.046c.476-.9 1.637-1.857 3.37-1.857 3.601 0 4.267 2.37 4.267 5.455v6.293zM5.337 7.433a2.064 2.064 0 11.001-4.128 2.064 2.064 0 01-.001 4.128zM6.999 20.452H3.67V9h3.329v11.452z"/></svg>
        </IconWrap>
      </A>

      {/* Email */}
      <A href={share.email} aria-label="Share via Email">
        <IconWrap label="Email">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-700"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </IconWrap>
      </A>

      {/* WhatsApp */}
      <A href={share.whatsapp} aria-label="Share on WhatsApp">
        <IconWrap label="WhatsApp">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]"><path d="M12.04 0C5.4 0 0 5.4 0 12.06c0 2.13.56 4.1 1.54 5.81L0 24l6.29-1.64a12 12 0 005.75 1.49c6.64 0 12.04-5.4 12.04-12.06C24.08 5.4 18.68 0 12.04 0zm6.93 17.39c-.3.86-1.48 1.58-2.04 1.68-.55.11-1.26.15-2.04-.13-.47-.16-1.07-.35-1.85-.68-3.26-1.41-5.4-4.73-5.56-4.95-.16-.22-1.33-1.77-1.33-3.38 0-1.61.83-2.4 1.12-2.72.3-.32.66-.4.88-.4.22 0 .44 0 .64.01.2.01.48-.08.75.57.3.72 1 2.49 1.1 2.67.09.18.15.4.03.62-.11.22-.17.36-.34.55-.17.2-.36.44-.52.6-.17.18-.35.37-.15.74.2.37.88 1.45 1.9 2.35 1.31 1.14 2.4 1.5 2.77 1.67.37.16.58.15.8-.09.22-.25.93-1.08 1.18-1.45.25-.37.5-.3.84-.18.35.12 2.2 1.03 2.58 1.22.38.2.63.28.72.44.1.15.1.87-.2 1.73z"/></svg>
        </IconWrap>
      </A>

      {/* Copy link */}
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-gray-200 hover:bg-gray-100 transition text-sm"
        aria-label="Copy link"
        title="Copy link"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-700"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14h13c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
