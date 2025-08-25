// components/Header.js
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import SearchBox from "./SearchBox";

const MENU_W = 224; // Tailwind w-56 = 14rem

export default function Header() {
  const [mounted, setMounted] = useState(false);

  // Categories menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Mobile search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTop, setSearchTop] = useState(0);

  const headerRef = useRef(null);
  useEffect(() => setMounted(true), []);

  // Position categories menu (portal)
  function calcMenuPosition() {
    if (!menuBtnRef.current || typeof window === "undefined") return;
    const rect = menuBtnRef.current.getBoundingClientRect();
    const gap = 8;
    const left = Math.min(
      Math.max(8, rect.right - MENU_W),
      window.innerWidth - MENU_W - 8
    );
    const top = rect.bottom + gap;
    setMenuPos({ top, left });
  }
  const toggleMenu = () => {
    setMenuOpen((v) => {
      const next = !v;
      if (next) calcMenuPosition();
      return next;
    });
  };

  // Listeners
  useEffect(() => {
    const onDocClick = (e) => {
      const menuEl = menuRef.current;
      const btnEl = menuBtnRef.current;
      if (menuOpen && menuEl && btnEl) {
        if (!menuEl.contains(e.target) && !btnEl.contains(e.target)) {
          setMenuOpen(false);
        }
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    const onScrollResize = () => {
      if (menuOpen) calcMenuPosition();
      if (headerRef.current) {
        const r = headerRef.current.getBoundingClientRect();
        setSearchTop(r.bottom);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [menuOpen]);

  // Initial mobile search offset
  useEffect(() => {
    if (!headerRef.current) return;
    setSearchTop(headerRef.current.getBoundingClientRect().bottom);
  }, []);

  // Lock body scroll when mobile search open
  useEffect(() => {
    if (!mounted) return;
    if (searchOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [searchOpen, mounted]);

  const categories = [
    { title: "Home Repair", path: "/category/home-repair" },
    { title: "Tools & Gear", path: "/category/tools-gear" },
    { title: "Renovation", path: "/category/renovation" },
    { title: "Yard & Garden", path: "/category/yard-garden" },
    { title: "Smart Home", path: "/category/smart-home" },
    { title: "Beginner Guides", path: "/category/beginner-guides" },
    { title: "Automotive", path: "/category/automotive" },
    { title: "Cleaning", path: "/category/cleaning" },
    { title: "Organization", path: "/category/organization" },
    { title: "Side Hustles", path: "/category/side-hustles" },
  ];

  return (
    <header
      ref={headerRef}
      className="relative z-40 bg-white border-b shadow-md px-4 md:px-6 py-3"
    >
      {/* Single responsive bar (no separate mobile/desktop bars) */}
      <div className="grid grid-cols-3 items-center">
        {/* Left: mobile search icon (hidden on md+) */}
        <div className="justify-self-start">
          <button
            className="inline-flex md:hidden items-center justify-center h-9 w-9 rounded hover:bg-gray-100 text-gray-800"
            aria-label="Open search"
            onClick={() => setSearchOpen(true)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Center: logo (always centered) */}
        <div className="justify-self-center">
          <Link href="/" aria-label="DIY HQ Home" className="block">
            <Image
              src="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg"
              alt="DIY HQ Logo"
              width={180}
              height={90}
              priority
              className="object-contain"
            />
          </Link>
        </div>

        {/* Right: desktop search + categories */}
        <div className="justify-self-end flex items-center gap-3 min-w-0">
          <div className="hidden md:block min-w-0">
            {/* keep desktop search from ballooning */}
            <div className="w-full max-w-xl">
              <SearchBox />
            </div>
          </div>

          <button
            ref={menuBtnRef}
            onClick={toggleMenu}
            className="flex items-center gap-2 text-gray-800 hover:text-orange-600 font-semibold text-lg"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="site-categories-menu"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* Portals: Categories menu */}
      {mounted && menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            id="site-categories-menu"
            role="menu"
            className="fixed z-[100] w-56 bg-white border shadow-lg rounded-md py-2 max-h-[75vh] overflow-y-auto"
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.path}
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-orange-100"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                {cat.title}
              </Link>
            ))}
          </div>,
          document.body
        )}

      {/* Portals: Mobile search panel (below the header) */}
      {mounted && searchOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 bg-black/30 z-[90]" onClick={() => setSearchOpen(false)} />
            <div className="fixed left-0 right-0 z-[95] bg-white border-b shadow-md p-3" style={{ top: `${searchTop}px` }}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBox />
                </div>
                <button
                  aria-label="Close search"
                  className="inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100"
                  onClick={() => setSearchOpen(false)}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
