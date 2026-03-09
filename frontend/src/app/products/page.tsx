"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Product {
  ID: number;
  Name: string;
  Slug: string;
  Price: number;
  Images: { URL: string; AltText: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data.products);
        console.log("Fetched products:", res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center py-20">Loading products...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.ID} href={`/products/${product.ID}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              {product.Images?.length > 0 && (
                <img
                  src={product.Images[0].URL || "/placeholder.jpg"}
                  alt={product.Images[0].AltText || product.Name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                  {product.Name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.Price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
