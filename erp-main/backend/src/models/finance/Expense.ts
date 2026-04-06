import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  employeeId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  date: Date;
  description: string;
  receipts: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  reimbursedAt?: Date;
  sourceModule?: 'PMS' | 'FINANCE';
}

const ExpenseSchema = new Schema<IExpense>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  receipts: [{ type: String }],
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'reimbursed'], default: 'draft' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  reimbursedAt: { type: Date },
  sourceModule: { type: String, enum: ['PMS', 'FINANCE'], default: 'FINANCE' }
}, { timestamps: true });

// Update project finance totals when expense is saved
ExpenseSchema.post('save', async function() {
  if (this.projectId && this.status === 'approved') {
    const Project = require('../Project').default;
    await updateProjectFinanceTotals(this.projectId);
  }
});

// Update project finance totals when expense is updated
ExpenseSchema.post('findOneAndUpdate', async function() {
  const expense = await mongoose.model('Expense').findOne(this.getQuery());
  if (expense && expense.projectId) {
    await updateProjectFinanceTotals(expense.projectId);
  }
});

// Helper function to update project finance totals
async function updateProjectFinanceTotals(projectId: mongoose.Types.ObjectId) {
  const Project = require('../Project').default;
  const expenses = await mongoose.model('Expense').find({ 
    projectId, 
    status: 'approved' 
  });
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  await Project.findByIdAndUpdate(projectId, {
    'finance.totalExpenses': totalExpenses,
    'finance.profitLoss': 0 - totalExpenses, // Assuming no revenue tracking for now
    spentBudget: totalExpenses
  });
}

export default mongoose.model<IExpense>('Expense', ExpenseSchema);