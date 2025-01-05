"use client";

import AdminSidebar from "../components/adminsidebar";
import Navbar from "../components/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-[15%]">
        {/* Navbar */}
        <Navbar />
        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
