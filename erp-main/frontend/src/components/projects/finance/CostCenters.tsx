"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";

interface CostCenter {
  id: string;
  name: string;
  code: string;
  manager: string;
  budget: number;
  spent: number;
  department: string;
  status: "active" | "inactive";
}

export const CostCenters: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    { id: "1", name: "Frontend Development", code: "CC-FE-001", manager: "John Doe", budget: 30000, spent: 18000, department: "Development", status: "active" },
    { id: "2", name: "Backend Development", code: "CC-BE-001", manager: "Jane Smith", budget: 25000, spent: 14000, department: "Development", status: "active" },
    { id: "3", name: "UI/UX Design", code: "CC-UX-001", manager: "Mike Johnson", budget: 15000, spent: 8500, department: "Design", status: "active" },
    { id: "4", name: "Quality Assurance", code: "CC-QA-001", manager: "Sarah Wilson", budget: 10000, spent: 2000, department: "Testing", status: "active" }
  ]);

  const [newCostCenter, setNewCostCenter] = useState({
    name: "",
    code: "",
    manager: "",
    budget: "",
    department: ""
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const addCostCenter = () => {
    if (newCostCenter.name && newCostCenter.code && newCostCenter.budget) {
      const costCenter: CostCenter = {
        id: Date.now().toString(),
        name: newCostCenter.name,
        code: newCostCenter.code,
        manager: newCostCenter.manager,
        budget: parseFloat(newCostCenter.budget),
        spent: 0,
        department: newCostCenter.department,
        status: "active"
      };
      setCostCenters([...costCenters, costCenter]);
      setNewCostCenter({ name: "", code: "", manager: "", budget: "", department: "" });
    }
  };

  const deleteCostCenter = (id: string) => {
    setCostCenters(costCenters.filter(cc => cc.id !== id));
  };

  const toggleStatus = (id: string) => {
    setCostCenters(costCenters.map(cc => 
      cc.id === id ? { ...cc, status: cc.status === "active" ? "inactive" : "active" } : cc
    ));
  };

  const totalBudget = costCenters.reduce((sum, cc) => sum + cc.budget, 0);
  const totalSpent = costCenters.reduce((sum, cc) => sum + cc.spent, 0);
  const activeCenters = costCenters.filter(cc => cc.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Cost Centers</p>
              <p className="text-2xl font-bold">{activeCenters}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Cost Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Cost Center Name</Label>
              <Input
                id="name"
                value={newCostCenter.name}
                onChange={(e) => setNewCostCenter({...newCostCenter, name: e.target.value})}
                placeholder="e.g., Frontend Development"
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={newCostCenter.code}
                onChange={(e) => setNewCostCenter({...newCostCenter, code: e.target.value})}
                placeholder="e.g., CC-FE-001"
              />
            </div>
            <div>
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                value={newCostCenter.manager}
                onChange={(e) => setNewCostCenter({...newCostCenter, manager: e.target.value})}
                placeholder="Manager name"
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={newCostCenter.budget}
                onChange={(e) => setNewCostCenter({...newCostCenter, budget: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={newCostCenter.department} onValueChange={(value) => setNewCostCenter({...newCostCenter, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addCostCenter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Center
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Cost Centers Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costCenters.map((costCenter) => {
              const spentPercentage = (costCenter.spent / costCenter.budget) * 100;
              const remaining = costCenter.budget - costCenter.spent;
              
              return (
                <div key={costCenter.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{costCenter.name}</h4>
                        <Badge variant={costCenter.status === "active" ? "default" : "secondary"}>
                          {costCenter.status}
                        </Badge>
                        <Badge variant="outline">{costCenter.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {costCenter.department} • Manager: {costCenter.manager}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(costCenter.id)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(costCenter.id)}>
                        {costCenter.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteCostCenter(costCenter.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span>{spentPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={spentPercentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Spent: ${costCenter.spent.toLocaleString()}</span>
                      <span>Remaining: ${remaining.toLocaleString()}</span>
                      <span>Budget: ${costCenter.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};