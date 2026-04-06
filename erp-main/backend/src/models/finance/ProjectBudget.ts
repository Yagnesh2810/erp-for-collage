import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectBudgetCategory extends Document {
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilization: number;
  status: 'active' | 'exceeded' | 'completed';
  description: string;
}

export interface IProjectBudget extends Document {
  projectId: mongoose.Types.ObjectId;
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  budgetUtilization: number;
  categories: IProjectBudgetCategory[];
  createdBy: mongoose.Types.ObjectId;
  lastUpdated: Date;
}

const ProjectBudgetCategorySchema = new Schema<IProjectBudgetCategory>({
  name: { type: String, required: true },
  allocatedAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  utilization: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'exceeded', 'completed'], default: 'active' },
  description: { type: String, required: true }
});

const ProjectBudgetSchema = new Schema<IProjectBudget>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  totalBudget: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  remainingBudget: { type: Number, required: true },
  budgetUtilization: { type: Number, default: 0 },
  categories: [ProjectBudgetCategorySchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Update budget calculations when categories change
ProjectBudgetSchema.pre('save', function() {
  const totalAllocated = this.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const totalSpent = this.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
  
  this.totalBudget = totalAllocated;
  this.spentAmount = totalSpent;
  this.remainingBudget = totalAllocated - totalSpent;
  this.budgetUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  this.lastUpdated = new Date();
  
  // Update category calculations
  this.categories.forEach(category => {
    category.remainingAmount = category.allocatedAmount - category.spentAmount;
    category.utilization = category.allocatedAmount > 0 ? Math.round((category.spentAmount / category.allocatedAmount) * 100) : 0;
    
    if (category.spentAmount > category.allocatedAmount) {
      category.status = 'exceeded';
    } else if (category.spentAmount === category.allocatedAmount) {
      category.status = 'completed';
    } else {
      category.status = 'active';
    }
  });
});

export default mongoose.model<IProjectBudget>('ProjectBudget', ProjectBudgetSchema);