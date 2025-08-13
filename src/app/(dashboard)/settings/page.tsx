"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";

const SettingsPage = () => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Fetch user data from our custom API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
          setFormData({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsUpdating(true);
    setMessage("");

    try {
      // For demo purposes, we'll just show a success message
      // In a real app, you would make an API call to update the user data
      toast.success("Profile updated successfully!");
      setMessage("Profile updated successfully!");
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage(`Error updating profile: ${error.message}`);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = () => {
    toast("Password change functionality would be implemented here");
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Image src="/setting.png" alt="Settings" width={32} height={32} />
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        </div>

        {/* Profile Picture Section */}
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <Image
              src="/noAvatar.png"
              alt="Profile"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Profile picture management will be available in future updates.
              </p>
              <button
                onClick={handleChangePassword}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Manage Profile
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Changing your email will require verification
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Account Information */}
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span>{userData?.username || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name:</span>
              <span>{userData?.firstName} {userData?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="capitalize">{userData?.role || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="text-xs">{userData?.id || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
