import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ShieldCheck, Truck, CreditCard, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Product {
  ID: number;
  Name: string;
  Slug: string;
  Price: number;
  Images?: { URL: string; AltText?: string }[];
}

async function getFeaturedProducts() {
  try {
    const res = await api.get("products?limit=8&sort=created_at desc");
    return res.data.products || [];
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    return [];
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-32 md:py-48 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
            Discover Premium Quality
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 drop-shadow-md">
            Shop the latest trends with fast delivery, secure payments, and
            unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-10 py-7"
            >
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-10 py-7"
            >
              <Link href="/products">Browse Collections</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Featured Products
            </h2>
            <Button variant="outline" asChild>
              <Link href="/products">View All</Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              Loading featured products...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product: Product) => {
                const mainImage =
                  product.Images?.[0]?.URL || "/placeholder-product.jpg";

                return (
                  <Link
                    key={product.ID}
                    href={`/products/${product.ID}`}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full transition-all hover:shadow-xl">
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={mainImage}
                          alt={product.Name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {product.Name}
                        </CardTitle>
                        <p className="text-xl font-bold text-primary mt-2">
                          ${product.Price.toFixed(2)}
                        </p>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Shop With Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast Shipping</h3>
                <p className="text-muted-foreground">
                  Get your orders delivered in 2-5 business days
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                <p className="text-muted-foreground">
                  100% secure checkout with top encryption
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy Returns</h3>
                <p className="text-muted-foreground">
                  30-day hassle-free return policy
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
                <p className="text-muted-foreground">
                  Competitive pricing with frequent deals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stay Updated With Us
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Subscribe to get exclusive deals, new arrivals, and more.
          </p>

          <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12 px-6"
            />
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100 min-w-[140px]"
            >
              Subscribe
            </Button>
          </form>
          <p className="text-sm mt-6 opacity-80">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
