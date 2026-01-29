import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Expense, Category } from '@/types';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

interface ExportButtonProps {
    expenses: Expense[];
    categories: Category[];
}

export function ExportButton({ expenses, categories }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const calculateTotals = () => {
        return expenses.reduce((acc, curr) => {
            if (curr.type === 'income') acc.income += curr.amount;
            else acc.expense += curr.amount;
            return acc;
        }, { income: 0, expense: 0 });
    };

    const handleExcel = () => {
        if (expenses.length === 0) return alert("No data to export.");
        exportToExcel(expenses, calculateTotals());
        setIsOpen(false);
    };

    const handlePDF = () => {
        if (expenses.length === 0) return alert("No data to export.");
        exportToPDF(expenses, calculateTotals(), categories);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
                Export ⬇
            </Button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 50,
                    minWidth: '120px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <button
                        onClick={handleExcel}
                        style={{
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-main)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0.25rem'
                        }}
                    >
                        Excel (.xlsx)
                    </button>
                    <button
                        onClick={handlePDF}
                        style={{
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-main)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0.25rem'
                        }}
                    >
                        PDF (.pdf)
                    </button>
                </div>
            )}

            {isOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 40 }}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
