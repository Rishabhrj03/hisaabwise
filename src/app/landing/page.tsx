'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './landing.module.css';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function LandingPage() {
    const [origin, setOrigin] = React.useState<string | null>(null);
    const [voicePlatform, setVoicePlatform] = React.useState<'ios' | 'android'>('ios');
    const { theme, toggleTheme } = useTheme();

    React.useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 0%, hsl(var(--hue-primary) 80% 80% / 0.15), transparent 60%), hsl(var(--color-background))',
            color: 'hsl(var(--color-text-main))',
            fontFamily: 'var(--font-sans)',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo.svg" alt="HisaabWise Logo" style={{ width: '42px', height: '42px' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>HISAABWISE</span>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        variant="ghost"
                        onClick={toggleTheme}
                        style={{ padding: '0.5rem' }}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </Button>
                    <Link href="/login?mode=signup">
                        <Button variant="ghost" className={`${styles.navBtn}`}>Sign Up</Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="ghost" className={`${styles.navBtn} ${styles.mobileHidden}`}>Sign In</Button>
                    </Link>
                    <Link href="/login">
                        <Button className={styles.navBtn}>Get Started</Button>
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
                {/* Hero Image Mockup */}
                <div className={styles.heroImageContainer}>
                    {/* Desktop View */}
                    <img
                        src="/landing/desktop-dashboard.png"
                        alt="HisaabWise Dashboard"
                        className={styles.desktopDashboard}
                    />

                    {/* Mobile View - Floating Overlap */}
                    <div className={styles.mobileDashboardWrapper}>
                        <img
                            src="/landing/mobile-dashboard.png"
                            alt="HisaabWise Mobile App"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
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
                            icon="📱"
                            title="Install App"
                            desc="Add to Home Screen on iOS (Share > Add to Home Screen) and Android for a native app experience."
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Instant Sync"
                            desc="Your data is synced instantly across all your devices in real-time."
                        />
                    </div>
                </div>
            </section>

            {/* Why HisaabWise Section */}
            <section style={{ padding: '6rem 2rem' }}>
                <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Why HisaabWise?</h2>
                        <p style={{ fontSize: '1.2rem', color: 'hsl(var(--color-text-muted))', maxWidth: '700px', margin: '0 auto' }}>
                            A professional financial organizer that puts privacy first. No bank connections, no data mining—just pure, manual control over your wealth.
                        </p>
                    </div>

                    <div className={styles.featuresGrid}>
                        {/* Privacy Card */}
                        <div className={styles.featureCard}>
                            <span className={styles.cardIcon}>🛡️</span>
                            <h3 className={styles.cardTitle}>No Bank Linking Needed</h3>
                            <p className={styles.cardText}>
                                Unlike payment apps (CRED, GPay), we <strong>never</strong> ask for your bank passwords. We use your email and phone to provide <strong>AI insights</strong> and updates, keeping your banking credentials strictly with you.
                            </p>
                        </div>

                        {/* All-in-One Card */}
                        <div className={styles.featureCard}>
                            <span className={styles.cardIcon}>💎</span>
                            <h3 className={styles.cardTitle}>All-In-One Suite</h3>
                            <p className={styles.cardText}>
                                Why use 5 apps? Track <strong>Budgets & Goals</strong>, Manage <strong>SIPs</strong>, use <strong>Finance Calculators</strong>, and Analyze Returns—all in one premium dashboard.
                            </p>
                        </div>

                        {/* Social Finance Card */}
                        <div className={styles.featureCard}>
                            <span className={styles.cardIcon}>🤝</span>
                            <h3 className={styles.cardTitle}>Better Than Splitwise</h3>
                            <p className={styles.cardText}>
                                Split expenses with friends, manage groups, and share your dashboard with family. Import/Export statements effortlessly for total transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Voice Command Section */}
            <section style={{
                padding: '4rem 2rem',
                background: 'linear-gradient(180deg, var(--color-background) 0%, var(--color-surface) 100%)',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Voice Quick Add</h2>
                    <p style={{ fontSize: '1.2rem', color: 'hsl(var(--color-text-muted))', maxWidth: '700px', marginBottom: '3rem', lineHeight: 1.6 }}>
                        Add expenses hands-free. Works with <strong>Siri</strong> on iOS and <strong>Google Assistant</strong> on Android.
                    </p>

                    <div style={{ marginBottom: '2rem', display: 'inline-flex', background: 'var(--color-surface)', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
                        <button
                            onClick={() => setVoicePlatform('ios')}
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: 'var(--radius-full)',
                                background: voicePlatform === 'ios' ? 'hsl(var(--color-primary))' : 'transparent',
                                color: voicePlatform === 'ios' ? '#fff' : 'hsl(var(--color-text-muted))',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🍎 iOS (Siri)
                        </button>
                        <button
                            onClick={() => setVoicePlatform('android')}
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: 'var(--radius-full)',
                                background: voicePlatform === 'android' ? 'hsl(var(--color-primary))' : 'transparent',
                                color: voicePlatform === 'android' ? '#fff' : 'hsl(var(--color-text-muted))',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🤖 Android
                        </button>
                    </div>

                    <div className={styles.siriGrid}>
                        {/* Say It Naturally Card */}
                        <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'hsl(var(--color-primary))' }}>🗣️ Say It Naturally</h3>
                                <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '1rem' }}>
                                    {voicePlatform === 'ios' ? 'Siri understands natural language. Try saying:' : 'Use Google Assistant or Voice Typing:'}
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem' }}>
                                        {voicePlatform === 'ios' ? '"Hey Siri, Quick Add, Spent 500 on clothes"' : '"Hey Google, Open Quick Add"'}
                                    </li>
                                    <li style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem' }}>
                                        {voicePlatform === 'ios' ? '"Hey Siri, Quick Add, Paid 200 for lunch"' : 'Then tap Mic: "Paid 200 for lunch"'}
                                    </li>
                                </ul>
                            </div>
                            <img
                                src="/landing/siri-example.png"
                                alt="Voice Command Example"
                                style={{
                                    width: '100%',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    alignSelf: 'center',
                                    maxHeight: '400px',
                                    objectFit: 'contain',
                                    opacity: voicePlatform === 'ios' ? 1 : 0.5 // Dim image for Android as we don't have a specific Android screenshot yet
                                }}
                            />
                        </div>

                        {/* Setup Card */}
                        <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'hsl(var(--color-primary))' }}>⚙️ How to Setup</h3>
                                {voicePlatform === 'ios' ? (
                                    <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'hsl(var(--color-text-main))' }}>
                                        <li>Open <strong>Shortcuts</strong> app on iOS</li>
                                        <li>Create new shortcut named <strong>"Quick Add"</strong></li>
                                        <li>Add Action: <strong>Dictate Text</strong></li>
                                        <li>Add Action: <strong>URL</strong> (Set to your URL below)</li>
                                        <li>Add Action: <strong>Open URL</strong></li>
                                    </ol>
                                ) : (
                                    <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'hsl(var(--color-text-main))' }}>
                                        <li>Open this page in <strong>Chrome</strong></li>
                                        <li>Tap Menu (⋮) &gt; <strong>Add to Home Screen</strong></li>
                                        <li>Tap the new <strong>Quick Add</strong> icon on your launcher</li>
                                        <li>Tap the Microphone button to speak!</li>
                                    </ol>
                                )}

                                <code style={{ display: 'block', marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                    {origin ? `${origin}/add?text=${voicePlatform === 'ios' ? 'Dictated Text' : '...'}` : 'https://hisaabwise.anewway.in/add'}
                                </code>
                            </div>
                            <img
                                src="/landing/siri-shortcut.png"
                                alt="Setup Guide"
                                style={{
                                    width: '100%',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    alignSelf: 'center',
                                    maxHeight: '400px',
                                    objectFit: 'contain',
                                    opacity: voicePlatform === 'ios' ? 1 : 0.5
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* PWA / Install Section */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Install on your Home Screen</h2>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>🍎 iOS (Safari)</h3>
                            <p style={{ color: 'hsl(var(--color-text-muted))' }}>Tap the <strong>Menu</strong> (...) button <br /> Then on <strong>Share</strong> button <br /> and select <strong>"Add to Home Screen"</strong></p>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>🤖 Android (Chrome)</h3>
                            <p style={{ color: 'hsl(var(--color-text-muted))' }}>Tap the <strong>Menu</strong> (⋮) button <br /> and select <strong>"Install App"</strong> <br /> or select <strong>"Add to Home Screen"</strong></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Features (Mobile First, Secure & Private) - Moved outside PWA section for better structure */}
            <section className={styles.featuresSection} style={{ marginTop: '4rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className={styles.featuresGrid}>
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
                padding: '2rem',
                borderTop: '1px solid var(--glass-border)',
                background: 'var(--color-surface)',
                marginTop: 'auto'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/logo.svg" alt="Logo" style={{ width: '24px', height: '24px', opacity: 0.8 }} />
                        <span style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>© 2026 HisaabWise</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <Link href="/terms" style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))', textDecoration: 'none' }}>
                            Terms & Conditions
                        </Link>
                        <Link href="/login" style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))', textDecoration: 'none' }}>
                            Login
                        </Link>
                    </div>
                </div>
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
