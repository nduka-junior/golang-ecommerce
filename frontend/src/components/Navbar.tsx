"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optional: fetch user profile
      api
        .get("/profile")
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Shop
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/products"
              className="text-gray-700 hover:text-indigo-600"
            >
              Products
            </Link>

            <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
              Cart
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
