"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react"; // If using NextAuth.js

export default function WorkerNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // If you're using NextAuth.js
      await signOut({ redirect: false }); // Prevent auto-redirect

      // Redirect to the login page or any page after logout
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <header className="bg-white shadow p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Poultry Management System</h1>
        <button
          className="text-blue-500 hover:text-blue-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
