import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/Button';
import { Expense } from '@/types';

interface ExportButtonProps {
    expenses: Expense[];
    currentMonthName: string;
}

export function ExportButton({ expenses, currentMonthName }: ExportButtonProps) {
    const handleExport = () => {
        if (expenses.length === 0) {
            alert("No data to export for this month.");
            return;
        }

        // 1. Prepare Transactions Data
        const transactionData = expenses.map(e => ({
            Date: new Date(e.date).toLocaleDateString(),
            Type: e.type,
            Category: e.category,
            Description: e.description,
            Amount: e.amount
        }));

        // 2. Prepare Category Summary Data (for Pie Chart)
        const categoryMap = expenses
            .filter(e => e.type === 'expense') // Usually pie charts focus on expenses
            .reduce((acc, curr) => {
                const cat = curr.category || 'Uncategorized';
                acc[cat] = (acc[cat] || 0) + curr.amount;
                return acc;
            }, {} as Record<string, number>);

        const summaryData = Object.entries(categoryMap).map(([Category, Total]) => ({
            Category,
            Total
        }));

        // 3. Create Workbook and Sheets
        const wb = XLSX.utils.book_new();

        const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
        XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");

        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Category Summary");

        // 4. Generate Buffer
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // 5. Create Blob and Trigger Download
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Expense_Tracker_${currentMonthName.replace(/\s+/g, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    };

    return (
        <Button variant="secondary" onClick={handleExport} size="sm">
            Export
        </Button>
    );
}
