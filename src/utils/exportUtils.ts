import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, Category } from '../types';

interface Totals {
    income: number;
    expense: number;
}

export const exportToExcel = (data: Expense[], totals: Totals) => {
    // 1. Format Data
    const formattedData = data.map(item => ({
        Date: new Date(item.date).toLocaleDateString(),
        Category: item.category,
        Description: item.description || '-',
        Type: item.type.toUpperCase(),
        Amount: item.type === 'expense' ? -item.amount : item.amount
    }));

    // 2. Add Totals Row
    formattedData.push({
        Date: '',
        Category: 'TOTALS',
        Description: '',
        Type: '',
        Amount: totals.income - totals.expense
    });

    formattedData.push({
        Date: '',
        Category: 'Total Income',
        Description: '',
        Type: '',
        Amount: totals.income
    });

    formattedData.push({
        Date: '',
        Category: 'Total Expense',
        Description: '',
        Type: '',
        Amount: -totals.expense
    });

    // 3. Create Worksheet
    const ws = utils.json_to_sheet(formattedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Expenses");

    // 4. Save
    writeFile(wb, `Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (data: Expense[], totals: Totals, categories: Category[]) => {
    const doc = new jsPDF();

    // Create color map
    const categoryColors: Record<string, [number, number, number]> = {};
    if (categories) {
        categories.forEach(c => {
            // Parse hex to rgb
            const hex = c.color.replace('#', '');
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                categoryColors[c.name] = [r, g, b];
            }
        });
    }

    // Title
    doc.setFontSize(18);
    doc.text("Expense Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // Table
    autoTable(doc, {
        startY: 35,
        head: [['Date', 'Category', 'Description', 'Amount']],
        body: data.map(item => [
            new Date(item.date).toLocaleDateString(),
            item.category,
            item.description || '-',
            item.type === 'expense' ? `-₹${item.amount}` : `+₹${item.amount}`
        ]),
        headStyles: {
            fillColor: [20, 20, 20], // Dark Header
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 4
        },
        columnStyles: {
            3: { halign: 'right', fontStyle: 'bold' } // Amount column
        },
        didParseCell: function (data) {
            // Color code the amounts
            if (data.section === 'body' && data.column.index === 3) {
                const rawVal = data.cell.raw as string;
                if (rawVal.startsWith('+')) {
                    data.cell.styles.textColor = [34, 197, 94]; // Green
                } else {
                    data.cell.styles.textColor = [239, 68, 68]; // Red
                }
            }
        },
        didDrawCell: function (data) {
            // Draw Pill for Category (Column 1)
            if (data.section === 'body' && data.column.index === 1) {
                const doc = data.doc;
                const { x, y, width, height } = data.cell;
                const categoryName = data.cell.raw as string;

                // Get color from map or default to gray
                const rgb = categoryColors[categoryName] || [229, 231, 235]; // Gray-200 default

                doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                doc.roundedRect(x + 2, y + 2, width - 4, height - 4, 3, 3, 'F');

                // Determine text color based on brightness
                const brightness = rgb[0] + rgb[1] + rgb[2];
                if (brightness > 450) doc.setTextColor(50, 50, 50); // Light background -> Dark text
                else doc.setTextColor(255, 255, 255); // Dark background -> White text

                doc.text(categoryName, x + width / 2, y + height / 2 + 1.5, { align: 'center' });

                return false;
            }
        }
    });

    // Totals Section
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 40;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, finalY + 10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Total Income: ₹${totals.income}`, 14, finalY + 18);

    doc.setTextColor(239, 68, 68); // Red
    doc.text(`Total Expenses: ₹${totals.expense}`, 14, finalY + 24);

    doc.setTextColor(0, 0, 0); // Black
    doc.text(`Net: ₹${totals.income - totals.expense}`, 14, finalY + 30);

    doc.save(`Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
