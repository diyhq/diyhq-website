// components/Header.js
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBox from "./SearchBox";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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

  const toggleMenu = () => setIsOpen((v) => !v);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleEsc(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header className="bg-white border-b shadow-md px-6 py-4 flex items-center justify-between relative overflow-visible">
      {/* Left spacer */}
      <div className="w-1/3" />

      {/* Center: Logo */}
      <div className="w-1/3 flex justify-center">
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

      {/* Right: Search + Categories */}
      <div className="w-1/3 flex items-center justify-end gap-3 relative">
        <SearchBox />

        <button
          onClick={toggleMenu}
          className="flex items-center gap-2 text-gray-800 hover:text-orange-600 font-semibold text-lg z-10"
          aria-haspopup="menu"
          aria-expanded={isOpen}
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

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full translate-y-2 w-56 bg-white border shadow-lg rounded-md py-2 z-[60] max-h-[70vh] overflow-y-auto"
            role="menu"
          >
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.path}
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-orange-100"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
