"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import type { SectionId } from '@/app/page';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  activeSection: SectionId;
  setActiveSection: (s: SectionId) => void;
}

const navItems: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'budgets',
    label: 'Budgets',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    id: 'goals',
    label: 'Savings Goals',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'accounts',
    label: 'Accounts & Cards',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: 'loans',
    label: 'Loans & Udhar',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'recurring',
    label: 'Recurring',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
];

export function Header({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection }: HeaderProps) {
  const { signOut, user } = useAuth();
  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'User';

  const navigate = (id: SectionId) => {
    setActiveSection(id);
    setSidebarOpen(false); // close drawer on mobile after nav
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ─── Backdrop overlay (mobile, when sidebar open) ─── */}
      {sidebarOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 40,
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* ─── Fixed Sidebar ─── */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} style={{ zIndex: 50 }}>

        {/* Logo row */}
        <div style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-brand)', flexShrink: 0,
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                SpendWise
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Finance Tracker
              </div>
            </div>
          </div>
          {/* X close — mobile only */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0,
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.875rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <div style={{
            fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '0 0.5rem', marginBottom: '0.375rem',
          }}>
            Menu
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => navigate(item.id)}
              title={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User profile card */}
        <div style={{ padding: '0.875rem 0.625rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem', borderRadius: 'var(--r-md)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={async () => { await signOut(); }}
              title="Sign Out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                padding: '0.25rem', borderRadius: 'var(--r-sm)',
                transition: 'color 0.15s ease', flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--expense-color)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
