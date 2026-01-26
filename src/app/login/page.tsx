'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) {
                router.replace('/')
            }
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) {
                router.replace('/')
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    if (!session) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'hsl(var(--color-background))', // Use theme background
                padding: '1rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: 'hsl(var(--color-surface))', // Use theme surface (dark in dark mode)
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '2rem',
                    border: '1px solid hsl(var(--color-border))'
                }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        color: 'hsl(var(--color-text-main))'
                    }}>Sign in to Expense Tracker</h1>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: 'hsl(var(--color-primary))',
                                        brandAccent: 'hsl(var(--color-primary))',
                                        inputText: 'hsl(var(--color-text-main))',
                                        inputBackground: 'transparent',
                                        inputBorder: 'hsl(var(--color-border))',
                                        inputLabelText: 'hsl(var(--color-text-muted))',
                                        defaultButtonBackground: 'hsl(var(--color-primary))',
                                        defaultButtonBackgroundHover: 'hsl(var(--color-primary))',
                                        defaultButtonText: '#ffffff',
                                    },
                                    radii: {
                                        borderRadiusButton: '8px',
                                        inputBorderRadius: '8px',
                                    }
                                }
                            },
                            style: {
                                input: {
                                    color: 'hsl(var(--color-text-main))',
                                    borderColor: 'hsl(var(--color-border))',
                                },
                                label: {
                                    color: 'hsl(var(--color-text-muted))',
                                }
                            }
                        }}
                        providers={[]}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting...</p>
        </div>
    )
}
