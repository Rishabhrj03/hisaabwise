import React, { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';
import { parsePDF } from '@/utils/statementParsers/pdfParser';
import { parseXlsx } from '@/utils/statementParsers/xlsxParser';
import { Expense } from '@/types';

/**
 * ImportButton — Orchestrates file selection and delegates parsing to
 * dedicated parser utilities (pdfParser / xlsxParser).
 *
 * This component is responsible only for:
 *  1. Triggering the file picker
 *  2. Routing the file to the correct parser
 *  3. Deduplicating results against existing expenses
 *  4. Calling addExpense for each new transaction
 */
export function ImportButton() {
  const { addExpense, expenses } = useExpenses();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Generates a stable signature for an expense to detect duplicates. */
  const getSignature = (date: string, description: string, amount: number): string => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const descStr = String(description).toLowerCase().replace(/\s+/g, ' ').trim();
    return `${dateStr}|${descStr}|${amount.toFixed(2)}`;
  };

  const existingSignatures = new Set(
    expenses.map((e) => getSignature(e.date, e.description, e.amount))
  );

  const isDuplicate = (tx: Omit<Expense, 'id'>): boolean =>
    existingSignatures.has(getSignature(tx.date, tx.description, tx.amount));

  const importTransactions = async (transactions: Omit<Expense, 'id'>[]): Promise<void> => {
    const newTransactions = transactions.filter((tx) => !isDuplicate(tx));
    for (const tx of newTransactions) {
      await addExpense(tx);
    }
    alert(`Imported ${newTransactions.length} new transactions (${transactions.length - newTransactions.length} duplicates skipped).`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const transactions = await parsePDF(file);
        await importTransactions(transactions);
      } else {
        const transactions = await parseXlsx(file);
        await importTransactions(transactions);
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === 'PasswordException' || error.message?.includes('password')) {
        const password = prompt('This PDF is password protected. Please enter the password:');
        if (password && file) {
          try {
            const transactions = await parsePDF(file, password);
            await importTransactions(transactions);
          } catch (innerErr) {
            alert(`Failed to parse PDF: ${(innerErr as Error).message}`);
          }
        }
      } else {
        alert(`Import failed: ${error.message ?? String(err)}`);
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv, .xlsx, .xls, .pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        Import Statement
      </Button>
    </>
  );
}
