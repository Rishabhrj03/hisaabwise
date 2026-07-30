import * as XLSX from 'xlsx';
import { Expense } from '@/types';
import { determineCategory } from '@/utils/categoryDetector';

/** Result returned by XLSX parser — a list of parsed transactions. */
export type ParsedTransaction = Omit<Expense, 'id'>;

/**
 * xlsxParser.ts — Extracts bank transactions from an XLSX / CSV file.
 *
 * Auto-detects column positions using header keywords (Date, Description,
 * Amount, Debit, Credit, etc.) so it works with most bank export formats.
 *
 * Extracted from ImportButton (SRP). Duplicate detection is the caller's
 * responsibility (ImportButton).
 */
export function parseXlsx(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

        if (!data || data.length === 0) {
          resolve([]);
          return;
        }

        const headers = (data[0] as unknown[]).map((h) => String(h).toLowerCase().trim());

        const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('tran date'));
        const descIdx = headers.findIndex(
          (h) =>
            h.includes('desc') || h.includes('particular') || h.includes('detail') || h.includes('narration')
        );
        const amountIdx = headers.findIndex(
          (h) => (h.includes('amount') || h.includes('txn amount')) && !h.includes('balance')
        );
        const debitIdx = headers.findIndex(
          (h) => h.includes('debit') || h === 'dr' || h.includes('withdrawal')
        );
        const creditIdx = headers.findIndex(
          (h) => h.includes('credit') || h === 'cr' || h.includes('deposit')
        );

        const results: ParsedTransaction[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i] as unknown[];
          if (!row || row.length === 0) continue;

          const rawDate = row[dateIdx];
          const description = String(row[descIdx] ?? 'Imported Transaction')
            .replace(/\s+/g, ' ')
            .trim();

          let amount = 0;
          let type: 'income' | 'expense' = 'expense';

          if (debitIdx !== -1 && creditIdx !== -1) {
            const debitVal = parseFloat(String(row[debitIdx])) || 0;
            const creditVal = parseFloat(String(row[creditIdx])) || 0;
            if (creditVal > 0) {
              amount = creditVal;
              type = 'income';
            } else if (debitVal > 0) {
              amount = debitVal;
              type = 'expense';
            }
          } else if (amountIdx !== -1 && row[amountIdx] != null) {
            const raw = parseFloat(String(row[amountIdx]));
            if (!isNaN(raw)) {
              amount = Math.abs(raw);
              if (raw < 0) {
                type = 'expense';
              } else {
                type =
                  determineCategory(description) === 'Salary' ||
                  description.toLowerCase().includes('deposit')
                    ? 'income'
                    : 'expense';
              }
            }
          }

          if (amount === 0) continue;

          let dateObj = new Date();
          if (typeof rawDate === 'number') {
            // Excel serial date number.
            dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
          } else if (rawDate) {
            dateObj = new Date(String(rawDate));
          }
          if (isNaN(dateObj.getTime())) dateObj = new Date();

          results.push({
            description,
            amount,
            type,
            category: determineCategory(description),
            date: dateObj.toISOString(),
          });
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsBinaryString(file);
  });
}
