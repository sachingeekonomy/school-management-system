"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

const LogoutPage = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    username: string;
    profileImage: string | null;
  } | null>(null);

  // Fetch user data from session
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

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/sign-in');
      } else {
        toast.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error('An error occurred during logout');
      setIsLoggingOut(false);
    }
  }, [router]);

  const handleCancel = () => {
    router.back(); // Go back to previous page
  };

  // Auto-logout if user clicks logout from menu (immediate logout)
  useEffect(() => {
    // Check if this is coming from a direct logout intent
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto') === 'true') {
      handleLogout();
    }
  }, [handleLogout]);

  return (
    <div className="flex-1 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Image
            src="/logout.png"
            alt="Logout"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Confirm Logout
          </h1>
          <p className="text-gray-600">
            Are you sure you want to sign out of your account?
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src={userData?.profileImage || "/noAvatar.png"}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="font-medium text-gray-800 text-center">
                {userData ? `${userData.firstName}` : "User Account"}
              </p>
              <p className="text-sm text-gray-500">
                School Management System
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            disabled={isLoggingOut}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing Out...
              </>
            ) : (
              "Sign Out"
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          You&apos;ll be redirected to the login page after signing out.
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
