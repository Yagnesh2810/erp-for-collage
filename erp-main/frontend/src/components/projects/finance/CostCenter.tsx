"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Building2, 
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";

interface CostCenterData {
  id: string;
  name: string;
  code: string;
  description: string;
  manager: string;
  budget: number;
  spent: number;
  remaining: number;
  employees: number;
  status: 'active' | 'inactive' | 'over-budget';
  department: string;
}

interface CostCenterProps {
  projectId: string;
}

export const CostCenter: React.FC<CostCenterProps> = ({ projectId }) => {
  const [costCenters, setCostCenters] = useState<CostCenterData[]>([
    {
      id: '1',
      name: 'Development Team',
      code: 'DEV-001',
      description: 'Software development and engineering costs',
      manager: 'John Smith',
      budget: 50000,
      spent: 32000,
      remaining: 18000,
      employees: 8,
      status: 'active',
      department: 'Engineering'
    },
    {
      id: '2',
      name: 'Marketing Division',
      code: 'MKT-001',
      description: 'Marketing campaigns and promotional activities',
      manager: 'Sarah Johnson',
      budget: 25000,
      spent: 26500,
      remaining: -1500,
      employees: 4,
      status: 'over-budget',
      department: 'Marketing'
    },
    {
      id: '3',
      name: 'Infrastructure',
      code: 'INF-001',
      description: 'IT infrastructure and cloud services',
      manager: 'Mike Wilson',
      budget: 15000,
      spent: 8500,
      remaining: 6500,
      employees: 3,
      status: 'active',
      department: 'IT'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCostCenter, setNewCostCenter] = useState({
    name: '',
    code: '',
    description: '',
    manager: '',
    budget: 0,
    department: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'over-budget': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetUtilization = (spent: number, budget: number) => {
    return Math.round((spent / budget) * 100);
  };

  const handleAddCostCenter = () => {
    const costCenter: CostCenterData = {
      id: Date.now().toString(),
      name: newCostCenter.name,
      code: newCostCenter.code,
      description: newCostCenter.description,
      manager: newCostCenter.manager,
      budget: newCostCenter.budget,
      spent: 0,
      remaining: newCostCenter.budget,
      employees: 0,
      status: 'active',
      department: newCostCenter.department
    };

    setCostCenters([...costCenters, costCenter]);
    setNewCostCenter({ name: '', code: '', description: '', manager: '', budget: 0, department: '' });
    setIsAddDialogOpen(false);
  };

  const totalBudget = costCenters.reduce((sum, cc) => sum + cc.budget, 0);
  const totalSpent = costCenters.reduce((sum, cc) => sum + cc.spent, 0);
  const totalEmployees = costCenters.reduce((sum, cc) => sum + cc.employees, 0);
  const overBudgetCenters = costCenters.filter(cc => cc.status === 'over-budget').length;

  return (
    <div className="space-y-6">
      {/* Cost Center Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round((totalSpent / totalBudget) * 100)}% utilized
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Centers</p>
                <p className="text-2xl font-bold">{costCenters.length}</p>
                <p className="text-sm text-muted-foreground">active centers</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
                <p className="text-sm text-muted-foreground">across all centers</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Centers Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cost Centers</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cost Center
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Cost Center</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newCostCenter.name}
                        onChange={(e) => setNewCostCenter({...newCostCenter, name: e.target.value})}
                        placeholder="Cost center name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={newCostCenter.code}
                        onChange={(e) => setNewCostCenter({...newCostCenter, code: e.target.value})}
                        placeholder="CC-001"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCostCenter.description}
                      onChange={(e) => setNewCostCenter({...newCostCenter, description: e.target.value})}
                      placeholder="Cost center description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                        onChange={(e) => setNewCostCenter({...newCostCenter, budget: Number(e.target.value)})}
                        placeholder="Budget amount"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={newCostCenter.department} 
                      onValueChange={(value) => setNewCostCenter({...newCostCenter, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCostCenter}>
                      Add Cost Center
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costCenters.map((costCenter) => (
              <div key={costCenter.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-lg">{costCenter.name}</h4>
                      <Badge variant="outline">{costCenter.code}</Badge>
                      <Badge className={getStatusColor(costCenter.status)}>
                        {costCenter.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{costCenter.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="font-medium">{costCenter.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{costCenter.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">${costCenter.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-medium">${costCenter.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="font-medium">{costCenter.employees}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span>{getBudgetUtilization(costCenter.spent, costCenter.budget)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        costCenter.status === 'over-budget' ? 'bg-red-500' : 
                        getBudgetUtilization(costCenter.spent, costCenter.budget) >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(getBudgetUtilization(costCenter.spent, costCenter.budget), 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>Remaining: ${Math.abs(costCenter.remaining).toLocaleString()}</span>
                    <span>${costCenter.budget.toLocaleString()}</span>
                  </div>
                </div>

                {costCenter.status === 'over-budget' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      ⚠️ This cost center has exceeded its budget by ${Math.abs(costCenter.remaining).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Center Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Budget Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costCenters.map((costCenter) => (
                <div key={costCenter.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{costCenter.name}</span>
                    <span>${costCenter.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(costCenter.budget / totalBudget) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="text-sm">Centers Over Budget</span>
                <Badge className={overBudgetCenters > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {overBudgetCenters}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="text-sm">Average Utilization</span>
                <Badge variant="outline">
                  {Math.round((totalSpent / totalBudget) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="text-sm">Most Efficient Center</span>
                <Badge className="bg-green-100 text-green-800">
                  Infrastructure
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="text-sm">Needs Attention</span>
                <Badge className="bg-red-100 text-red-800">
                  Marketing Division
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};