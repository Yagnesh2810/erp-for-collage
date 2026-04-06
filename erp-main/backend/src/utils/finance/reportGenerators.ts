export class ReportGenerators {
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatPercentage(value: number, decimals = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  static generateReportHeader(title: string, period?: { start?: Date; end?: Date }): any {
    return {
      title,
      generatedAt: new Date(),
      period: period ? {
        startDate: period.start,
        endDate: period.end
      } : null
    };
  }

  static calculateTotals(items: any[], field: string): number {
    return items.reduce((sum, item) => sum + (item[field] || 0), 0);
  }

  static groupByCategory(items: any[], categoryField: string): Record<string, any[]> {
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