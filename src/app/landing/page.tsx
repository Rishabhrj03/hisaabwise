'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './landing.module.css';

export default function LandingPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--hue-primary) 30% 95%) 100%)',
            color: 'hsl(var(--color-text-main))',
            fontFamily: 'var(--font-sans)',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo.svg" alt="HisaabWise Logo" style={{ width: '64px', height: '64px' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>HISAABWISE</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/login">
                        <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/login">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    Track Expense, <br /> Analyze Easily.
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'hsl(var(--color-text-muted))',
                    maxWidth: '600px',
                    lineHeight: 1.6
                }}>
                    Track expenses, split bills with friends, and visualize your spending habits with a beautiful, modern interface designed for you.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Link href="/login">
                        <Button size="lg" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Start Tracking Now</Button>
                    </Link>
                </div>

                {/* Hero Image Mockup Placeholder */}
                <div style={{
                    marginTop: '3rem',
                    width: '100%',
                    maxWidth: '900px',
                    aspectRatio: '16/9',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        fontSize: '1.5rem',
                        color: 'hsl(var(--color-text-muted))',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <span style={{ fontSize: '3rem' }}>💻 📊 📱</span>
                        <span>[Dashboard Dashboard Preview]</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className={styles.featuresSection}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem' }}>Everything you need</h2>

                    <div className={styles.featuresGrid}>
                        <FeatureCard
                            icon="📊"
                            title="Visual Analytics"
                            desc="Understand your spending patterns with beautiful interactive charts and graphs."
                        />
                        <FeatureCard
                            icon="🤝"
                            title="Smart Splitting"
                            desc="Split bills with friends easily. We handle the math so you don't have to."
                        />
                        <FeatureCard
                            icon="🎙️"
                            title="Voice Input"
                            desc="Add expenses on the go just by speaking. AI handles the categorization."
                        />
                        <FeatureCard
                            icon="🌍"
                            title="Multi-Currency"
                            desc="Travel the world without worry. We support USD, EUR, INR, GBP, and more."
                        />
                        <FeatureCard
                            icon="📱"
                            title="Mobile First"
                            desc="A responsive design that looks and feels great on any device."
                        />
                        <FeatureCard
                            icon="🔒"
                            title="Secure & Private"
                            desc="Your data is encrypted and secure. Login via Email or Phone."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--color-border)',
                color: 'hsl(var(--color-text-muted))'
            }}>
                <p>&copy; {new Date().getFullYear()} HISAABWISE. Built for simplicity.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className={styles.featureCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
            <p style={{ color: 'hsl(var(--color-text-muted))', lineHeight: 1.5 }}>{desc}</p>
        </div>
    );
}
