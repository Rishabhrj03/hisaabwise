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
import { GroupManager } from '@/components/dashboard/GroupManager';
import { DebtChart } from '@/components/dashboard/DebtChart';
import { BalanceList } from '@/components/dashboard/BalanceList';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { BankAccountCard } from '@/components/dashboard/BankAccountCard';
import { InvestmentCard } from '@/components/dashboard/InvestmentCard';
import { RecurringExpenseCard } from '@/components/dashboard/RecurringExpenseCard';
import { LoanCard } from '@/components/dashboard/LoanCard';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from '@/components/dashboard/VoiceInput';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export type SectionId =
  | 'dashboard'
  | 'budgets'
  | 'goals'
  | 'accounts'
  | 'investments'
  | 'loans'
  | 'recurring'
  | 'transactions';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* ── State ── */
  const { expenses, deleteExpense } = useExpenses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showStats, setShowStats] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [showFriendManager, setShowFriendManager] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-base)',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid var(--border-default)',
          borderTopColor: 'var(--brand-from)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading your dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  /* ── Data Computation ── */
  const filteredExpenses = expenses
    .filter((expense) => {
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

  const income = filteredExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = filteredExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = income - expense;
  const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentDate(p => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(p => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  const handleEdit = (exp: Expense) => { setEditingExpense(exp); setShowAddForm(true); };
  const handleCloseForm = () => { setShowAddForm(false); setTimeout(() => setEditingExpense(null), 300); };

  /* ── Section Meta ── */
  const sectionMeta: Record<SectionId, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Dashboard', subtitle: `${currentMonthName} overview` },
    budgets: { title: 'Monthly Budgets', subtitle: 'Set and track spending limits' },
    goals: { title: 'Savings Goals', subtitle: 'Monitor your saving milestones' },
    accounts: { title: 'Accounts & Cards', subtitle: 'Manage your bank accounts and cards' },
    investments: { title: 'Investments', subtitle: 'Track your portfolio and holdings' },
    loans: { title: 'Loans & Udhar', subtitle: 'Manage borrowed and lent money' },
    recurring: { title: 'Recurring', subtitle: 'Automatic and scheduled payments' },
    transactions: { title: 'Transactions', subtitle: `${filteredExpenses.length} transactions this month` },
  };

  const meta = sectionMeta[activeSection];

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─── */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* ─── Main Content ─── */}
      <main className="main-content">

        {/* ── Page Header Bar ── */}
        {/* ── Page Header Bar ── */}
        <div className="dashboard-header-bar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>

          {/* Left: Hamburger + Title (Ref. Image Typography) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open Menu"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.15,
                margin: 0,
              }}>
                HISAABWISE
              </h1>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginTop: '0.1rem',
              }}>
                Track Expense, Analyze Easily.
              </div>
            </div>
          </div>

          {/* Right: Month picker + Add button (only on dashboard / transactions) */}
          {(activeSection === 'dashboard' || activeSection === 'transactions') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <MonthSelector
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
              <Button
                className="desktop-only-btn"
                onClick={() => { setEditingExpense(null); setShowAddForm(true); }}
                tooltip="Add a new transaction"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
                  border: 'none', boxShadow: 'var(--shadow-brand)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Transaction
              </Button>
            </div>
          )}
        </div>


        {/* ══════════════════════════════════════
            SECTION VIEWS — rendered by activeSection
        ══════════════════════════════════════ */}

        {/* ── DASHBOARD ── */}
        {activeSection === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Stat cards */}
            <SummaryCards
              totalBalance={balance}
              totalIncome={income}
              totalExpense={expense}
              currency={currency}
            />

            {/* Toolbar */}
            <div className="toolbar" style={{ marginBottom: '2rem' }}>
              <ImportButton />
              <ExportButton expenses={filteredExpenses} currentMonthName={currentMonthName} />
              <button
                className={`toolbar-btn ${showStats ? 'active' : ''}`}
                onClick={() => setShowStats(!showStats)}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                {showStats ? 'Hide Analytics' : 'Show Analytics'}
              </button>
              <button className="toolbar-btn" onClick={() => setShowFriendManager(true)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Friends
              </button>
              <button className="toolbar-btn" onClick={() => setShowGroupManager(true)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 6c0-1.1.9-2 2-2h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V6z" />
                  <path d="M1 12h22" />
                </svg>
                Groups
              </button>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="toolbar-btn"
                style={{ cursor: 'pointer' }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
              <div style={{ marginLeft: 'auto' }}>
                <VoiceInput />
              </div>
            </div>

            {/* Analytics */}
            {showStats && (
              <div className="animate-fade-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem', marginBottom: '2rem',
              }}>
                <CategoryPieChart expenses={filteredExpenses} />
                <WeeklyBarChart expenses={filteredExpenses} />
                <DebtChart expenses={expenses} />
              </div>
            )}

            <TransactionList
              expenses={filteredExpenses.slice(0, 15)}
              onDelete={deleteExpense}
              onEdit={handleEdit}
              currency={currency}
            />


            {/* Balance list */}
            <div style={{ marginTop: '2rem' }}>
              <BalanceList />
            </div>
          </div>
        )}

        {/* ── BUDGETS ── */}
        {activeSection === 'budgets' && (
          <div className="animate-fade-in">
            <BudgetCard />
          </div>
        )}

        {/* ── SAVINGS GOALS ── */}
        {activeSection === 'goals' && (
          <div className="animate-fade-in">
            <GoalCard />
          </div>
        )}

        {/* ── ACCOUNTS & CARDS ── */}
        {activeSection === 'accounts' && (
          <div className="animate-fade-in">
            <BankAccountCard />
          </div>
        )}

        {/* ── INVESTMENTS ── */}
        {activeSection === 'investments' && (
          <div className="animate-fade-in">
            <InvestmentCard />
          </div>
        )}

        {/* ── LOANS & UDHAR ── */}
        {activeSection === 'loans' && (
          <div className="animate-fade-in">
            <LoanCard />
          </div>
        )}

        {/* ── RECURRING ── */}
        {activeSection === 'recurring' && (
          <div className="animate-fade-in">
            <RecurringExpenseCard />
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {activeSection === 'transactions' && (
          <div className="animate-fade-in">
            {/* Toolbar for transactions */}
            <div className="toolbar" style={{ marginBottom: '1.5rem' }}>
              <ImportButton />
              <ExportButton expenses={filteredExpenses} currentMonthName={currentMonthName} />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="toolbar-btn"
                style={{ cursor: 'pointer' }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
              <div style={{ marginLeft: 'auto' }}>
                <VoiceInput />
              </div>
            </div>
            <TransactionList
              expenses={filteredExpenses}
              onDelete={deleteExpense}
              onEdit={handleEdit}
              currency={currency}
            />
          </div>
        )}

        {/* ── Footer ── */}
        <footer style={{
          marginTop: '2.5rem', paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem',
        }}>
          <p>© {new Date().getFullYear()} HISAABWISE — Track Expense, Analyze Easily.</p>
        </footer>

      </main>

      {/* ─── Mobile Floating Action Button (Ref. Image Style) ─── */}
      <button
        className="mobile-fab-btn"
        onClick={() => { setEditingExpense(null); setShowAddForm(true); }}
        title="Add Transaction"
      >
        +
      </button>

      {/* ─── Modals ─── */}
      <Modal
        isOpen={showAddForm}
        onClose={handleCloseForm}
        title={editingExpense ? 'Edit Transaction' : 'Add New Transaction'}
      >
        <AddExpenseForm onClose={handleCloseForm} initialData={editingExpense || undefined} />
      </Modal>

      <Modal isOpen={showFriendManager} onClose={() => setShowFriendManager(false)} title="">
        <FriendManager />
      </Modal>

      <Modal isOpen={showGroupManager} onClose={() => setShowGroupManager(false)} title="">
        <GroupManager />
      </Modal>
    </div>
  );
}

