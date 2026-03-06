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
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { BankAccountCard } from '@/components/dashboard/BankAccountCard';
import { InvestmentCard } from '@/components/dashboard/InvestmentCard';
import { RecurringExpenseCard } from '@/components/dashboard/RecurringExpenseCard';
import { LoanCard } from '@/components/dashboard/LoanCard';
import { CategoryManager } from '@/components/dashboard/CategoryManager';
import { BalanceList } from '@/components/dashboard/BalanceList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ProfileModal } from '@/components/dashboard/ProfileModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VoiceInput } from '@/components/dashboard/VoiceInput';
import { useExpenses } from '@/context/ExpenseContext';

import { Expense } from '@/types';
import { ShareDashboardModal } from '@/components/dashboard/ShareDashboardModal';
import { Modal } from '@/components/ui/Modal';
import CalculatorModal from '@/components/calculators/CalculatorModal';
import { MobileNav } from '@/components/layout/MobileNav';
import { MoreHorizontal, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* Hook Calls - Must be unconditional */
  const { expenses, deleteExpense, categories } = useExpenses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // New state for toggling graphs
  const [showStats, setShowStats] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [showFriendManager, setShowFriendManager] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showMobileBalances, setShowMobileBalances] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showMobileExport, setShowMobileExport] = useState(false);
  const [showCalculators, setShowCalculators] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  /* Early Returns */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null; // Prevent flash of content before redirect

  // Enforce Verification
  if (!user.isEmailVerified && !user.isPhoneVerified) {
    router.push('/verification');
    return null;
  }

  // Filter Logic
  console.log('DEBUG: All Expenses:', expenses.length, expenses);
  console.log('DEBUG: Current Date:', currentDate.toISOString());

  const filteredExpenses = expenses
    .filter((expense) => {
      // Splitwise Filter: Hide if not involved
      if (expense.splitDetails && expense.splitDetails.shares && expense.splitDetails.shares.length > 0) {
        // Fix: Check against 'me' OR the actual user ID
        const currentUserId = user.id;
        const isPayer = expense.splitDetails.paidBy === 'me' || expense.splitDetails.paidBy === currentUserId;
        const isInvolved = expense.splitDetails.shares.some(s => s.userId === 'me' || s.userId === currentUserId);

        if (!isPayer && !isInvolved) return false;
      }

      const expenseDate = new Date(expense.date);
      if (isNaN(expenseDate.getTime())) return true; // Show invalid dates rather than hiding them

      // Use local year/month for comparison
      return (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper to get my share of an expense (Issue 3 Fix)
  const getEffectiveAmount = (expense: Expense) => {
    if (!expense.splitDetails || !expense.splitDetails.shares || expense.splitDetails.shares.length === 0) {
      return expense.amount;
    }
    // If split exists, find my share
    const currentUserId = user.id;
    const myShare = expense.splitDetails.shares.find(s => s.userId === 'me' || s.userId === currentUserId);
    return myShare ? myShare.amount : 0; // If I'm not involved (should be filtered out, but safety), 0.
  };

  // Calculate Totals for Filtered View
  const income = filteredExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);

  const expense = filteredExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, item) => sum + getEffectiveAmount(item), 0);

  // Note: Transfers typically don't affect "Expense" totals in simple views, or they net out.
  // For now keeping it simple as per original logic which only took 'expense' type.

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

  const calculateTotals = () => {
    return expenses.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  };

  const handleExportExcel = () => {
    if (filteredExpenses.length === 0) return alert("No data to export.");
    exportToExcel(filteredExpenses, calculateTotals());
    setShowMobileActions(false);
  };

  const handleExportPDF = () => {
    if (filteredExpenses.length === 0) return alert("No data to export.");
    exportToPDF(filteredExpenses, calculateTotals(), categories);
    setShowMobileActions(false);
  };

  return (
    <div className="container flex-col" style={{ minHeight: '100vh', gap: '2rem' }}>
      <Header onProfileClick={() => setShowProfile(true)} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <MonthSelector
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Action Toolbar - Desktop */}
          <div className="glass-panel hide-on-mobile" style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            zIndex: 20, /* Ensure dropdowns appear above SummaryCards */
            position: 'relative'
          }}>
            <ImportButton />
            <ExportButton
              expenses={filteredExpenses}
              categories={categories}
            />

            <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>

            <Button variant="ghost" size="sm" onClick={() => setShowStats(!showStats)}
              title={showStats ? "Hide visual analytics" : "Show visual analytics"}>
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowFriendManager(true)} title="Manage friends">
              Friends
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowGroupManager(true)} title="Manage groups">
              Groups
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowCategoryManager(true)} title="Manage categories">
              Categories
            </Button>

            <Button variant="primary" size="sm" onClick={() => setShowShareModal(true)} title="Share your dashboard">
              Share
            </Button>

            <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                height: '32px',
                padding: '0 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--glass-border)',
                background: 'transparent',
                color: 'hsl(var(--color-text-main))',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          {/* Mobile Currency & Actions - Compact */}
          {/* Mobile Currency & Actions - Compact Line */}
          <div className="hide-on-desktop" style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="glass-panel"
              style={{
                height: '32px',
                padding: '0 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)',
                background: 'transparent',
                color: 'hsl(var(--color-text-main))',
                fontSize: '0.85rem',
                outline: 'none',
                fontWeight: 600,
                minWidth: '80px'
              }}
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
            </select>

            {/* Combined Actions Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMobileActions(!showMobileActions)}
              style={{ height: '32px', padding: '0 0.75rem', gap: '0.5rem' }}
            >
              <MoreHorizontal size={18} />
              <span>Actions</span>
            </Button>

            {/* Mobile Actions Menu Dropdown */}
            {showMobileActions && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowMobileActions(false)}
                />
                <div className="glass-panel animate-in fade-in zoom-in-95" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '50%', // Center relative to container
                  transform: 'translateX(50%)',
                  marginTop: '0.5rem',
                  zIndex: 50,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minWidth: '200px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'hsl(var(--color-surface))',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', paddingBottom: '0.25rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <small>DATA MANAGEMENT</small>
                  </div>

                  {/* Wrapper to style the buttons inside as full width list items */}
                  <div onClick={() => setShowMobileActions(false)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <ImportButton />
                    {/* Collapsible Export Menu */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMobileExport(!showMobileExport);
                        }}
                        style={{
                          justifyContent: 'center', /* Match ImportButton */
                          position: 'relative',
                          width: '100%',
                          height: 'auto',
                          padding: '0.4rem 0.5rem',
                        }}
                      >
                        <span style={{ marginRight: '0.5rem' }}>Export Data</span>
                        <span style={{ position: 'absolute', right: '1rem', transform: showMobileExport ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.7em' }}>▼</span>
                      </Button>

                      {showMobileExport && (
                        <div className="animate-in slide-in-from-top-2" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          paddingLeft: '1rem',
                          borderLeft: '2px solid var(--glass-border)',
                          marginLeft: '0.5rem',
                          marginTop: '0.25rem'
                        }}>
                          <Button
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleExportExcel(); }}
                            style={{ justifyContent: 'flex-start', height: 'auto', padding: '0.4rem', fontSize: '0.85rem' }}
                          >
                            Excel (.xlsx)
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleExportPDF(); }}
                            style={{ justifyContent: 'flex-start', height: 'auto', padding: '0.4rem', fontSize: '0.85rem' }}
                          >
                            PDF (.pdf)
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
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
            <DebtChart expenses={expenses} />
          </div>
        )}

        <div className="responsive-feature-grid">
          <BudgetCard />
          <GoalCard />
          <BankAccountCard />
          <InvestmentCard />
          <RecurringExpenseCard />
          <LoanCard />
        </div>

        {/* Hidden on mobile, shown via Modal */}
        <div className="hide-on-mobile">
          <BalanceList />
        </div>

        <Card
          title="Recent Transactions"
          defaultOpen={true}
          scrollable={true}
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <VoiceInput />
              <Button onClick={() => {
                setEditingExpense(null);
                setShowAddForm(true);
              }} title="Add a new transaction" className="hide-on-mobile">
                + New
              </Button>
            </div>
          }
        >
          <TransactionList
            expenses={filteredExpenses}
            onDelete={deleteExpense}
            onEdit={handleEdit}
            currency={currency}
          />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="hide-on-mobile">
            {/* You can add something else here if needed, or leave it for balance */}
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="hide-on-desktop" style={{
        position: 'fixed',
        bottom: '7rem', // Moved up further to avoid overlap
        right: '1.5rem',
        zIndex: 100
      }}>
        <Button
          variant="primary"
          style={{
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            padding: 0,
            boxShadow: 'var(--shadow-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem'
          }}
          onClick={() => {
            setEditingExpense(null);
            setShowAddForm(true);
          }}
          title="Add New Transaction"
        >
          +
        </Button>
      </div>

      <MobileNav
        onShowStats={() => { setShowStats(!showStats); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onShowFriends={() => setShowFriendManager(true)}
        onShowGroups={() => setShowGroupManager(true)}
        onShowCategories={() => setShowCategoryManager(true)}
        onShowBalances={() => setShowMobileBalances(true)}
        onShare={() => setShowShareModal(true)}
        onShowCalculators={() => setShowCalculators(true)}
        onShowProfile={() => setShowProfile(true)}
      />

      <div className="mobile-nav-spacer"></div>

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={showCalculators}
        onClose={() => setShowCalculators(false)}
      />


      {/* Modals */}
      <Modal
        isOpen={showAddForm}
        onClose={handleCloseForm}
        title={editingExpense ? "Edit Transaction" : "New Transaction"}
      >
        <AddExpenseForm
          onClose={handleCloseForm}
          initialData={editingExpense || undefined}
        />
      </Modal>

      <Modal
        isOpen={showFriendManager}
        onClose={() => setShowFriendManager(false)}
        title="Friends"
      >
        <FriendManager />
      </Modal>

      <Modal
        isOpen={showGroupManager}
        onClose={() => setShowGroupManager(false)}
        title="Groups"
      >
        <GroupManager />
      </Modal>

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      <Modal
        isOpen={showMobileBalances}
        onClose={() => setShowMobileBalances(false)}
        title="Balances (Owes)"
      >
        <BalanceList />
      </Modal>

      <ShareDashboardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="My Profile"
      >
        <ProfileModal onClose={() => setShowProfile(false)} />
      </Modal>

      <footer style={{
        padding: '3rem 0',
        textAlign: 'center',
        color: 'hsl(var(--color-text-muted))',
        fontSize: '0.875rem',
        opacity: 0.7,
        marginBottom: '4rem'
      }}>
        <p>Expertly Designed with ❤️ &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
