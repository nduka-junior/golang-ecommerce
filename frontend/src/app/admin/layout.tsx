import { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-indigo-600">
                Admin Dashboard
              </Link>
            </div>
            <div className="space-x-6">
              <Link
                href="/admin/products"
                className="text-gray-700 hover:text-indigo-600"
              >
                Products
              </Link>
              <Link
                href="/admin/dashboard"
                className="text-gray-700 hover:text-indigo-600"
              >
                Dashboard
              </Link>
              <button className="text-red-600 hover:text-red-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
