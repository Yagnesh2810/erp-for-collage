"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetManagement } from "./BudgetManagement";
import { ExpenseTracking } from "./ExpenseTracking";
import { FinanceTrail } from "./FinanceTrail";
import { FinancialReports } from "./FinancialReports";
import { CostCenters } from "./CostCenters";
import { DollarSign, Calculator, Receipt, FileText, TrendingUp, Building2 } from "lucide-react";

export const FullFinanceSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState("budget");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Complete Project Finance Management Suite
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive financial management tools for complete project oversight
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="trail" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Trail
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="cost-centers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Cost Centers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="mt-6">
          <BudgetManagement />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpenseTracking />
        </TabsContent>

        <TabsContent value="trail" className="mt-6">
          <FinanceTrail />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="cost-centers" className="mt-6">
          <CostCenters />
        </TabsContent>
      </Tabs>
    </div>
  );
};