"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, Bell, MessageSquare, Menu, X, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    username: string;
  } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get user data from session
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/sign-in');
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
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
                {userData?.firstName} {userData?.lastName}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {userData?.role || "User"}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors bg-gray-100 flex items-center justify-center"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile User Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center"
            >
              <User className="w-4 h-4 text-gray-600" />
            </button>
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

      {/* Mobile User Menu */}
      {showUserMenu && (
        <div className="sm:hidden border-t border-gray-100 bg-white p-4">
          <div className="space-y-2">
            <button
              onClick={() => {
                router.push('/profile');
                setShowUserMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => {
                handleLogout();
                setShowUserMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
