//project\frontend\src\components\Dashboard\QuickActions.tsx
"use client";

import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  color: string;
  isAuthenticated: boolean;
  router: AppRouterInstance;
  badgeText: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  href,
  color,
  isAuthenticated,
  router,
  badgeText
}) => {
  return (
    <Button
      variant="outline"
      className={cn(
        "flex flex-col h-auto p-4 transition-all",
        isAuthenticated ? "hover:shadow-md" : "opacity-50 cursor-not-allowed"
      )}
      onClick={() => isAuthenticated && router.push(href)}
      disabled={!isAuthenticated}
      aria-label={`${title}: ${description}${!isAuthenticated ? ' (Login required)' : ''}`}
      title={description}
    >
      <Badge variant="secondary" className="mb-3" aria-hidden="true">
        {badgeText}
      </Badge>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </Button>
  );
};

interface QuickActionsProps {
  isAuthenticated: boolean;
  router: AppRouterInstance;
}

const QuickActions: React.FC<QuickActionsProps> = ({ isAuthenticated, router }) => {
  const actions = [
    {
      title: "New Order",
      description: "Create a new customer order",
      href: "/dashboard/orders/new",
      color: "blue",
      badgeText: "ORDER"
    },
    {
      title: "Add Product",
      description: "Add a new product to inventory",
      href: "/dashboard/products/add",
      color: "green",
      badgeText: "PRODUCT"
    },
    {
      title: "Add Customer",
      description: "Register a new customer",
      href: "/dashboard/customers/new",
      color: "purple",
      badgeText: "CUSTOMER"
    },
    {
      title: "Manage Inventory",
      description: "Check and update stock levels",
      href: "/dashboard/inventory",
      color: "indigo",
      badgeText: "STOCK"
    },
    {
      title: "Pending Orders",
      description: "View orders awaiting processing",
      href: "/dashboard/orders?status=pending",
      color: "amber",
      badgeText: "PENDING"
    },
    {
      title: "Manage Suppliers",
      description: "Work with your suppliers",
      href: "/dashboard/suppliers",
      color: "cyan",
      badgeText: "SUPPLIER"
    },
    {
      title: "Customer List",
      description: "View and manage customers",
      href: "/dashboard/customers",
      color: "pink",
      badgeText: "LIST"
    },
    {
      title: "Generate Reports",
      description: "Create sales and inventory reports",
      href: "/dashboard/reports",
      color: "orange",
      badgeText: "REPORT"
    },
    {
      title: "Finance Management",
      description: "Manage budgets, expenses, and financial reports",
      href: "/dashboard/finance",
      color: "emerald",
      badgeText: "FINANCE"
    }
  ];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you might want to perform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              href={action.href}
              color={action.color}
              isAuthenticated={isAuthenticated}
              router={router}
              badgeText={action.badgeText}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;