import { Expense } from '@/types';
import { determineCategory } from '@/utils/categoryDetector';

/** Result returned by PDF parser — a list of parsed transactions. */
export type ParsedTransaction = Omit<Expense, 'id'>;

/**
 * pdfParser.ts — Extracts bank transactions from a PDF statement.
 *
 * Supports multiple bank formats:
 *   Strategy 1: PhonePe statement format
 *   Strategy 2: Axis Bank / standard DD/MM/YYYY tabular format
 *   Strategy 3: Generic fallback (any date + amount pair)
 *
 * Extracted from ImportButton (SRP). Only import/export concerns live here.
 * Duplicate detection is the caller's responsibility (ImportButton).
 */

export async function parsePDF(
  file: File,
  password?: string
): Promise<ParsedTransaction[]> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const params: Record<string, unknown> = { data: arrayBuffer };
  if (password) params.password = password;

  const pdf = await pdfjsLib.getDocument(params).promise;
  const results: ParsedTransaction[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{ transform: number[]; str: string }>;

    // Group text items by their Y-coordinate (fuzzy grouping to handle sub-pixel diffs).
    const rows: { y: number; items: typeof items }[] = [];
    items.forEach((item) => {
      const y = item.transform[5];
      const row = rows.find((r) => Math.abs(r.y - y) < 5);
      if (row) {
        row.items.push(item);
      } else {
        rows.push({ y, items: [item] });
      }
    });

    // Process rows top-to-bottom, left-to-right.
    rows.sort((a, b) => b.y - a.y);

    for (const row of rows) {
      row.items.sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = row.items.map((item) => item.str).join(' ').trim();

      const transaction = tryParsePhonePe(lineText) ?? tryParseStandard(lineText) ?? tryParseGeneric(lineText);
      if (transaction) results.push(transaction);
    }
  }

  return results;
}

// ─── Private parsing strategies ──────────────────────────────────────────────

function tryParsePhonePe(lineText: string): ParsedTransaction | null {
  const dateMatch = lineText.match(/([A-Z][a-z]{2}\s\d{1,2},\s\d{4})/);
  const amountMatch = lineText.match(/INR\s([\d,]+\.\d{2})/);

  if (!dateMatch || !amountMatch) return null;

  const rawDate = dateMatch[0];
  const rawAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(rawAmount)) return null;

  const isCredit = lineText.toLowerCase().includes(' credit');
  const type: 'income' | 'expense' = isCredit ? 'income' : 'expense';

  const description = lineText
    .replace(rawDate, '')
    .replace(amountMatch[0], '')
    .replace(/Debit/i, '')
    .replace(/Credit/i, '')
    .replace(/INR/i, '')
    .replace(/^Paid to /i, '')
    .trim();

  return {
    description,
    amount: Math.abs(rawAmount),
    type,
    category: determineCategory(description),
    date: new Date(rawDate).toISOString(),
  };
}

function tryParseStandard(lineText: string): ParsedTransaction | null {
  const dateMatch = lineText.match(/^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
  const currencyAmounts = [...lineText.matchAll(/([\d,]+\.\d{2})(\s?Dr|\s?Cr)?/g)].map((m) => m[0]);

  if (!dateMatch || currencyAmounts.length < 1) return null;

  const rawDate = dateMatch[0];
  const amountStr =
    currencyAmounts.length > 1 ? currencyAmounts[currencyAmounts.length - 2] : currencyAmounts[0];
  const transactionAmount = parseFloat(amountStr.replace(/,/g, '').replace('Dr', '').replace('Cr', ''));

  if (isNaN(transactionAmount) || transactionAmount === 0) return null;

  const isCredit =
    lineText.toLowerCase().includes(' cr') || lineText.toLowerCase().includes(' credit');
  const isDebit =
    lineText.toLowerCase().includes(' dr') ||
    lineText.toLowerCase().includes(' debit') ||
    lineText.toLowerCase().includes(' withdrawal');

  let description = lineText.replace(rawDate, '');
  currencyAmounts.forEach((amt) => (description = description.replace(amt, '')));
  description = description.replace(/\s+/g, ' ').replace(/balance/gi, '').trim();

  if (!description) return null;

  let type: 'income' | 'expense' = 'expense';
  if (isCredit) type = 'income';
  else if (!isDebit) {
    if (
      determineCategory(description) === 'Salary' ||
      description.toLowerCase().includes('deposit') ||
      description.toLowerCase().includes('credit interest')
    ) {
      type = 'income';
    }
  }

  return {
    description,
    amount: Math.abs(transactionAmount),
    type,
    category: determineCategory(description),
    date: parseDDMMYYYY(rawDate),
  };
}

function tryParseGeneric(lineText: string): ParsedTransaction | null {
  if (/opening balance|brought forward|total|carried forward/i.test(lineText)) return null;

  const dateMatch = lineText.match(
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|([A-Z][a-z]{2}\s\d{1,2},?\s\d{4})/
  );
  const amountMatch = lineText.match(/[\d,]+\.\d{2}/);

  if (!dateMatch || !amountMatch) return null;

  const rawAmount = parseFloat(amountMatch[0].replace(/,/g, ''));
  if (isNaN(rawAmount) || rawAmount === 0) return null;

  let description = lineText
    .replace(dateMatch[0], '')
    .replace(amountMatch[0], '')
    .replace(/Cr|Dr/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (description.length < 3) return null;

  const type: 'income' | 'expense' = /credit|deposit|salary|refund/i.test(lineText)
    ? 'income'
    : 'expense';

  let isoDate: string;
  try {
    if (dateMatch[0].match(/^\d/)) {
      isoDate = parseDDMMYYYY(dateMatch[0]);
    } else {
      isoDate = new Date(dateMatch[0]).toISOString();
    }
  } catch {
    isoDate = new Date().toISOString();
  }

  return {
    description,
    amount: rawAmount,
    type,
    category: determineCategory(description),
    date: isoDate,
  };
}

/** Parses a DD/MM/YYYY or DD-MM-YY style date string into an ISO string. */
function parseDDMMYYYY(raw: string): string {
  const parts = raw.split(/[\/\-\.]/);
  if (parts.length !== 3) return new Date(raw).toISOString();

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
  return new Date(year, month, day).toISOString();
}
