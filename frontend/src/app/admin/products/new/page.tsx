"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file selection + previews
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);

      // Generate previews
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove a file + preview
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("description", formData.description);
      data.append("short_description", formData.short_description);
      data.append("price", formData.price);

      // Append all selected files
      files.forEach((file) => {
        data.append("images", file);
      });

      await api.post("/product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clean up previews (revoke URLs to free memory)
      previews.forEach(URL.revokeObjectURL);

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={3}
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL-friendly)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: noise-cancelling-headphones-pro
            </p>
          </div>
        </div>

        {/* Description fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <input
            type="text"
            value={formData.short_description}
            onChange={(e) =>
              setFormData({ ...formData, short_description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Product Images
          </label>

          {/* Preview selected images */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {previews.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFiles(files.filter((_, i) => i !== index));
                      setPreviews(previews.filter((_, i) => i !== index));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File input */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                const selected = Array.from(e.target.files);
                setFiles((prev) => [...prev, ...selected]);
                const newPreviews = selected.map((f) => URL.createObjectURL(f));
                setPreviews((prev) => [...prev, ...newPreviews]);
              }
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-3 file:px-6
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            Select multiple images (PNG, JPG, max 10MB total recommended)
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-bold text-white transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
