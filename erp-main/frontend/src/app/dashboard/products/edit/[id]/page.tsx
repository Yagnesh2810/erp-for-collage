"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/Forms/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productsAPI } from '@/lib/api/index';
import Layout from '@/components/Layout';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  stockQuantity: number | string;
  imageUrl?: string;
  supplier?: string;
  // Add other fields that might be in your product data
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const data = await productsAPI.getById(productId);
        
        // Ensure numerical values are properly formatted
        const formattedProduct = data.product || data;
        
        // Convert any numerical values to strings to avoid NaN issues in form inputs
        if (formattedProduct) {
          // Ensure price is a string for form inputs
          if (formattedProduct.price !== undefined) {
            formattedProduct.price = String(formattedProduct.price);
          }
          
          // Ensure stockQuantity is a string for form inputs
          if (formattedProduct.stockQuantity !== undefined) {
            formattedProduct.stockQuantity = String(formattedProduct.stockQuantity);
          }
        }
        
        setProduct(formattedProduct);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Error loading product details');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-gray-500">Update product information</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            {product && <ProductForm productId={productId} initialData={product} />}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}