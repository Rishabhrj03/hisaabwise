'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

function TermsContent() {
    const searchParams = useSearchParams();
    const fromSignup = searchParams.get('from') === 'signup';

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href={fromSignup ? "/login?mode=signup" : "/"}>
                    <Button variant="ghost">← {fromSignup ? "Back to Signup" : "Back to Home"}</Button>
                </Link>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Terms & Conditions</h1>
            <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '3rem' }}>Last updated: February 2026</p>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Introduction</h2>
                <p style={{ lineHeight: 1.6, color: 'hsl(var(--color-text-muted))' }}>
                    Welcome to HisaabWise. By accessing or using our application, you agree to be bound by these Terms and Conditions. HisaabWise is a dedicated manual expense tracking and financial analysis tool designed to help you organize your finances.
                </p>
            </section>


            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. Data Collection & Privacy</h2>
                <p style={{ lineHeight: 1.6, color: 'hsl(var(--color-text-muted))' }}>
                    We respect your privacy and believe in minimal data collection.
                </p>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginTop: '1rem', color: 'hsl(var(--color-text-muted))', lineHeight: 1.6 }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Minimal Data:</strong> We only collect your <strong>Phone Number</strong> and <strong>Email Address</strong> to create your secure account and facilitate login.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>No Bank Access:</strong> We do NOT access, store, or process your bank account passwords, credit card numbers, or real-time banking transactions. All financial entries are manual.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Data Usage:</strong> Your contact information may be used to send you account updates, important notifications, and AI-driven insights. It may also be used for future marketing analysis to improve our services.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. User Responsibilities</h2>
                <p style={{ lineHeight: 1.6, color: 'hsl(var(--color-text-muted))' }}>
                    Since HisaabWise relies on manual data entry, you are responsible for the accuracy of the information you input. We are not liable for any financial decisions made based on incorrect manual entries.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Limitation of Liability</h2>
                <p style={{ lineHeight: 1.6, color: 'hsl(var(--color-text-muted))' }}>
                    HisaabWise is provided "as is". We make no warranties about the completeness, reliability, or accuracy of the analysis if the underlying data provided by the user is incorrect. In no event shall HisaabWise be liable for any indirect, incidental, or consequential damages.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Contact Us</h2>
                <p style={{ lineHeight: 1.6, color: 'hsl(var(--color-text-muted))' }}>
                    If you have any questions about these Terms, please contact us at support@anewway.in.
                </p>
            </section>
        </div>
    );
}

export default function TermsPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'hsl(var(--color-background))',
            color: 'hsl(var(--color-text-main))',
            padding: '4rem 2rem',
            fontFamily: 'var(--font-sans)'
        }}>
            <Suspense fallback={<div>Loading...</div>}>
                <TermsContent />
            </Suspense>
        </div>
    );
}
