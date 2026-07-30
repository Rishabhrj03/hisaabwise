/**
 * categoryDetector.ts — Keyword-based transaction category detection.
 *
 * Extracted from ImportButton so it can be reused by any importer (PDF, XLSX, CSV, etc.)
 * without duplicating logic. Add new keywords here; no other file needs to change.
 */

const CATEGORY_KEYWORDS: Record<string, string> = {
  // Food & Dining
  coffee: 'Food', starbucks: 'Food', mcdonalds: 'Food', burger: 'Food',
  restaurant: 'Food', cafe: 'Food', swiggy: 'Food', zomato: 'Food',
  tea: 'Food', sandwich: 'Food', foods: 'Food',
  // Transportation
  uber: 'Transport', lyft: 'Transport', gas: 'Transport', petrol: 'Transport',
  shell: 'Transport', metro: 'Transport', bus: 'Transport', ola: 'Transport',
  fuel: 'Transport',
  // Shopping
  amazon: 'Shopping', target: 'Shopping', walmart: 'Shopping', zara: 'Shopping',
  clothing: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping',
  // Bills & Utilities
  netflix: 'Bills', spotify: 'Bills', electric: 'Bills', water: 'Bills',
  internet: 'Bills', bill: 'Bills', recharge: 'Bills', jio: 'Bills', airtel: 'Bills',
  // Income / Salary
  salary: 'Salary', payroll: 'Salary', deposit: 'Salary',
  'credit interest': 'Salary', interest: 'Salary',
};

/**
 * Returns a category string for the given transaction description.
 * Falls back to 'Other' if no keyword matches.
 */
export function determineCategory(description: string): string {
  const lowerDesc = description.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lowerDesc.includes(keyword)) {
      return category;
    }
  }
  return 'Other';
}
