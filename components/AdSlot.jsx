'use client';
import { useEffect, useRef } from 'react';

export default function AdSlot({
  slot,                  // required (your numeric slot id)
  format = 'auto',       // 'auto' for display, 'fluid' for in-article
  layout,                // 'in-article' for in-article units
  style,
  className,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = el.getAttribute('data-adsbygoogle-status') === 'done';
    if (done) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
      data-ad-slot={slot}
      {...(layout ? { 'data-ad-layout': layout } : {})}
      {...(format ? { 'data-ad-format': format } : {})}
      data-full-width-responsive="true"
    />
  );
}
