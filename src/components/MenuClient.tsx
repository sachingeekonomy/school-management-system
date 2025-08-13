"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  visible: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface UserData {
  firstName: string;
  email: string;
  initial: string;
}

interface MenuClientProps {
  menuItems: MenuSection[];
  role: string;
  userData: UserData;
}

const MenuClient = ({ menuItems, role, userData }: MenuClientProps) => {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if it's mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Debug logging
  console.log("Current pathname:", pathname);
  console.log("Is mobile:", isMobile);
  
  return (
    <div className="flex flex-col gap-2 lg:gap-6 mt-2 lg:mt-6 relative">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-3" key={section.title}>
          {/* Section Header - Only on Desktop */}
          <div className="px-2 lg:px-4">
            <span className="hidden lg:block text-xs font-semibold text-white/70 uppercase tracking-wider  px-3 py-1 rounded-lg">
              {section.title}
            </span>
          </div>
          
          {/* Menu Items */}
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              if (item.visible.includes(role)) {
                // Improved active detection logic
                const isActive = 
                  pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href)) ||
                  (item.href === "/" && (pathname === "/" || pathname === "/admin"));
                
                console.log(`Menu item ${item.label}:`, { href: item.href, pathname, isActive });
                
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    className={`group relative flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-2 lg:px-4 py-3 mx-1 lg:mx-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg ${
                      isActive 
                        ? "text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg border border-blue-300/30" 
                        : "text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                    }`}
                    onMouseEnter={() => !isMobile && setShowTooltip(item.label)}
                    onMouseLeave={() => !isMobile && setShowTooltip(null)}
                    onTouchStart={() => isMobile && setShowTooltip(item.label)}
                    onTouchEnd={() => isMobile && setTimeout(() => setShowTooltip(null), 2000)}
                    title={item.label} // Fallback tooltip for mobile
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                    )}
                    
                    {/* Icon Container */}
                    <div className={`flex items-center justify-center w-8 h-8 lg:w-8 lg:h-8 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-white/20 shadow-lg backdrop-blur-sm" 
                        : "bg-white/5 group-hover:bg-white/20 group-hover:shadow-md"
                    }`}>
                      <Image 
                        src={item.icon} 
                        alt={item.label} 
                        width={16} 
                        height={16}
                        className={`transition-all duration-300 ${
                          isActive 
                            ? "scale-110 brightness-0 invert" 
                            : "brightness-0 invert opacity-80 group-hover:scale-110 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                    
                    {/* Label - Desktop Only */}
                    <span className={`hidden lg:block text-sm transition-all duration-300 ${
                      isActive 
                        ? "font-bold text-white" 
                        : "font-medium group-hover:font-semibold"
                    }`}>
                      {item.label}
                    </span>

                    {/* Mobile Tooltip for detailed view */}
                    {showTooltip === item.label && isMobile && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-white/20">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/20"></div>
                      </div>
                    )}
                
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
      
      {/* Bottom Spacing */}
      <div className="flex-1"></div>
      
      {/* Enhanced User Info Section */}
      <div className="px-4 py-3 mt-6">
    
      </div>
    </div>
  );
};

export default MenuClient;
