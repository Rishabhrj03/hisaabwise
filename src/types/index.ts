export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO string
    type: 'income' | 'expense';
    category: string;
    // Splitwise features
    relatedTo?: string[]; // IDs of friends involved in split
    group_id?: string | null;
    splitDetails?: {
        paidBy: string; // 'me' or friendId
        shares: SplitShare[];
    };
}

export interface Friend {
    id: string;
    name: string;
    phone?: string | null;
    linked_user_id?: string | null;
    upi_id?: string;
}

export interface SplitShare {
    userId: string; // 'me' or friendId
    amount: number;
}

export interface Group {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
    members: string[]; // Array of Friend IDs
}

export interface GroupInput {
    name: string;
    memberIds: string[];
}

export interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    updateExpense: (id: string, expense: Omit<Expense, 'id'>) => Promise<void>;
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
}
