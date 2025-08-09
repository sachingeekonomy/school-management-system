"use client";

import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, Bell, MessageSquare, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);

  // Close mobile menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* SEARCH BAR */}
        <div className="hidden md:flex flex-1 max-w-md">
          <form onSubmit={handleSearch} className="w-full">
            <div
              className={`flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border-2 transition-all duration-200 ${
                isSearchFocused
                  ? "border-blue-500 bg-white shadow-sm"
                  : "border-transparent hover:bg-gray-100"
              }`}
            >
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, teachers, classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 text-gray-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ICONS AND USER */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile Search Icon */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Messages */}
          <div className="relative group">
            <button className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 group-hover:scale-105">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {messageCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-medium animate-pulse">
                  {messageCount}
                </div>
              )}
            </button>
          </div>

          {/* Notifications */}
          <div className="relative group">
            <button className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-200 group-hover:scale-105">
              <Bell className="w-5 h-5 text-purple-600" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-medium animate-pulse">
                  {notificationCount}
                </div>
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {(user?.publicMetadata?.role as string) || "User"}
              </span>
            </div>
            <div className="relative">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors",
                    userButtonPopoverCard: "shadow-lg border border-gray-200",
                    userButtonPopoverActions: "bg-gray-50"
                  }
                }}
              />
            </div>
          </div>

          {/* Mobile User Button */}
          <div className="sm:hidden">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-lg border-2 border-gray-200"
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Navbar;
