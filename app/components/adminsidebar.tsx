"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Financials", href: "/admin/financials" },
    { name: "Workers", href: "/admin/workers" },
    { name: "Initial Birds Record", href: "/admin/birds" },
  ];

  return (
    <div className="w-[15%] h-screen bg-gray-800 text-white flex flex-col fixed ">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`block px-4 py-2 text-lg rounded-lg transition ${
                  pathname === item.href
                    ? "bg-gray-700"
                    : "hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
