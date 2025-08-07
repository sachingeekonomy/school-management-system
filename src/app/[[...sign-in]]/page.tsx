"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();

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
        // First try to get role from publicMetadata
        let role = user?.publicMetadata?.role;
        
        // If no role in metadata, determine from username as fallback
        if (!role) {
          const username = user?.username?.toLowerCase();
          role = 'admin'; // default
          
          if (username?.includes('teacher')) {
            role = 'teacher';
          } else if (username?.includes('student')) {
            role = 'student';
          } else if (username?.includes('parent')) {
            role = 'parent';
          }
        }

        console.log('User role from metadata:', user?.publicMetadata?.role);
        console.log('Determined role:', role);
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
      <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
        <div className="bg-white p-8 rounded-md shadow-2xl">
          <h1 className="text-xl font-bold text-center">Loading...</h1>
        </div>
      </div>
    );
  }

  // If user is signed in, show loading while redirecting
  if (isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
        <div className="bg-white p-8 rounded-md shadow-2xl">
          <h1 className="text-xl font-bold text-center">Loading...</h1>
          <p className="text-gray-500 text-center mt-2">Redirecting to your dashboard</p>
        </div>
      </div>
    );
  }

  // Show sign-in form if not signed in
  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooLama
          </h1>
          <h2 className="text-gray-400">Sign in to your account</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <SignIn.Action
            submit
            className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;
