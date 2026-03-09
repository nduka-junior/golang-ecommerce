"use client";

import { useState } from "react";
import api from "@/lib/api";

interface Props {
  product: {
    ID: number;
    Name: string;
    Price: number;
    // No stock_quantity here — we removed it
  };
}

export default function AddToCartButton({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage("");

    try {
      await api.post("/cart/items", {
        product_id: product.ID,
        quantity,
      });
      setMessage("Added to cart!");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-gray-700 font-medium">
          Quantity:
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          // Removed max — no stock info available
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-20 border rounded-md px-3 py-2 text-center"
        />
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-lg font-bold text-white transition
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>

      {message && (
        <p
          className={`text-center ${
            message.includes("Failed") || message.includes("Not enough")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
