"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountCodeGenerator = void 0;
const Account_1 = __importDefault(require("../../models/finance/Account"));
class AccountCodeGenerator {
    static async generateAccountCode(accountType) {
        const prefix = this.accountTypePrefixes[accountType];
        // Find the highest existing code for this account type
        const lastAccount = await Account_1.default.findOne({
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
    static validateAccountCode(code, accountType) {
        const expectedPrefix = this.accountTypePrefixes[accountType];
        return code.startsWith(expectedPrefix) && /^\d{4,}$/.test(code.substring(1));
    }
}
exports.AccountCodeGenerator = AccountCodeGenerator;
AccountCodeGenerator.accountTypePrefixes = {
    asset: '1',
    liability: '2',
    equity: '3',
    revenue: '4',
    expense: '5'
};
