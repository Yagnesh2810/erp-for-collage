import Account from '../../models/finance/Account';

export class AccountCodeGenerator {
  private static accountTypePrefixes = {
    asset: '1',
    liability: '2',
    equity: '3',
    revenue: '4',
    expense: '5'
  };

  static async generateAccountCode(accountType: keyof typeof AccountCodeGenerator.accountTypePrefixes): Promise<string> {
    const prefix = this.accountTypePrefixes[accountType];
    
    // Find the highest existing code for this account type
    const lastAccount = await Account.findOne({
      type: accountType,
      code: { $regex: `^${prefix}` }
    }).sort({ code: -1 });

    let nextNumber = 1000; // Start from 1000
    
    if (lastAccount) {
      const lastNumber = parseInt(lastAccount.code.substring(1));
      nextNumber = lastNumber + 10; // Increment by 10 to allow for manual insertions
    }

    return `${prefix}${nextNumber}`;
  }

  static validateAccountCode(code: string, accountType: keyof typeof AccountCodeGenerator.accountTypePrefixes): boolean {
    const expectedPrefix = this.accountTypePrefixes[accountType];
    return code.startsWith(expectedPrefix) && /^\d{4,}$/.test(code.substring(1));
  }
}