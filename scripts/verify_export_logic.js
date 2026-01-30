/* eslint-disable */
const expenseData = [
    { date: '2024-01-01', category: 'Food', description: 'Lunch', type: 'expense', amount: 150 },
    { date: '2024-01-02', category: 'Salary', description: 'Jan Salary', type: 'income', amount: 5000 },
    { date: '2024-01-03', category: 'Travel', description: 'Uber', type: 'expense', amount: 200 }
];

const totals = {
    income: 5000,
    expense: 350
};

// Simulate the logic from exportUtils.ts
const formattedData = expenseData.map(item => ({
    Date: new Date(item.date).toLocaleDateString(),
    Category: item.category,
    Description: item.description || '-',
    Type: item.type.toUpperCase(),
    Amount: item.type === 'expense' ? -item.amount : item.amount
}));

// Add Totals Row
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

console.log("--- Excel Data Preview ---");
console.table(formattedData);
