// components/AdSlot.jsx
import { useEffect } from 'react';

/**
 * Generic AdSense slot
 * - slot: required numeric ad-slot (from AdSense ad unit) — for Auto ads, leave out and AdSense will place automatically
 * - format: "auto" (Display), or "fluid" (In-article)
 * - style: provide minHeight to avoid CLS (e.g., 90px for top banner)
 */
export default function AdSlot({
  slot,                           // e.g., "1234567890"
  format = 'auto',                // 'auto' (Display) or 'fluid' (In-article)
  responsive = 'true',            // 'true' enables responsive auto-sizing
  layoutKey,                      // required only for some "fluid" formats AdSense gives you
  style,                          // { display:'block', minHeight: 90 }
  className,
}) {
  useEffect(() => {
    try {
      // Ask AdSense to render this slot
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // no-op
    }
  }, []);

  const isProd = process.env.NODE_ENV === 'production';

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}
      {...(slot ? { 'data-ad-slot': slot } : {})}
      data-ad-format={format}
      data-full-width-responsive={responsive}
      {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      {...(!isProd ? { 'data-adtest': 'on' } : {})} // test mode on localhost/preview
    />
  );
}
