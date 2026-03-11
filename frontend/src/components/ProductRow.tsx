// components/ProductRow.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Product {
  ID: number;
  Name: string;
  Slug: string;
  Price: number;
}

interface ProductRowProps {
  product: Product;
  onDelete: () => void;
}

export default function ProductRow({ product, onDelete }: ProductRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <li className="group hover:bg-muted/50 transition-colors">
      <div className="px-6 py-5 flex items-center justify-between gap-6">
        {/* Clickable area → product detail */}
        <Link
          href={`/products/${product.ID}`}
          className="flex-1 min-w-0 cursor-pointer flex items-center gap-6"
        >
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-primary group-hover:underline transition-colors">
              {product.Name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Slug: <span className="font-mono">{product.Slug}</span>
            </p>
          </div>

          <div className="ml-4 flex-shrink-0">
            <Badge variant="outline" className="text-base px-4 py-1.5">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(product.Price)}
            </Badge>
          </div>
        </Link>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete{" "}
                <span className="font-medium">{product.Name}</span>?
                <br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
