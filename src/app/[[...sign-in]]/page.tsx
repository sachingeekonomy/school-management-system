"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // User is already logged in, redirect to their dashboard
            router.push(`/${data.user.role}`);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log("Data>>", username, password, selectedRole);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: selectedRole
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message with user details
        const successMessage = data.user ? 
          `Welcome back, ${data.user.name || data.user.username}!` : 
          'Login successful!';
        toast.success(successMessage);
        
        // Small delay to show the success message before redirecting
        setTimeout(() => {
          router.push(`/${selectedRole}`);
        }, 1000);
      } else {
        // Show specific error message from API
        const errorMessage = data.error || data.message || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.');
      } else if (error instanceof Error) {
        toast.error(`Login error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Glass Effect Login Page - Blue.png')`
        }}
      />

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-blue-900/20"></div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-blue-700/1 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-4">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
                <Image src="/logo.png" alt="" width={28} height={28} className="rounded-full" />
              </div>
              <h1 className="text-white text-xl md:text-2xl font-bold">
                FutureScholars
              </h1>
            </div>
            <h2 className="text-white/90 text-lg font-medium mb-4">
              Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">Login as:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'admin', label: 'Admin' },
                  { value: 'teacher', label: 'Teacher' },
                  { value: 'student', label: 'Student' },
                  { value: 'parent', label: 'Parent' }
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${selectedRole === role.value
                        ? 'border-white/70 bg-white/20 text-white'
                        : 'border-white/30 bg-transparent text-white/70 hover:border-white/50 hover:text-white'
                      }`}
                  >
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Username Field */}
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="peer w-full p-4 pt-6 rounded-xl bg-transparent border-2 border-white/30 focus:border-white/70 focus:ring-0 transition-all duration-200 outline-none text-white placeholder-transparent"
                placeholder="Username"
              />
              <label className="absolute left-4 top-2 text-xs font-medium text-white/70 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-white/90">
                Username
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full p-4 pt-6 pr-12 rounded-xl bg-transparent border-2 border-white/30 focus:border-white/70 focus:ring-0 transition-all duration-200 outline-none text-white placeholder-transparent"
                placeholder="Password"
              />
              <label className="absolute left-4 top-2 text-xs font-medium text-white/70 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-white/90">
                Password
              </label>
              {/* Show/Hide Password Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right -mt-1">
              <a href="#" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900/80 hover:bg-blue-900 disabled:bg-blue-900/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] border border-blue-800/50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
