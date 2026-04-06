import JournalEntry from '../../models/finance/JournalEntry';

export class JournalNumberGenerator {
  static async generateJournalNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString();
    
    // Find the highest journal number for current year
    const lastEntry = await JournalEntry.findOne({
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

  static validateJournalNumber(entryNumber: string): boolean {
    return /^JE\d{4}\d{3,}$/.test(entryNumber);
  }
}