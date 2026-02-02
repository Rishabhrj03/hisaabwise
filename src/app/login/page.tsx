'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, register } = useAuth()

    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [terms, setTerms] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const phoneParam = searchParams?.get('phone')
        const modeParam = searchParams?.get('mode')

        if (phoneParam) {
            setPhone(phoneParam)
            setIsLogin(false)
        } else if (modeParam === 'signup' || modeParam === 'register') {
            setIsLogin(false)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Basic Validation
        if (!isLogin) {
            if (phone.length !== 10) {
                setError('Please enter a valid 10-digit phone number.')
                setLoading(false)
                return
            }
            if (!terms) {
                setError('You must agree to the Terms & Conditions.')
                setLoading(false)
                return
            }
        }

        try {
            if (isLogin) {
                const res = await login(email, password)
                if (res.error) {
                    setError(res.error)
                } else {
                    const callbackUrl = searchParams?.get('callbackUrl');
                    router.push(callbackUrl || '/');
                }
            } else {
                const res = await register(email, password, name, phone, terms)
                if (res.error) {
                    setError(res.error)
                } else {
                    router.push('/verification')
                }
            }
        } catch (err) {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'hsl(var(--color-text-main))',
        fontSize: '1rem',
        marginBottom: '1rem',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
    } as React.CSSProperties;

    return (
        <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '3rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <img src="/logo.svg" alt="HisaabWise" style={{ width: '100%', height: '100%' }} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>
                    {isLogin ? 'Enter your details to access your expenses' : 'Start tracking your finances today'}
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'hsl(var(--hue-danger) 95% 90%)',
                    color: 'hsl(var(--hue-danger) 40% 40%)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid hsl(var(--hue-danger) 90% 80%)',
                    fontSize: '0.875rem',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={inputStyle}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) {
                                        setPhone(val);
                                    }
                                }}
                                style={inputStyle}
                                placeholder="9876543210 (10 digits)"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        placeholder="••••••••"
                        required
                    />
                    {isLogin && (
                        <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                            <a href="/forgot-password" style={{ fontSize: '0.75rem', color: 'hsl(var(--color-primary))', textDecoration: 'none' }}>
                                Forgot Password?
                            </a>
                        </div>
                    )}
                </div>

                {!isLogin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="terms"
                            checked={terms}
                            onChange={(e) => setTerms(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', cursor: 'pointer' }}>
                            I agree to the <a href="/terms?from=signup" target="_blank" style={{ color: 'hsl(var(--color-primary))', textDecoration: 'none' }}>Terms & Conditions</a>
                        </label>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading || (!isLogin && !terms)}
                    style={{ width: '100%', marginTop: '1rem', opacity: (loading || (!isLogin && !terms)) ? 0.7 : 1 }}
                    size="lg"
                >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'hsl(var(--color-primary))',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--hue-primary) 30% 95%) 100%)',
            padding: '1rem'
        }}>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
