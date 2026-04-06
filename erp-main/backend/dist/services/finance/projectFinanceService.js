"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectFinanceService = void 0;
const Project_1 = __importDefault(require("../../models/Project"));
const Expense_1 = __importDefault(require("../../models/finance/Expense"));
const BudgetAllocation_1 = __importDefault(require("../../models/finance/BudgetAllocation"));
const CostCenter_1 = __importDefault(require("../../models/finance/CostCenter"));
const LedgerTransaction_1 = __importDefault(require("../../models/finance/LedgerTransaction"));
const JournalEntry_1 = __importDefault(require("../../models/finance/JournalEntry"));
class ProjectFinanceService {
    static async getFinanceOverview(projectId) {
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const [expenses, budgetAllocations, costCenters] = await Promise.all([
            Expense_1.default.find({ projectId, status: { $in: ['approved', 'reimbursed'] } }),
            BudgetAllocation_1.default.find({ projectId }),
            CostCenter_1.default.find({ projectId })
        ]);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalAllocated = budgetAllocations.reduce((sum, allocation) => sum + allocation.allocatedAmount, 0);
        const totalSpent = budgetAllocations.reduce((sum, allocation) => sum + allocation.spentAmount, 0);
        return {
            totalBudget: project.budget,
            allocatedBudget: totalAllocated,
            spentAmount: totalExpenses,
            remainingBudget: project.budget - totalExpenses,
            totalExpenses,
            totalRevenue: project.finance?.totalRevenue || 0,
            profitLoss: (project.finance?.totalRevenue || 0) - totalExpenses,
            budgetUtilization: project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0,
            costCentersCount: costCenters.length,
            expensesCount: expenses.length
        };
    }
    static async createJournalEntry(data) {
        const journalEntry = new JournalEntry_1.default({
            projectId: data.projectId,
            entryType: data.type,
            description: data.description,
            reference: data.reference,
            totalAmount: data.amount,
            entries: [
                {
                    accountCode: this.getAccountCode(data.type),
                    debit: data.type === 'expense' ? data.amount : 0,
                    credit: data.type === 'expense' ? 0 : data.amount,
                    description: data.description
                }
            ],
            createdBy: data.createdBy,
            status: 'posted'
        });
        await journalEntry.save();
        return journalEntry;
    }
    static async createLedgerTransaction(data) {
        const transaction = new LedgerTransaction_1.default({
            projectId: data.projectId,
            type: data.type,
            amount: data.amount,
            description: data.description,
            category: data.category,
            reference: data.reference,
            accountCode: this.getAccountCode(data.type),
            createdBy: data.createdBy,
            status: 'completed'
        });
        await transaction.save();
        // Update project finance totals
        await this.updateProjectFinanceTotals(data.projectId);
        return transaction;
    }
    static async updateProjectFinanceTotals(projectId) {
        const [expenses, revenues] = await Promise.all([
            LedgerTransaction_1.default.find({ projectId, type: 'expense', status: 'completed' }),
            LedgerTransaction_1.default.find({ projectId, type: 'revenue', status: 'completed' })
        ]);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
        await Project_1.default.findByIdAndUpdate(projectId, {
            'finance.totalExpenses': totalExpenses,
            'finance.totalRevenue': totalRevenue,
            'finance.profitLoss': totalRevenue - totalExpenses,
            spentBudget: totalExpenses
        });
    }
    static async generateReports(projectId, reportType, period) {
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        switch (reportType) {
            case 'budget-vs-actual':
                return this.getBudgetVsActualReport(projectId, period);
            case 'expense-breakdown':
                return this.getExpenseBreakdownReport(projectId, period);
            case 'cash-flow':
                return this.getCashFlowReport(projectId, period);
            case 'profitability':
                return this.getProfitabilityReport(projectId, period);
            default:
                return this.getSummaryReport(projectId);
        }
    }
    static async getBudgetVsActualAnalysis(projectId) {
        const [project, budgetAllocations, expenses] = await Promise.all([
            Project_1.default.findById(projectId),
            BudgetAllocation_1.default.find({ projectId }),
            Expense_1.default.find({ projectId, status: { $in: ['approved', 'reimbursed'] } })
        ]);
        if (!project) {
            throw new Error('Project not found');
        }
        const categoryAnalysis = budgetAllocations.map(allocation => {
            const categoryExpenses = expenses.filter(exp => exp.category === allocation.category);
            const actualSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
                category: allocation.category,
                budgeted: allocation.allocatedAmount,
                actual: actualSpent,
                variance: actualSpent - allocation.allocatedAmount,
                variancePercent: allocation.allocatedAmount > 0 ?
                    ((actualSpent - allocation.allocatedAmount) / allocation.allocatedAmount) * 100 : 0
            };
        });
        return {
            overall: {
                totalBudget: project.budget,
                totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
                variance: expenses.reduce((sum, exp) => sum + exp.amount, 0) - project.budget
            },
            byCategory: categoryAnalysis
        };
    }
    static async getCashFlowAnalysis(projectId, period) {
        const transactions = await LedgerTransaction_1.default.find({ projectId })
            .sort({ createdAt: 1 });
        const groupedData = this.groupTransactionsByPeriod(transactions, period);
        return Object.entries(groupedData).map(([period, transactions]) => {
            const inflow = transactions
                .filter(t => t.type === 'revenue')
                .reduce((sum, t) => sum + t.amount, 0);
            const outflow = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                period,
                inflow,
                outflow,
                netFlow: inflow - outflow
            };
        });
    }
    static async getBudgetVsActualReport(projectId, period) {
        const expenses = await Expense_1.default.find({
            projectId,
            status: { $in: ['approved', 'reimbursed'] }
        });
        const budgetAllocations = await BudgetAllocation_1.default.find({ projectId });
        const groupedExpenses = this.groupExpensesByPeriod(expenses, period);
        const groupedBudget = this.groupBudgetByPeriod(budgetAllocations, period);
        return Object.keys({ ...groupedExpenses, ...groupedBudget }).map(period => ({
            period,
            budget: groupedBudget[period] || 0,
            actual: groupedExpenses[period] || 0
        }));
    }
    static async getExpenseBreakdownReport(projectId, period) {
        const expenses = await Expense_1.default.find({
            projectId,
            status: { $in: ['approved', 'reimbursed'] }
        });
        const breakdown = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        return Object.entries(breakdown).map(([category, amount]) => ({
            category,
            amount,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
        }));
    }
    static async getCashFlowReport(projectId, period) {
        return this.getCashFlowAnalysis(projectId, period);
    }
    static async getProfitabilityReport(projectId, period) {
        const transactions = await LedgerTransaction_1.default.find({ projectId });
        const groupedData = this.groupTransactionsByPeriod(transactions, period);
        return Object.entries(groupedData).map(([period, transactions]) => {
            const revenue = transactions
                .filter(t => t.type === 'revenue')
                .reduce((sum, t) => sum + t.amount, 0);
            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                period,
                revenue,
                expenses,
                profit: revenue - expenses,
                margin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
            };
        });
    }
    static async getSummaryReport(projectId) {
        return this.getFinanceOverview(projectId);
    }
    static groupExpensesByPeriod(expenses, period) {
        return expenses.reduce((acc, expense) => {
            const key = this.getPeriodKey(expense.date, period);
            acc[key] = (acc[key] || 0) + expense.amount;
            return acc;
        }, {});
    }
    static groupBudgetByPeriod(budgetAllocations, period) {
        return budgetAllocations.reduce((acc, allocation) => {
            const key = this.getPeriodKey(allocation.createdAt, period);
            acc[key] = (acc[key] || 0) + allocation.allocatedAmount;
            return acc;
        }, {});
    }
    static groupTransactionsByPeriod(transactions, period) {
        return transactions.reduce((acc, transaction) => {
            const key = this.getPeriodKey(transaction.createdAt, period);
            if (!acc[key])
                acc[key] = [];
            acc[key].push(transaction);
            return acc;
        }, {});
    }
    static getPeriodKey(date, period) {
        const d = new Date(date);
        switch (period) {
            case 'daily':
                return d.toISOString().split('T')[0];
            case 'weekly':
                const week = Math.ceil(d.getDate() / 7);
                return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}`;
            case 'monthly':
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            case 'quarterly':
                const quarter = Math.ceil((d.getMonth() + 1) / 3);
                return `${d.getFullYear()}-Q${quarter}`;
            case 'yearly':
                return d.getFullYear().toString();
            default:
                return d.toISOString().split('T')[0];
        }
    }
    static getAccountCode(type) {
        const accountCodes = {
            'expense': '6000',
            'revenue': '4000',
            'budget_allocation': '1000',
            'transfer': '2000'
        };
        return accountCodes[type] || '9000';
    }
}
exports.ProjectFinanceService = ProjectFinanceService;
