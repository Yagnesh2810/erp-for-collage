"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetManagement } from "./finance/BudgetManagement";
import { ExpenseTracking } from "./finance/ExpenseTracking";
import { FinanceTrail } from "./finance/FinanceTrail";
import { FinancialReports } from "./finance/FinancialReports";
import { CostCenters } from "./finance/CostCenters";
import { FullFinanceSuite } from "./finance/FullFinanceSuite";
import { 
  DollarSign, 
  Calculator, 
  Receipt, 
  FileText, 
  Building2,
  TrendingUp
} from "lucide-react";

export const ProjectFinanceNav: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const financeFeatures = [
    {
      title: "Budget Management",
      description: "Manage project budget allocations and track spending",
      icon: Calculator,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: () => setActiveSection("budget")
    },
    {
      title: "Expense Tracking",
      description: "Track and approve project expenses",
      icon: Receipt,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: () => setActiveSection("expenses")
    },
    {
      title: "Finance Trail",
      description: "View complete financial transaction history",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: () => setActiveSection("trail")
    },
    {
      title: "Financial Reports",
      description: "Generate comprehensive financial reports",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      action: () => setActiveSection("reports")
    },
    {
      title: "Cost Centers",
      description: "Manage project cost centers and allocations",
      icon: Building2,
      color: "text-red-600",
      bgColor: "bg-red-100",
      action: () => setActiveSection("cost-centers")
    },
    {
      title: "Full Finance Suite",
      description: "Access complete project finance management",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      action: () => setActiveSection("full-suite")
    }
  ];

  const renderActiveSection = () => {
    const sectionMap: { [key: string]: React.ComponentType } = {
      "budget": BudgetManagement,
      "expenses": ExpenseTracking,
      "trail": FinanceTrail,
      "reports": FinancialReports,
      "cost-centers": CostCenters,
      "full-suite": FullFinanceSuite
    };
    
    const Component = sectionMap[activeSection || ""];
    if (Component) {
      return (
        <div className="mt-6">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              ← Back to Finance Overview
            </Button>
          </div>
          <Component />
        </div>
      );
    }
    return null;
  };

  if (activeSection) {
    return (
      <div className="space-y-6">
        {renderActiveSection()}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Project Finance Management</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive financial tools for project budget management, expense tracking, and financial reporting
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {financeFeatures.map((feature, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left hover:shadow-md transition-shadow"
              onClick={feature.action}
              aria-label={`Navigate to ${feature.title}: ${feature.description}`}
              title={feature.description}
            >
              <div className="flex items-center gap-3 mb-2 w-full">
                <div className={`p-2 rounded-lg ${feature.bgColor}`} aria-hidden="true">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} aria-hidden="true" />
                </div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};