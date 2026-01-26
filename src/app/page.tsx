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
import { FriendManager } from '@/components/dashboard/FriendManager';
import { BalanceList } from '@/components/dashboard/BalanceList';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from '@/components/dashboard/VoiceInput';
import { useExpenses } from '@/context/ExpenseContext';

import { Expense } from '@/types';

import { Modal } from '@/components/ui/Modal';

export default function Home() {
  const { expenses, deleteExpense } = useExpenses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // New state for toggling graphs
  const [showStats, setShowStats] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [showFriendManager, setShowFriendManager] = useState(false);

  // Filter Logic
  const filteredExpenses = expenses
    .filter((expense) => {
      // Splitwise Filter: Hide if not involved
      if (expense.splitDetails) {
        const isPayer = expense.splitDetails.paidBy === 'me';
        const isInvolved = expense.splitDetails.shares.some(s => s.userId === 'me');
        if (!isPayer && !isInvolved) return false;
      }

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
    setTimeout(() => setEditingExpense(null), 300); // Small delay to prevent clearing while closing animation
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 1rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <MonthSelector
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <ImportButton />
            <ExportButton
              expenses={filteredExpenses}
              currentMonthName={currentMonthName}
            />

            <Button variant="secondary" size="sm" onClick={() => setShowStats(!showStats)} tooltip={showStats ? "Hide visual analytics" : "Show visual analytics"}>
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>

            <Button variant="secondary" size="sm" onClick={() => setShowFriendManager(true)} tooltip="Manage friends for splitting expenses">
              Friends
            </Button>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                height: '32px',
                padding: '0 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--color-border))',
                background: 'hsl(var(--color-surface))',
                color: 'hsl(var(--color-text-main))',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        <SummaryCards
          totalBalance={balance}
          totalIncome={income}
          totalExpense={expense}
          currency={currency}
        />

        {/* Visual Analytics - Collapsible */}
        {showStats && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <CategoryPieChart expenses={filteredExpenses} />
            <WeeklyBarChart expenses={filteredExpenses} />
          </div>
        )}

        <BalanceList />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Transactions</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <VoiceInput />
            <Button onClick={() => {
              setEditingExpense(null);
              setShowAddForm(true);
            }} tooltip="Add a new transaction">
              Add New
            </Button>
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 100
        }}>
          <Button
            variant="primary"
            style={{
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              padding: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}
            onClick={() => {
              setEditingExpense(null);
              setShowAddForm(true);
            }}
            tooltip="Add New Transaction"
          >
            +
          </Button>
        </div>

        {/* Modal for Add/Edit Form */}
        <Modal
          isOpen={showAddForm}
          onClose={handleCloseForm}
          title={editingExpense ? "Edit Transaction" : "Add New Transaction"}
        >
          <AddExpenseForm
            onClose={handleCloseForm}
            initialData={editingExpense || undefined}
          />
        </Modal>

        {/* Friend Manager Modal */}
        <Modal
          isOpen={showFriendManager}
          onClose={() => setShowFriendManager(false)}
          title=""
        >
          <FriendManager />
        </Modal>

        <TransactionList
          expenses={filteredExpenses}
          onDelete={deleteExpense}
          onEdit={handleEdit}
          currency={currency}
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
