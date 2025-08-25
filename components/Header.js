// components/Header.js
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import SearchBox from "./SearchBox";

const MENU_W = 224; // Tailwind w-56 (14rem)

export default function Header() {
  const [mounted, setMounted] = useState(false);

  // Categories (right) menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Mobile search panel state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTop, setSearchTop] = useState(0);

  const headerRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // ---- Position Categories portal
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

  // ---- Global listeners
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

  // initial mobile search offset
  useEffect(() => {
    if (!headerRef.current) return;
    setSearchTop(headerRef.current.getBoundingClientRect().bottom);
  }, []);

  // lock body scroll when mobile search is open
  useEffect(() => {
    if (!mounted) return;
    if (searchOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
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
    // FULL‑BLEED WRAPPER: make the header span the viewport even if it's
    // rendered inside a centered container.
    <header
      ref={headerRef}
      className="
        relative z-40 bg-white border-b shadow-md
        w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
      "
    >
      {/* Inner content with padding */}
      <div className="px-4 md:px-6 py-3">
        {/* GRID: logo-left | search-center | categories-right */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center w-full">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" aria-label="DIY HQ Home" className="block">
              <Image
                src="/images/logo/DIY_HQ_Logo_WhiteBackground.jpg"
                alt="DIY HQ Logo"
                width={160}
                height={80}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex justify-center w-full">
            <div className="w-full max-w-xl">
              <SearchBox />
            </div>
          </div>

          {/* Right: Categories (flush to right padding) */}
          <div className="justify-self-end">
            <button
              ref={menuBtnRef}
              onClick={toggleMenu}
              className="flex items-center gap-2 text-gray-800 hover:text-orange-600 font-semibold text-lg"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="site-categories-menu"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span>Categories</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories dropdown (portal, overlaps all) */}
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

      {/* Mobile search panel (beneath header). 
         NOTE: you'll need a button somewhere (e.g., a left search icon) to call setSearchOpen(true)
         if you want to use this panel on mobile. */}
      {mounted && searchOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/30 z-[90]"
              onClick={() => setSearchOpen(false)}
            />
            <div
              className="fixed left-0 right-0 z-[95] bg-white border-b shadow-md p-3"
              style={{ top: `${searchTop}px` }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBox />
                </div>
                <button
                  aria-label="Close search"
                  className="inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100"
                  onClick={() => setSearchOpen(false)}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
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
