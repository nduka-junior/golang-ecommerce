"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProductRow from "@/components/ProductRow";
import { isAdmin, isAuthenticated } from "@/lib/auth";

export interface Product {
  ID: number;
  Name: string;
  Slug: string;
  Price: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // 1. Role-based protection (client-side)
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth/login");
      return;
    }

    if (!isAdmin()) {
      toast.error("Access denied", {
        description: "This page is for administrators only.",
      });
      router.replace("/");
    }
  }, [router]);

  // 2. Fetch products (only once)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/products");
        setProducts(res.data.products || []);
      } catch (err: any) {
        const msg = err.response?.data?.error || "Failed to load products";
        setError(msg);
        toast.error("Error", { description: msg });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 3. Handle delete (optimistic + refresh)
  const handleDelete = async (productId: number) => {
    // Optimistic update: remove from UI immediately
    setProducts((prev) => prev.filter((p) => p.ID !== productId));

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted", {
        description: "The product has been removed successfully.",
      });
      router.refresh(); // Re-fetch server data without full reload
    } catch (err: any) {
      toast.error("Delete failed", {
        description: err.response?.data?.error || "Something went wrong.",
      });
      // Rollback optimistic update on failure
      router.refresh(); // Simple rollback via re-fetch
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-destructive text-lg font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Products Management</h1>
        <Button asChild size="lg">
          <Link href="/admin/products/new">+ Add New Product</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/40 rounded-xl border">
          <p className="text-lg">No products found.</p>
          <p className="mt-2">Start by adding your first product.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-border">
            {products.map((product) => (
              <ProductRow
                key={product.ID}
                product={product}
                onDelete={() => handleDelete(product.ID)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
