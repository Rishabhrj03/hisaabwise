'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type User = {
    id: string;
    email: string;
    name: string;
    image?: string;
    phone?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    phoneVerificationCode?: string;
}

type AuthContextType = {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ error?: string }>
    register: (email: string, password: string, name?: string, phone?: string) => Promise<{ error?: string }>
    logout: () => Promise<void>
    updateProfile: (phone: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => ({}),
    register: async () => ({}),
    logout: async () => { },
    updateProfile: async () => ({}),
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const checkUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user session:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkUser();
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                return { error: data.error };
            }
            setUser(data.user);
            router.refresh();
            return {};
        } catch (error) {
            return { error: 'Something went wrong' };
        }
    }

    const register = async (email: string, password: string, name?: string, phone?: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, phone }),
            });
            const data = await res.json();
            if (!res.ok) {
                return { error: data.error };
            }
            setUser(data.user);
            router.refresh();
            return {};
        } catch (error) {
            return { error: 'Something went wrong' };
        }
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    const updateProfile = async (phone: string) => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok) {
                return { error: data.error };
            }
            setUser(data.user);
            router.refresh();
            return {};
        } catch (error) {
            return { error: 'Something went wrong' };
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    )
}
