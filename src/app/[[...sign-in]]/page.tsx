"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      console.log('=== DEBUG INFO ===');
      console.log('User object:', user);
      console.log('User ID:', user.id);
      console.log('User username:', user.username);
      console.log('User publicMetadata:', user.publicMetadata);
      console.log('==================');

             // Wait a bit for session to fully load
       const redirectWithRole = () => {
         // Use selected role from the form
         const role = selectedRole;
         
         console.log('Selected role:', role);
         console.log('Redirecting to:', `/${role}`);
         router.push(`/${role}`);
       };

      // Try immediate redirect
      redirectWithRole();
      
      // Also try after a short delay to ensure session is fully loaded
      setTimeout(redirectWithRole, 1000);
    }
  }, [user, router, isSignedIn, isLoaded]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Glass Effect Login Page - Blue.png')`
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/20"></div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <h1 className="text-xl font-bold text-white">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  // If user is signed in, show loading while redirecting
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Glass Effect Login Page - Blue.png')`
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/20"></div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center">
            <div className="animate-pulse rounded-full h-12 w-12 bg-green-400/30 flex items-center justify-center mb-4 border border-green-400/50">
              <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Welcome!</h1>
            <p className="text-white/80 text-center mt-2">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in form if not signed in
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
        
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg-blue-700/1 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-4"
          >
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2  backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
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

                         <Clerk.GlobalError className="text-sm text-red-400 bg-red-500/20 p-3 rounded-xl border border-red-400/30" />
             
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
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedRole === role.value
                          ? 'border-white/70 bg-white/20 text-white'
                          : 'border-white/30 bg-transparent text-white/70 hover:border-white/50 hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>
             </div>
             
             {/* Email Field */}
             <Clerk.Field name="identifier" className="relative">
              <Clerk.Input
                type="text"
                required
                className="peer w-full p-4 pt-6 rounded-xl bg-transparent border-2 border-white/30 focus:border-white/70 focus:ring-0 transition-all duration-200 outline-none text-white placeholder-transparent"
                placeholder="Email"
              />
              <Clerk.Label className="absolute left-4 top-2 text-xs font-medium text-white/70 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-white/90">
                UserId
              </Clerk.Label>
              <Clerk.FieldError className="text-sm text-red-400 bg-red-500/20 p-2 rounded-lg mt-1" />
            </Clerk.Field>

            {/* Password Field */}
            <Clerk.Field name="password" className="relative">
              <Clerk.Input
                type={showPassword ? "text" : "password"}
                required
                className="peer w-full p-4 pt-6 pr-12 rounded-xl bg-transparent border-2 border-white/30 focus:border-white/70 focus:ring-0 transition-all duration-200 outline-none text-white placeholder-transparent"
                placeholder="Password"
              />
              <Clerk.Label className="absolute left-4 top-2 text-xs font-medium text-white/70 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-white/90">
                Password
              </Clerk.Label>
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
              <Clerk.FieldError className="text-sm text-red-400 p-2 rounded-lg mt-1" />
            </Clerk.Field>

            {/* Forgot Password */}
            <div className="text-right -mt-1">
              <a href="#" className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <SignIn.Action
              submit
              className="w-full bg-blue-900/80 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] border border-blue-800/50"
            >
              Sign in
            </SignIn.Action>



          </SignIn.Step>
        </SignIn.Root>
      </div>
    </div>
  );
};

export default LoginPage;
