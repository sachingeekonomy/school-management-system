"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TableSearchProps {
  placeholder?: string;
  searchFields?: string[];
}

const TableSearch = ({ 
  placeholder = "Search...", 
  searchFields = ["name", "email", "username", "phone"] 
}: TableSearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState("");

  // Get current search value from URL
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setSearchValue(currentSearch);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;

    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    // Reset to page 1 when searching
    params.delete("page");
    router.push(`${window.location.pathname}?${params}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.delete("page");
    router.push(`${window.location.pathname}?${params}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative w-full md:w-auto">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 bg-white hover:ring-2 hover:ring-blue-300 transition-all"
      >
        <Image src="/search.png" alt="Search" width={14} height={14} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-[200px] p-2 bg-transparent outline-none"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            ×
          </button>
        )}
      </form>
      
      {/* Search hint */}
      {searchValue && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
          Searching in: {searchFields.join(", ")}
        </div>
      )}
    </div>
  );
};

export default TableSearch;
