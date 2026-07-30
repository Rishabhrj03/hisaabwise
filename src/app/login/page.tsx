'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

type Mode = 'login' | 'register';

/**
 * LoginPage — Responsive split-pane design.
 * Desktop: Left branding panel + Right glass card.
 * Mobile: Clean centered card with mobile SpendWise branding header.
 */
export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Registration failed. Please try again.');
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
        return;
      }

      router.replace('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.4rem',
    letterSpacing: '0.03em',
  };

  const features = [
    { icon: '📊', title: 'Smart Analytics', desc: 'Visual breakdowns of your spending' },
    { icon: '🎯', title: 'Budget Goals', desc: 'Stay on track every month' },
    { icon: '💼', title: 'Investments', desc: 'Track your portfolio growth' },
    { icon: '🤝', title: 'Split Expenses', desc: 'Manage shared costs with friends' },
  ];

  return (
    <div className="login-wrapper">

      {/* ── Left Branding Panel (Desktop Only) ── */}
      <div className="login-branding">
        {/* Decorative background blobs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '280px', height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-40px',
          width: '320px', height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2e1065, #4c1d95)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
              padding: '2px',
            }}>
              <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="7.5" r="4" fill="#c084fc" stroke="#3b0764" strokeWidth="0.8"/>
                <text x="12" y="9.5" fill="#3b0764" fontSize="5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                  $
                </text>
                <path d="M18.5 7.5C18.5 6.2 19.5 5 21 5C22.5 5 23.5 6.2 23.5 7.5C23.5 8.2 23 9 22 9.5C23 10 23.5 10.8 23.5 11.5C23.5 12.8 22.5 14 21 14" stroke="#e879f9" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <rect x="4" y="10" width="22" height="17" rx="4.5" fill="url(#hisaab_grad_lgn)" stroke="#a855f7" strokeWidth="1.2"/>
                <path d="M20 16H25C26.1 16 27 16.9 28 18V20C28 21.1 27.1 22 26 22H20V16Z" fill="#a855f7" stroke="#7e22ce" strokeWidth="1"/>
                <circle cx="24" cy="19" r="1.2" fill="#ffffff"/>
                <path d="M10 15.5V22.5M15 15.5V22.5M10 19H15" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="hisaab_grad_lgn" x1="4" y1="10" x2="26" y2="27" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a855f7"/>
                    <stop offset="1" stopColor="#7e22ce"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                HISAABWISE
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                Track Expense, Analyze Easily.
              </div>
            </div>
          </div>

          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.25,
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
          }}>
            Take control of your finances
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
          }}>
            Track every rupee, build better habits, and watch your wealth grow.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {features.map((f) => (
            <div key={f.title} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.15rem' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="login-form-container">

        {/* Theme Switcher Toggle (Top Right) */}
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s ease',
            }}
          >
            {theme === 'dark' ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Header Logo (Visible on Mobile) */}
        <div className="login-mobile-header">
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2e1065, #4c1d95)',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
            flexShrink: 0,
            padding: '2px',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="7.5" r="4" fill="#c084fc" stroke="#3b0764" strokeWidth="0.8"/>
              <text x="12" y="9.5" fill="#3b0764" fontSize="5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                $
              </text>
              <path d="M18.5 7.5C18.5 6.2 19.5 5 21 5C22.5 5 23.5 6.2 23.5 7.5C23.5 8.2 23 9 22 9.5C23 10 23.5 10.8 23.5 11.5C23.5 12.8 22.5 14 21 14" stroke="#e879f9" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <rect x="4" y="10" width="22" height="17" rx="4.5" fill="url(#hisaab_grad_lgn_mob)" stroke="#a855f7" strokeWidth="1.2"/>
              <path d="M20 16H25C26.1 16 27 16.9 28 18V20C28 21.1 27.1 22 26 22H20V16Z" fill="#a855f7" stroke="#7e22ce" strokeWidth="1"/>
              <circle cx="24" cy="19" r="1.2" fill="#ffffff"/>
              <path d="M10 15.5V22.5M15 15.5V22.5M10 19H15" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="hisaab_grad_lgn_mob" x1="4" y1="10" x2="26" y2="27" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a855f7"/>
                  <stop offset="1" stopColor="#7e22ce"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #c084fc, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              HISAABWISE
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Track Expense, Analyze Easily.
            </div>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="login-card">

          {/* Heading */}
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '0.35rem',
          }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {mode === 'login' ? 'Sign in to your HISAABWISE account' : 'Start tracking your finances today'}
          </p>


          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-elevated)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                id={`auth-tab-${m}`}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease',
                  background: mode === m
                    ? 'linear-gradient(135deg, var(--brand-from), var(--brand-to))'
                    : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--brand-from)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--brand-from)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--brand-from)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#fda4af',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: loading
                  ? 'var(--bg-elevated)'
                  : 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
                color: loading ? 'var(--text-muted)' : 'white',
                fontSize: '0.875rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
                marginTop: '0.25rem',
              }}
            >
              {loading
                ? (mode === 'register' ? 'Creating account…' : 'Signing in…')
                : (mode === 'register' ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
