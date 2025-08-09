"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  
  // Debug logging
  console.log("Current pathname:", pathname);
  
  return (
    <div className="flex flex-col gap-6 mt-6">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-3" key={section.title}>
          {/* Section Header */}
          <div className="px-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                    className={`group relative flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg ${
                      isActive 
                        ? "text-lamaSky bg-gradient-to-r from-lamaSkyLight to-blue-50 shadow-md border border-lamaSky/20" 
                        : "text-gray-600 hover:text-lamaSky hover:bg-lamaSkyLight"
                    }`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-lamaSky rounded-r-full"></div>
                    )}
                    
                    {/* Icon Container */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-lamaSky shadow-lg" 
                        : "bg-gray-100 group-hover:bg-lamaSky group-hover:shadow-md"
                    }`}>
                      <Image 
                        src={item.icon} 
                        alt={item.label} 
                        width={16} 
                        height={16}
                        className={`transition-all duration-300 ${
                          isActive 
                            ? "scale-110 brightness-0 invert" 
                            : "group-hover:scale-110"
                        }`}
                      />
                    </div>
                    
                    {/* Label */}
                    <span className={`hidden lg:block text-sm transition-all duration-300 ${
                      isActive 
                        ? "font-bold text-lamaSky" 
                        : "font-medium group-hover:font-semibold"
                    }`}>
                      {item.label}
                    </span>
                
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
        <div className="group bg-gradient-to-r from-lamaSkyLight via-blue-50 to-lamaPurpleLight rounded-2xl border border-lamaSky/20 p-4 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-lamaSky to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">
                {userData.initial}
              </span>
            </div>
            <div className="hidden lg:block flex-1">
              <p className="text-sm font-bold text-gray-800">
                {userData.firstName}
              </p>
              <p className="text-xs text-gray-600 capitalize font-medium">
                {role || "User"}
              </p>
            </div>
         
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuClient;
