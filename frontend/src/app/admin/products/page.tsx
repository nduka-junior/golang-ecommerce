import Link from "next/link";
import api from "@/lib/api";

interface Product {
  ID: number;
  Name: string;
  Slug: string;
  Price: number;
}

async function getProducts() {
  try {
    const res = await api.get("/products");
    return res.data.products || [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600">No products yet. Add your first one!</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product: Product) => (
              <li key={product.ID} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {product.Name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Slug: {product.Slug}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
             {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.Price)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
