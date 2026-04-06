"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, DollarSign } from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export const BudgetManagement: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: "1", category: "Development", allocated: 50000, spent: 32000, remaining: 18000 },
    { id: "2", category: "Design", allocated: 15000, spent: 8500, remaining: 6500 },
    { id: "3", category: "Testing", allocated: 10000, spent: 2000, remaining: 8000 }
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budgetItems.reduce((sum, item) => sum + item.remaining, 0);

  const addBudgetItem = () => {
    if (newCategory && newAmount) {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        category: newCategory,
        allocated: parseFloat(newAmount),
        spent: 0,
        remaining: parseFloat(newAmount)
      };
      setBudgetItems([...budgetItems, newItem]);
      setNewCategory("");
      setNewAmount("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Allocated</p>
              <p className="text-2xl font-bold text-blue-600">${totalAllocated.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-green-600">${totalRemaining.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {budgetItems.map((item) => {
              const spentPercentage = (item.spent / item.allocated) * 100;
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{item.category}</h4>
                    <Badge variant={spentPercentage > 80 ? "destructive" : "secondary"}>
                      {spentPercentage.toFixed(1)}% used
                    </Badge>
                  </div>
                  <Progress value={spentPercentage} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Spent: ${item.spent.toLocaleString()}</span>
                    <span>Allocated: ${item.allocated.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Budget Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Marketing"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addBudgetItem}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};