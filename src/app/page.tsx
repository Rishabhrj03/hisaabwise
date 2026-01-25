"use client";

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { ImportButton } from '@/components/dashboard/ImportButton';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';

import { Expense } from '@/types';

export default function Home() {
  const { expenses, deleteExpense } = useExpenses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter Logic
  const filteredExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate Totals for Filtered View
  const income = filteredExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = filteredExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;

  const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingExpense(null);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 1.5rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <MonthSelector
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ImportButton />
            <ExportButton
              expenses={filteredExpenses}
              currentMonthName={currentMonthName}
            />
          </div>
        </div>

        <SummaryCards
          totalBalance={balance}
          totalIncome={income}
          totalExpense={expense}
        />

        {/* Visual Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <CategoryPieChart expenses={filteredExpenses} />
          <WeeklyBarChart expenses={filteredExpenses} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Transactions</h2>
          <Button onClick={() => {
            setEditingExpense(null);
            setShowAddForm(!showAddForm);
          }}>
            {showAddForm ? 'Close Form' : 'Add New'}
          </Button>
        </div>

        {showAddForm && (
          <div className="animate-fade-in">
            <AddExpenseForm
              onClose={handleCloseForm}
              initialData={editingExpense || undefined}
            />
          </div>
        )}

        <TransactionList
          expenses={filteredExpenses}
          onDelete={deleteExpense}
          onEdit={handleEdit}
        />
      </main>

      <footer style={{
        padding: '2rem 0',
        textAlign: 'center',
        color: 'hsl(var(--color-text-muted))',
        fontSize: '0.875rem'
      }}>
        <p>&copy; {new Date().getFullYear()} Expense Tracker</p>
      </footer>
    </div>
  );
}
