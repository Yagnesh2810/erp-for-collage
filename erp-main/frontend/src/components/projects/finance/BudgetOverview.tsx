"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  getBudgetOverview, 
  addBudgetCategory, 
  updateBudgetCategory, 
  deleteBudgetCategory,
  type BudgetCategory 
} from "@/lib/api/finance/projectBudgetApi";
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
  Edit, 
  Trash2, 
  DollarSign,
  Target,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";



interface BudgetOverviewProps {
  projectId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ 
  projectId, 
  canEdit, 
  canDelete 
}) => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    allocatedAmount: 0,
    description: ''
  });

  useEffect(() => {
    fetchBudgetOverview();
  }, [projectId]);

  const fetchBudgetOverview = async () => {
    try {
      setLoading(true);
      const data = await getBudgetOverview(projectId);
      setBudgetCategories(data.categories);
    } catch (error) {
      console.error('Error fetching budget overview:', error);
      toast({
        title: "Error",
        description: "Failed to load budget overview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spentAmount, 0);
  const totalRemaining = budgetCategories.reduce((sum, cat) => sum + cat.remainingAmount, 0);
  const overallUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'exceeded': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return 'bg-red-500';
    if (utilization >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateBudgetCategory(projectId, editingCategory._id, formData);
        toast({
          title: "Success",
          description: "Budget category updated successfully",
        });
      } else {
        await addBudgetCategory(projectId, formData);
        toast({
          title: "Success",
          description: "Budget category added successfully",
        });
      }
      
      await fetchBudgetOverview();
      setFormData({ name: '', allocatedAmount: 0, description: '' });
      setEditingCategory(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save budget category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      allocatedAmount: category.allocatedAmount,
      description: category.description
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteBudgetCategory(projectId, categoryId);
      toast({
        title: "Success",
        description: "Budget category deleted successfully",
      });
      await fetchBudgetOverview();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading budget overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spent Amount</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                <Badge className={`mt-1 ${overallUtilization >= 90 ? 'bg-red-100 text-red-800' : overallUtilization >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {overallUtilization}%
                </Badge>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(totalRemaining).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalBudget > 0 ? ((Math.abs(totalRemaining) / totalBudget) * 100).toFixed(1) : 0}% {totalRemaining >= 0 ? 'left' : 'over'}
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization %</p>
                <p className={`text-2xl font-bold ${overallUtilization >= 100 ? 'text-red-600' : overallUtilization >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {overallUtilization}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {overallUtilization >= 100 ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className="text-sm text-muted-foreground">
                ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getUtilizationColor(overallUtilization)}`}
                style={{ width: `${Math.min(overallUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>{overallUtilization}% used</span>
              <span>100%</span>
            </div>
            {overallUtilization >= 80 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {overallUtilization >= 100 
                    ? "Critical: Budget exceeded" 
                    : "Warning: Budget utilization is high"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Categories</CardTitle>
            {canEdit && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <button 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({ name: '', allocatedAmount: 0, description: '' });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Budget Category' : 'Add Budget Category'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Category Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Allocated Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.allocatedAmount}
                        onChange={(e) => setFormData({...formData, allocatedAmount: Number(e.target.value)})}
                        placeholder="Enter allocated amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveCategory}>
                        {editingCategory ? 'Update' : 'Add'} Category
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetCategories.map((category) => (
              <div key={category._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(category.status)}>
                      {category.status}
                    </Badge>
                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated</p>
                    <p className="font-medium">${category.allocatedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-medium">${category.spentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={`font-medium ${category.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(category.remainingAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span>{category.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(category.utilization)}`}
                      style={{ width: `${Math.min(category.utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};