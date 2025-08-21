// components/SearchBox.jsx
import { useRouter } from "next/router";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        className="h-9 w-48 md:w-64 border rounded px-3 text-sm"
        aria-label="Search"
      />
      <button
        type="submit"
        className="h-9 px-3 border rounded text-sm bg-gray-50 hover:bg-orange-100"
      >
        Search
      </button>
    </form>
  );
}
