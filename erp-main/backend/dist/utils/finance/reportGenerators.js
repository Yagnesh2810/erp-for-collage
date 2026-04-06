"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerators = void 0;
class ReportGenerators {
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    static formatPercentage(value, decimals = 2) {
        return `${(value * 100).toFixed(decimals)}%`;
    }
    static generateReportHeader(title, period) {
        return {
            title,
            generatedAt: new Date(),
            period: period ? {
                startDate: period.start,
                endDate: period.end
            } : null
        };
    }
    static calculateTotals(items, field) {
        return items.reduce((sum, item) => sum + (item[field] || 0), 0);
    }
    static groupByCategory(items, categoryField) {
        return items.reduce((groups, item) => {
            const category = item[categoryField] || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    }
}
exports.ReportGenerators = ReportGenerators;
