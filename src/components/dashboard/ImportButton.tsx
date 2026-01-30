import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';

export function ImportButton() {
    const { addExpense, expenses } = useExpenses();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to generate unique signature for a transaction
    const getTransactionSignature = (date: string, description: string, amount: number) => {
        // Normalize date to YYYY-MM-DD to ignore time differences from different sources
        const dateStr = new Date(date).toISOString().split('T')[0];
        const descStr = String(description).toLowerCase().replace(/\s+/g, ' ').trim();
        return `${dateStr}|${descStr}|${amount.toFixed(2)}`;
    };

    // Create a set of existing signatures for fast lookup
    const existingSignatures = new Set(
        expenses.map(e => getTransactionSignature(e.date, e.description, e.amount))
    );

    const isDuplicate = (date: string, description: string, amount: number) => {
        return existingSignatures.has(getTransactionSignature(date, description, amount));
    };

    const CATEGORY_KEYWORDS: Record<string, string> = {
        'coffee': 'Food', 'starbucks': 'Food', 'mcdonalds': 'Food', 'burger': 'Food', 'restaurant': 'Food', 'cafe': 'Food', 'swiggy': 'Food', 'zomato': 'Food', 'tea': 'Food', 'sandwich': 'Food', 'foods': 'Food',
        'uber': 'Transport', 'lyft': 'Transport', 'gas': 'Transport', 'petrol': 'Transport', 'shell': 'Transport', 'metro': 'Transport', 'bus': 'Transport', 'ola': 'Transport', 'fuel': 'Transport',
        'amazon': 'Shopping', 'target': 'Shopping', 'walmart': 'Shopping', 'zara': 'Shopping', 'clothing': 'Shopping', 'flipkart': 'Shopping', 'myntra': 'Shopping',
        'netflix': 'Bills', 'spotify': 'Bills', 'electric': 'Bills', 'water': 'Bills', 'internet': 'Bills', 'bill': 'Bills', 'recharge': 'Bills', 'jio': 'Bills', 'airtel': 'Bills',
        'salary': 'Salary', 'payroll': 'Salary', 'deposit': 'Salary', 'credit interest': 'Salary', 'interest': 'Salary'
    };

    const determineCategory = (description: string): string => {
        const lowerDesc = description.toLowerCase();
        for (const [key, category] of Object.entries(CATEGORY_KEYWORDS)) {
            if (lowerDesc.includes(key)) {
                return category;
            }
        }
        return 'Other';
    };

    const parsePDF = async (file: File, password?: string) => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

            const arrayBuffer = await file.arrayBuffer();

            const params: { data: ArrayBuffer; password?: string } = { data: arrayBuffer };
            if (password) {
                params.password = password;
            }

            const pdf = await pdfjsLib.getDocument(params).promise;
            let count = 0;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const items = textContent.items as { str: string; transform: number[] }[];

                // Fuzzy Y Grouping
                const rows: { y: number, items: { str: string; transform: number[] }[] }[] = [];
                items.forEach(item => {
                    const y = item.transform[5];
                    const row = rows.find(r => Math.abs(r.y - y) < 5);
                    if (row) {
                        row.items.push(item);
                    } else {
                        rows.push({ y, items: [item] });
                    }
                });

                rows.sort((a, b) => b.y - a.y);

                for (const row of rows) {
                    row.items.sort((a, b) => a.transform[4] - b.transform[4]);
                    const lineText = row.items.map(item => item.str).join(' ').trim();

                    // STRATEGY 1: PhonePe Format
                    const ppDateMatch = lineText.match(/([A-Z][a-z]{2}\s\d{1,2},\s\d{4})/);
                    const ppAmountMatch = lineText.match(/INR\s([\d,]+\.\d{2})/);

                    if (ppDateMatch && ppAmountMatch) {
                        const rawDate = ppDateMatch[0];
                        const rawAmount = parseFloat(ppAmountMatch[1].replace(/,/g, ''));

                        const isDebit = lineText.toLowerCase().includes(' debit');
                        const isCredit = lineText.toLowerCase().includes(' credit');

                        const description = lineText
                            .replace(rawDate, '')
                            .replace(ppAmountMatch[0], '')
                            .replace(/Debit/i, '')
                            .replace(/Credit/i, '')
                            .replace(/INR/i, '')
                            .replace(/^Paid to /i, '')
                            .trim();

                        let type: 'income' | 'expense' = 'expense';
                        if (isCredit) type = 'income';
                        else if (isDebit) type = 'expense';

                        if (isNaN(rawAmount)) continue;

                        const isoDate = new Date(rawDate).toISOString();

                        // Duplicate Check
                        if (isDuplicate(isoDate, description, Math.abs(rawAmount))) {
                            continue;
                        }

                        addExpense({
                            description,
                            amount: Math.abs(rawAmount),
                            type,
                            category: determineCategory(description),
                            date: isoDate
                        });
                        count++;
                        continue;
                    }

                    // STRATEGY 2: Axis Bank / Standard Format
                    const stdDateMatch = lineText.match(/^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
                    const currencyAmounts = [...lineText.matchAll(/([\d,]+\.\d{2})(\s?Dr|\s?Cr)?/g)].map(m => m[0]);

                    if (stdDateMatch && currencyAmounts.length >= 1) {
                        const rawDate = stdDateMatch[0];
                        const amountStr = currencyAmounts.length > 1 ? currencyAmounts[currencyAmounts.length - 2] : currencyAmounts[0];
                        const transactionAmount = parseFloat(amountStr.replace(/,/g, '').replace('Dr', '').replace('Cr', ''));

                        const isCredit = lineText.toLowerCase().includes(' cr') || lineText.toLowerCase().includes(' credit');
                        const isDebit = lineText.toLowerCase().includes(' dr') || lineText.toLowerCase().includes(' debit') || lineText.toLowerCase().includes(' withdrawal');

                        let description = lineText.replace(rawDate, '');
                        currencyAmounts.forEach(amt => description = description.replace(amt, ''));
                        description = description.replace(/\s+/g, ' ').trim();
                        description = description.replace(/balance/gi, '').trim();

                        if (!description) continue;

                        let type: 'income' | 'expense' = 'expense';
                        if (isCredit) type = 'income';
                        else if (isDebit) type = 'expense';
                        else {
                            if (determineCategory(description) === 'Salary' || description.toLowerCase().includes('deposit') || description.toLowerCase().includes('credit interest')) {
                                type = 'income';
                            } else {
                                type = 'expense';
                            }
                        }

                        if (isNaN(transactionAmount) || transactionAmount === 0) continue;

                        const datePart = rawDate.replace(/-/g, '/');
                        const parts = datePart.split(/[\/\-\.]/);
                        let isoDate = new Date().toISOString();
                        if (parts.length === 3) {
                            const day = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1;
                            const year = parseInt(parts[2]);
                            isoDate = (year < 100 ? new Date(2000 + year, month, day) : new Date(year, month, day)).toISOString();
                        } else {
                            isoDate = new Date(rawDate).toISOString();
                        }

                        // Duplicate Check
                        if (isDuplicate(isoDate, description, Math.abs(transactionAmount))) {
                            continue;
                        }

                        addExpense({
                            description,
                            amount: Math.abs(transactionAmount),
                            type,
                            category: determineCategory(description),
                            date: isoDate
                        });
                        count++;
                        continue;
                    }

                    // STRATEGY 3: Generic Fallback
                    // Look for any date and any amount in the line
                    const genericDateMatch = lineText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|([A-Z][a-z]{2}\s\d{1,2},?\s\d{4})/);
                    const genericAmountMatch = lineText.match(/[\d,]+\.\d{2}/);

                    if (genericDateMatch && genericAmountMatch) {
                        // Skip lines that look like headers/footers
                        if (/opening balance|brought forward|total|carried forward/i.test(lineText)) continue;

                        const rawDate = genericDateMatch[0];
                        const rawAmountStr = genericAmountMatch[0];
                        const rawAmount = parseFloat(rawAmountStr.replace(/,/g, ''));

                        if (isNaN(rawAmount) || rawAmount === 0) continue;

                        let description = lineText
                            .replace(rawDate, '')
                            .replace(rawAmountStr, '')
                            .replace(/Cr|Dr/gi, '')
                            .trim();

                        // Clean up description symbols
                        description = description.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
                        if (description.length < 3) continue; // Too short, probably noise

                        // Guess type based on keywords
                        let type: 'income' | 'expense' = 'expense';
                        if (/credit|deposit|salary|refund/i.test(lineText)) type = 'income';

                        let isoDate = new Date().toISOString();
                        try {
                            if (rawDate.match(/^\d/)) {
                                // Assume DD/MM/YYYY or similar
                                const parts = rawDate.split(/[\/\-\.]/);
                                if (parts.length === 3) {
                                    const day = parseInt(parts[0]);
                                    const month = parseInt(parts[1]) - 1;
                                    const year = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2]);
                                    isoDate = new Date(year, month, day).toISOString();
                                }
                            } else {
                                // Assume text date like Matches 'Jan 01, 2024'
                                isoDate = new Date(rawDate).toISOString();
                            }
                        } catch {
                            // Fallback to today if date parse fails
                        }

                        if (isDuplicate(isoDate, description, rawAmount)) continue;

                        addExpense({
                            description,
                            amount: rawAmount,
                            type,
                            category: determineCategory(description),
                            date: isoDate
                        });
                        count++;
                    }
                }
            }
            alert(`Imported ${count} transactions from PDF.`);
        } catch (e: unknown) {
            console.error("PDF Parsing Error", e);
            const err = e as Error;
            if (err.name === 'PasswordException' || err.message?.includes('password')) {
                const userPassword = prompt("This PDF is password protected. Please enter the password:");
                if (userPassword) {
                    parsePDF(file, userPassword);
                    return;
                }
            }
            alert(`Failed to parse PDF: ${err.message || String(e)}.`);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            parsePDF(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (!data || data.length === 0) return;

            const headers = (data[0] as unknown[]).map(h => String(h).toLowerCase().trim());

            const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('tran date'));
            const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('particular') || h.includes('detail') || h.includes('narration'));
            const amountIdx = headers.findIndex(h => (h.includes('amount') || h.includes('txn amount')) && !h.includes('balance'));
            const debitIdx = headers.findIndex(h => h.includes('debit') || h === 'dr' || h.includes('withdrawal'));
            const creditIdx = headers.findIndex(h => h.includes('credit') || h === 'cr' || h.includes('deposit'));

            let count = 0;
            for (let i = 1; i < data.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const row = data[i] as any[];
                if (!row || row.length === 0) continue;

                const rawDate = row[dateIdx];
                const description = row[descIdx] || 'Imported Transaction';

                let amount = 0;
                let type: 'income' | 'expense' = 'expense';

                if (debitIdx !== -1 && creditIdx !== -1) {
                    const debitVal = parseFloat(row[debitIdx]) || 0;
                    const creditVal = parseFloat(row[creditIdx]) || 0;
                    if (creditVal > 0) { amount = creditVal; type = 'income'; }
                    else if (debitVal > 0) { amount = debitVal; type = 'expense'; }
                } else if (amountIdx !== -1) {
                    const rawAmount = row[amountIdx];
                    if (rawAmount) {
                        amount = parseFloat(rawAmount);
                        if (amount < 0) type = 'expense';
                        else {
                            if (determineCategory(description as string) === 'Salary' || String(description).toLowerCase().includes('deposit')) {
                                type = 'income';
                            } else {
                                type = 'expense';
                            }
                        }
                        amount = Math.abs(amount);
                    }
                }

                if (amount === 0) continue;

                let dateObj = new Date();
                if (typeof rawDate === 'number') {
                    dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                } else if (rawDate) {
                    dateObj = new Date(rawDate);
                }
                if (isNaN(dateObj.getTime())) dateObj = new Date();

                const isoDate = dateObj.toISOString();
                const descStr = String(description).replace(/\s+/g, ' ').trim();

                // Duplicate Check
                if (isDuplicate(isoDate, descStr, amount)) {
                    continue;
                }

                addExpense({
                    description: descStr,
                    amount,
                    type,
                    category: determineCategory(description as string),
                    date: isoDate
                });
                count++;
            }

            alert(`Successfully imported ${count} transactions!`);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
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
