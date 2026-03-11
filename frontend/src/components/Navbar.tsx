"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShoppingCart, UserCircle, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface User {
  user_id: number;
  email: string | null;
  role?: string; // "user" or "admin"
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/profile")
      .then((res) => {
        console.log("Profile response:", res.data);
        setUser(res.data); // expects { user_id, email, role? }
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        localStorage.removeItem("token");
        toast.error("Session expired", {
          description: "Please log in again.",
        });
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Shop
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Products
            </Link>

            {isAuthenticated && (
              <Link
                href="/cart"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
              >
                <ShoppingCart className="h-5 w-5" />
                Cart
              </Link>
            )}

            {/* Admin Panel link – only for admins */}
            {isAdmin && (
              <Link
                href="/admin/products"
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="h-5 w-5" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Auth / User Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4 md:space-x-6">
                {/* User info */}
                <div className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 hidden md:inline">
                    {user?.email ? user.email.split("@")[0] : "User"}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Login
                </Link>
                <Button asChild variant="default" size="sm">
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
