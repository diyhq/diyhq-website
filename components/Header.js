// components/Header.js
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import SearchBox from "./SearchBox";

const MENU_W = 224; // Tailwind w-56 = 14rem = 224px

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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

  useEffect(() => setMounted(true), []);

  const openMenu = () => {
    setIsOpen((v) => {
      const next = !v;
      if (next) calcMenuPosition();
      return next;
    });
  };

  function calcMenuPosition() {
    if (!buttonRef.current || typeof window === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    const gap = 8; // px between button and menu
    const left = Math.min(
      Math.max(8, rect.right - MENU_W), // keep menu inside viewport
      window.innerWidth - MENU_W - 8
    );
    const top = rect.bottom + gap;
    setMenuPos({ top, left });
  }

  // Close on outside click / ESC; keep open when clicking inside.
  useEffect(() => {
    if (!isOpen) return;

    const onDocMouseDown = (e) => {
      const menuEl = menuRef.current;
      const btnEl = buttonRef.current;
      if (!menuEl || !btnEl) return;

      if (menuEl.contains(e.target) || btnEl.contains(e.target)) return;
      setIsOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const onScrollOrResize = () => calcMenuPosition();

    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen]);

  return (
    <header className="bg-white border-b shadow-md px-6 py-4 relative">
      {/* 3-column layout */}
      <div className="grid grid-cols-3 items-center">
        {/* Left spacer (keeps layout balanced) */}
        <div className="col-span-1" />

        {/* Center: Logo */}
        <div className="col-span-1 flex justify-center">
          <Link href="/" aria-label="DIY HQ Home">
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

        {/* Right: Search (centered within the right third) + Categories button */}
        <div className="col-span-1 relative flex items-center justify-end gap-3">
          {/* On desktop, center the search within the right third, but keep below z-index of menu */}
          <div className="hidden md:flex flex-1 justify-center z-[20]">
            <div className="w-full max-w-[480px]">
              <SearchBox />
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={openMenu}
            className="flex items-center gap-2 text-gray-800 hover:text-orange-600 font-semibold text-lg z-[30]"
            aria-haspopup="menu"
            aria-expanded={isOpen}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* Dropdown menu via PORTAL: never clipped by header/search; always on top */}
      {mounted &&
        isOpen &&
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
                onClick={() => setIsOpen(false)}
              >
                {cat.title}
              </Link>
            ))}
          </div>,
          document.body
        )}
    </header>
  );
}
