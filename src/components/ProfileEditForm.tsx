"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileEditFormProps {
  userData: any;
  role: string;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ userData, role }) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bloodType: "",
    birthday: "",
  });

  // Initialize form data when component loads
  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData?.name || "",
        lastName: userData?.surname || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        bloodType: userData?.bloodType || "",
        birthday: userData?.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUpdating(true);
    setMessage("");

    try {
      // Update user data via API
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
        
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(`Error updating profile: ${errorData.error}`);
      }

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Image src="/setting.png" alt="Settings" width={24} height={24} />
        <h2 className="text-lg font-semibold">Edit Profile</h2>
      </div>

      {/* Profile Picture Section */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-md font-semibold mb-3">Profile Picture</h3>
        <div className="flex items-center gap-4">
          <Image
            src={userData?.imageUrl || "/noAvatar.png"}
            alt="Profile"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-gray-600 mb-2">
              To change your profile picture, please visit your Clerk user profile.
            </p>
            <button
              onClick={() => window.location.href = `/user-profile`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Manage Profile
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
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

        <div>
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

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfileEditForm;
