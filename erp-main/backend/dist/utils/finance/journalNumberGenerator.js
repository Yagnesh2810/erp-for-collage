"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalNumberGenerator = void 0;
const JournalEntry_1 = __importDefault(require("../../models/finance/JournalEntry"));
class JournalNumberGenerator {
    static async generateJournalNumber() {
        const currentYear = new Date().getFullYear();
        const yearPrefix = currentYear.toString();
        // Find the highest journal number for current year
        const lastEntry = await JournalEntry_1.default.findOne({
            entryNumber: { $regex: `^JE${yearPrefix}` }
        }).sort({ entryNumber: -1 });
        let nextNumber = 1;
        if (lastEntry) {
            const lastNumber = parseInt(lastEntry.entryNumber.substring(6)); // Remove "JE" + year
            nextNumber = lastNumber + 1;
        }
        // Format: JE2024001, JE2024002, etc.
        return `JE${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;
    }
    static validateJournalNumber(entryNumber) {
        return /^JE\d{4}\d{3,}$/.test(entryNumber);
    }
}
exports.JournalNumberGenerator = JournalNumberGenerator;
