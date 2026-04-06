"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import ProductForm from '@/components/Forms/ProductForm';
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Package, ArrowLeft } from "lucide-react";

export default function AddProductPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-6 pt-6">
        {/* Header and Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
            <p className="text-gray-500 mt-1">
              Create a new product in your inventory
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/products")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </button>
        </div>

        {/* Login Prompt */}
        {!isAuthenticated && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">You are not logged in</h2>
              <p className="text-gray-600 mb-4">Please log in to add products.</p>
              <button
                onClick={() => router.push("/login")}
                className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md"
              >
                Login
              </button>
            </CardContent>
          </Card>
        )}

        {/* Product Form */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Enter the details of your new product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}