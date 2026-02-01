/** @jest-environment jsdom */
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { sendGTMEvent } from '@next/third-parties/google';

jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, Category } from '@/types';

// Mock dependencies
jest.mock('xlsx', () => ({
    utils: {
        json_to_sheet: jest.fn(),
        book_new: jest.fn(),
        book_append_sheet: jest.fn(),
    },
    writeFile: jest.fn(),
}));

const mockDoc = {
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    setFillColor: jest.fn(),
    roundedRect: jest.fn(),
    lastAutoTable: { finalY: 50 }
};

jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => mockDoc);
});

jest.mock('jspdf-autotable', () => jest.fn());

const mockDate = new Date('2023-01-01');

describe('exportUtils', () => {
    const mockData: Expense[] = [
        { id: '1', date: mockDate.toISOString(), category: 'Food', amount: 100, type: 'expense', description: 'Lunch' },
        { id: '2', date: mockDate.toISOString(), category: 'Salary', amount: 5000, type: 'income', description: 'Jan Salary' }
    ];

    const mockTotals = { income: 5000, expense: 100 };
    const mockCategories: Category[] = [{ _id: 'c1', name: 'Food', color: '#FF0000', is_default: false }];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('exportToExcel', () => {
        it('should format data correctly and call writeFile', () => {
            exportToExcel(mockData, mockTotals);

            expect(utils.json_to_sheet).toHaveBeenCalled();

            const callArgs = (utils.json_to_sheet as jest.Mock).mock.calls[0][0];

            expect(callArgs[0]).toEqual(expect.objectContaining({
                Category: 'Food',
                Amount: -100,
                Type: 'EXPENSE'
            }));

            expect(callArgs[1]).toEqual(expect.objectContaining({
                Category: 'Salary',
                Amount: 5000,
                Type: 'INCOME'
            }));

            const totalsRow = callArgs.find((r: any) => r.Category === 'TOTALS');
            expect(totalsRow).toBeDefined();
            expect(totalsRow.Amount).toBe(4900);

            expect(utils.book_new).toHaveBeenCalled();
            expect(utils.book_append_sheet).toHaveBeenCalled();
            expect(writeFile).toHaveBeenCalled();
        });
    });

    describe('exportToPDF', () => {
        it('should generate PDF and save it', () => {
            exportToPDF(mockData, mockTotals, mockCategories);

            expect(jsPDF).toHaveBeenCalled();

            // Verify mockDoc methods called
            expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('Expense Report'), expect.any(Number), expect.any(Number));

            expect(autoTable).toHaveBeenCalled();
            const autoTableCalls = (autoTable as unknown as jest.Mock).mock.calls;
            // autoTable(doc, options)
            expect(autoTableCalls[0][1]).toEqual(expect.objectContaining({
                head: [['Date', 'Category', 'Description', 'Amount']]
            }));

            expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('Total Income: ₹5000'), expect.any(Number), expect.any(Number));
            expect(mockDoc.save).toHaveBeenCalledWith(expect.stringContaining('Expense_Report'));
        });
    });
});
