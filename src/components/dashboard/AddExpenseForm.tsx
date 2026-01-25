import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Expense } from '@/types';

interface AddExpenseFormProps {
    onClose?: () => void;
    initialData?: Expense;
}

export function AddExpenseForm({ onClose, initialData }: AddExpenseFormProps) {
    const { addExpense, updateExpense } = useExpenses();
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
    const [category, setCategory] = useState(initialData?.category || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const expenseData = {
            description,
            amount: parseFloat(amount),
            type,
            category: category || 'General',
            date: initialData?.date || new Date().toISOString(),
        };

        if (initialData) {
            updateExpense(initialData.id, expenseData);
        } else {
            addExpense(expenseData);
        }

        // Reset form
        setDescription('');
        setAmount('');
        setCategory('');
        if (onClose) onClose();
    };

    return (
        <Card variant="glass" className="glass-panel">
            <h2 style={{ marginBottom: '1.5rem' }}>{initialData ? 'Edit Transaction' : 'Add New Transaction'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Type Selection */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Button
                        type="button"
                        variant={type === 'expense' ? 'danger' : 'secondary'}
                        onClick={() => setType('expense')}
                        style={{ flex: 1 }}
                    >
                        Expense
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'income' ? 'primary' : 'secondary'} // Use primary (greenish if refined) for income
                        onClick={() => setType('income')}
                        style={{
                            flex: 1,
                            backgroundColor: type === 'income' ? 'hsl(var(--color-income))' : undefined,
                            borderColor: type === 'income' ? 'transparent' : undefined,
                            color: type === 'income' ? '#fff' : undefined
                        }}
                    >
                        Income
                    </Button>
                </div>

                <Input
                    label="Description"
                    placeholder="e.g. Groceries"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <label style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'hsl(var(--color-text-muted))'
                    }}>
                        Category
                    </label>
                    <select
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'hsl(var(--color-surface))',
                            color: 'hsl(var(--color-text-main))',
                            fontSize: '1rem',
                            outline: 'none',
                            appearance: 'none', // Remove default arrow for custom styling if desired, but keeping default for simplicity/accessibility
                            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4L146.2%20210.2c-5.3%205.3-13.8%205.3-19.1%200L11.5%2069.4c-5.3-5.3-5.3-13.8%200-19.1l8.5-8.5c5.3-5.3%2013.8-5.3%2019.1%200L136%20136l96-94.2c5.3-5.3%2013.8-5.3%2019.1%200l8.5%208.5c5.3%205.3%205.3%2013.8%200%2019.1z%22%2F%3E%3C%2Fsvg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.7rem top 50%',
                            backgroundSize: '0.65rem auto',
                        }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        {type === 'expense' ? (
                            <>
                                <option value="Food">Food & Dining</option>
                                <option value="Transport">Transportation</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Bills">Bills & Utilities</option>
                                <option value="Health">Health & Fitness</option>
                                <option value="Other">Other</option>
                            </>
                        ) : (
                            <>
                                <option value="Salary">Salary</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Investments">Investments</option>
                                <option value="Gift">Gift</option>
                                <option value="Other">Other</option>
                            </>
                        )}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Button type="submit" style={{ flex: 1 }}>
                        {initialData ? 'Update Transaction' : 'Add Transaction'}
                    </Button>
                    {onClose && (
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}
