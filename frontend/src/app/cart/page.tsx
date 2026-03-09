"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

interface CartItem {
  ID?: number;
  Product?: {
    ID?: number;
    Name?: string;
    Price?: number;
    Images?: { URL?: string; AltText?: string }[];
  };
  Quantity?: number;
  Price?: number;
}

interface Cart {
  ID?: number;
  Items?: CartItem[];
  TotalPrice?: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    console.log("Token present:", !!token);
    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...");
    } else {
      setError("Please log in to view your cart");
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    try {
      const res = await api.get("cart");
      console.log("Full API response:", JSON.stringify(res.data, null, 2));

      const fetchedCart = res.data.cart || { Items: [], TotalPrice: 0 };
      console.log("Parsed cart:", JSON.stringify(fetchedCart, null, 2));

      setCart(fetchedCart);
    } catch (err: any) {
      console.error("Cart fetch error:", err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to load cart. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`cart/items/${itemId}`, { quantity: newQuantity });

      setCart((prev) => {
        if (!prev?.Items) return prev;
        return {
          ...prev,
          Items: prev.Items.map((item) =>
            item.ID === itemId ? { ...item, Quantity: newQuantity } : item,
          ),
        };
      });
    } catch (err) {
      console.error("Update quantity failed:", err);
      alert("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.delete(`cart/items/${itemId}`);

      setCart((prev) => {
        if (!prev?.Items) return prev;
        return {
          ...prev,
          Items: prev.Items.filter((item) => item.ID !== itemId),
        };
      });
    } catch (err) {
      console.error("Remove item failed:", err);
      alert("Failed to remove item");
    }
  };

  // Safe calculations
  const subtotal =
    cart?.Items?.reduce((sum, item) => {
      const price = item?.Price ?? 0;
      const qty = item?.Quantity ?? 0;
      return sum + price * qty;
    }, 0) ?? 0;

  const itemCount = cart?.Items?.length ?? 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchCart} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="h-20 w-20 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Looks like you haven't added any products yet.
        </p>
        <Button asChild size="lg">
          <a href="/products">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart?.Items?.map((item) => {
            const product = item?.Product ?? {};
            const mainImage = product.Images?.[0]?.URL || "/placeholder.jpg";
            const itemName = product.Name || "Unnamed Product";
            const itemPrice = item?.Price ?? 0;
            const quantity = item?.Quantity ?? 1;
            const itemSubtotal = itemPrice * quantity;

            return (
              <Card key={item.ID ?? Math.random()} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-48 h-48 relative flex-shrink-0 bg-gray-100">
                      <Image
                        src={mainImage}
                        alt={itemName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {itemName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${itemPrice.toFixed(2)} each
                          </p>
                        </div>
                        <p className="font-bold text-lg whitespace-nowrap">
                          ${itemSubtotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.ID ?? 0, quantity - 1)
                            }
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-12 text-center font-medium">
                            {quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.ID ?? 0, quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => removeItem(item.ID ?? 0)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" asChild>
                <a href="/checkout">Proceed to Checkout</a>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Taxes and shipping calculated at checkout
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
