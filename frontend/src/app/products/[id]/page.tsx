import { notFound } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import AddToCartButton from "@/components/AddToCartButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader,CardTitle } from "@/components/ui/card";

interface ProductImage {
  ID: number;
  URL: string;
  AltText?: string;
  is_main?: boolean;
}

interface Product {
  ID: number;
  Name: string;
  Slug: string;
  Description: string;
  ShortDescription?: string;
  Price: number;
  CompareAtPrice?: number;
  Images: ProductImage[];
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await api.get(`/products/${id}`);
    console.log("Fetched product:", res.data.product);
    return res.data.product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Calculate discount
  const discount =
    product.CompareAtPrice && product.Price < product.CompareAtPrice
      ? Math.round(
          ((product.CompareAtPrice - product.Price) / product.CompareAtPrice) *
            100,
        )
      : 0;

  // Images with fallback
  const images =
    product.Images?.length > 0
      ? product.Images
      : [
          {
            ID: 0,
            URL: "/placeholder-product.jpg",
            AltText: "No image available",
          },
        ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Carousel Section */}
        <div className="space-y-6">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img) => (
                <CarouselItem key={img.ID}>
                  <Card className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-0 relative aspect-[4/3]">
                      <Image
                        src={img.URL}
                        alt={img.AltText || product.Name}
                        fill
                        className="object-cover"
                        priority={img.is_main}
                      />
                      {discount > 0 && img.is_main && (
                        <Badge
                          variant="destructive"
                          className="absolute top-4 left-4 text-base px-4 py-2 shadow-md"
                        >
                          -{discount}%
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          {/* Optional: Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {images.map((img, idx) => (
                <div
                  key={img.ID}
                  className="w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer"
                >
                  <Image
                    src={img.URL}
                    alt={`Thumbnail ${idx + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {product.Name}
            </h1>
            {product.ShortDescription && (
              <p className="mt-4 text-lg text-muted-foreground">
                {product.ShortDescription}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-4xl md:text-5xl font-bold text-primary">
              ${product.Price.toFixed(2)}
            </span>
       
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.Description }} />
            </CardContent>
          </Card>

          {/* Add to Cart */}
          <div className="pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
