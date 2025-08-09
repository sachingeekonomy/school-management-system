"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type SortOption = {
  value: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
};

type SortDropdownProps = {
  options: SortOption[];
};

const SortDropdown = ({ options }: SortDropdownProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current sort from URL
  const currentSort = searchParams.get("sort");
  const currentOrder = searchParams.get("order") || "asc";
  
  const currentOption = options.find(
    (option) => option.field === currentSort && option.direction === currentOrder
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSort = (option: SortOption) => {
    const params = new URLSearchParams(window.location.search);
    
    if (option.field === currentSort && option.direction === currentOrder) {
      // If clicking the same option, remove sort
      params.delete("sort");
      params.delete("order");
    } else {
      // Set new sort
      params.set("sort", option.field);
      params.set("order", option.direction);
    }
    
    // Reset to page 1 when sorting
    params.delete("page");
    
    router.push(`${window.location.pathname}?${params}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
          currentOption ? "bg-lamaPurple text-white" : "bg-lamaYellow"
        }`}
        title={currentOption ? `Sorted by ${currentOption.label}` : "Sort"}
      >
        <Image src="/sort.png" alt="Sort" width={14} height={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">Sort by</div>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option)}
                className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${
                  currentOption?.value === option.value
                    ? "bg-lamaPurpleLight text-lamaPurple font-medium"
                    : "text-gray-700"
                }`}
              >
                <span>{option.label}</span>
                {currentOption?.value === option.value && (
                  <span className="text-xs">✓</span>
                )}
              </button>
            ))}
            {currentOption && (
              <>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete("sort");
                    params.delete("order");
                    params.delete("page");
                    router.push(`${window.location.pathname}?${params}`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Clear sort
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
