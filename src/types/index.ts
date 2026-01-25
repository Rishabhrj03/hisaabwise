export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO string
    type: 'income' | 'expense';
    category: string;
}

export interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
    updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
}
