export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
            friends: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    created_by: string
                    amount: number
                    description: string
                    category: string
                    type: 'income' | 'expense'
                    date: string
                    created_at: string
                    payer_id: string | null
                }
                Insert: {
                    id?: string
                    created_by: string
                    amount: number
                    description: string
                    category: string
                    type: 'income' | 'expense'
                    date: string
                    created_at?: string
                    payer_id?: string | null
                }
                Update: {
                    id?: string
                    created_by?: string
                    amount?: number
                    description?: string
                    category?: string
                    type?: 'income' | 'expense'
                    date?: string
                    created_at?: string
                    payer_id?: string | null
                }
            }
            expense_splits: {
                Row: {
                    id: string
                    expense_id: string
                    friend_id: string | null
                    is_user: boolean
                    amount: number
                    percentage: number | null
                }
                Insert: {
                    id?: string
                    expense_id: string
                    friend_id: string | null
                    is_user: boolean
                    amount: number
                    percentage?: number | null
                }
                Update: {
                    id?: string
                    expense_id?: string
                    friend_id?: string | null
                    is_user?: boolean
                    amount?: number
                    percentage?: number | null
                }
            }
        }
    }
}
