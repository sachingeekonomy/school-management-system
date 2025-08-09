"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type FilterOption = {
  value: string;
  label: string;
  param: string;
};

type FilterGroup = {
  title: string;
  param: string;
  options: FilterOption[];
  multiSelect?: boolean;
};

type FilterDropdownProps = {
  groups: FilterGroup[];
};

const FilterDropdown = ({ groups }: FilterDropdownProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get active filters count
  const activeFilters = groups.reduce((count, group) => {
    const value = searchParams.get(group.param);
    return value ? count + 1 : count;
  }, 0);

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

  const handleFilter = (group: FilterGroup, option: FilterOption) => {
    const params = new URLSearchParams(window.location.search);
    const currentValue = searchParams.get(group.param);
    
    if (currentValue === option.value) {
      // If clicking the same option, remove filter
      params.delete(group.param);
    } else {
      // Set new filter
      params.set(group.param, option.value);
    }
    
    // Reset to page 1 when filtering
    params.delete("page");
    
    router.push(`${window.location.pathname}?${params}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(window.location.search);
    
    // Remove all filter parameters
    groups.forEach((group) => {
      params.delete(group.param);
    });
    
    // Reset to page 1
    params.delete("page");
    
    router.push(`${window.location.pathname}?${params}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors relative ${
          activeFilters > 0 ? "bg-lamaPurple text-white" : "bg-lamaYellow"
        }`}
        title={activeFilters > 0 ? `${activeFilters} filter(s) active` : "Filter"}
      >
        <Image src="/filter.png" alt="Filter" width={14} height={14} />
        {activeFilters > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {activeFilters}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[220px] max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-xs font-medium text-gray-500">Filters</span>
              {activeFilters > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              )}
            </div>

            {groups.map((group, groupIndex) => (
              <div key={group.param} className={groupIndex > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}>
                <div className="text-xs font-medium text-gray-600 px-2 py-1 mb-1">
                  {group.title}
                </div>
                
                {group.options.map((option) => {
                  const isActive = searchParams.get(group.param) === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilter(group, option)}
                      className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${
                        isActive
                          ? "bg-lamaPurpleLight text-lamaPurple font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isActive && (
                        <span className="text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
