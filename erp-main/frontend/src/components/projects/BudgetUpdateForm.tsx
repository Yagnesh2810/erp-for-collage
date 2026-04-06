//path: frontend/src/components/projects/BudgetUpdateForm.tsx
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { updateProjectBudget } from '@/lib/api/projectFinanceAPI';

interface BudgetUpdateFormProps {
  projectId: string;
  currentBudget: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const BudgetUpdateForm: React.FC<BudgetUpdateFormProps> = ({ 
  projectId, 
  currentBudget,
  onClose, 
  onSuccess 
}) => {
  const [budget, setBudget] = useState(currentBudget.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid budget amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateProjectBudget(projectId, budgetValue);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Project Budget</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="budget">Budget Amount</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Current budget: ${currentBudget.toLocaleString()}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};