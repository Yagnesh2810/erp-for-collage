"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProduct } from "@/lib/api/index";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
  supplier?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProduct(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product details. Please try again.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/2 h-96 rounded-lg" />
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="pt-6">
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (<Layout>
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-8">{error}</p>
        <Link href="/dashboard/products">
          <Button>Back to Products</Button>
        </Link>
      </div></Layout>
    );
  }

  if (!product) {
    return (<Layout>
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/products">
          <Button>Browse Products</Button>
        </Link>
      </div></Layout>
    );
  }

  return (<Layout>
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {product.imageUrl ? (
            <div className="relative w-full h-[400px]">
              <Image 
                src={product.imageUrl} 
                alt={product.name || 'Product image'}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <Badge className="mb-4">{product.category}</Badge>
          
          <p className="text-xl font-semibold text-gray-800 mb-6">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
          </p>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Availability</h2>
            <p className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                (product.stockQuantity || 0) > 10 ? 'bg-green-500' : 
                (product.stockQuantity || 0) > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              {(product.stockQuantity || 0) > 10 ? 'In Stock' : 
               (product.stockQuantity || 0) > 0 ? 'Low Stock' : 'Out of Stock'} 
              ({product.stockQuantity || 0} available)
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              size="lg" 
              disabled={(product.stockQuantity || 0) === 0}
              className="flex-1 md:flex-none"
            >
              Add to Cart
            </Button>
            <Link href="/dashboard/products" className="flex-1 md:flex-none">
              <Button variant="outline" size="lg" className="w-full">
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div></Layout>
  );
}