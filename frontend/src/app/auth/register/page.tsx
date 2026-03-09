// app/auth/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleRegister = async (email: string, password: string) => {
    try {
      await api.post("/register", { email, password });
      router.push("/auth/login");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to existing account
            </a>
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <AuthForm type="register" onSubmit={handleRegister} />
      </div>
    </div>
  );
}
