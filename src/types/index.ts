export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO string
    type: 'income' | 'expense';
    category: string;
    // Splitwise features
    relatedTo?: string[]; // IDs of friends involved
    splitDetails?: {
        paidBy: string; // 'me' or friendId
        shares: SplitShare[];
    };
}

export interface Friend {
    id: string;
    name: string;
}

export interface SplitShare {
    userId: string; // 'me' or friendId
    amount: number;
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
