'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

export function DataMigration() {
    const { user } = useAuth()
    const [migrating, setMigrating] = useState(false)
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (!user) return

        const hasMigrated = localStorage.getItem('supabase_migrated')
        const localFriends = localStorage.getItem('friends')
        const localExpenses = localStorage.getItem('expenses')

        if (!hasMigrated && (localFriends || localExpenses)) {
            performMigration(user.id, localFriends, localExpenses)
        }
    }, [user])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const performMigration = async (userId: string, friendsJson: string | null, expensesJson: string | null) => {
        setMigrating(true)
        setStatus('Preparing migration...')

        try {
            const friends = friendsJson ? JSON.parse(friendsJson) : []
            const expenses = expensesJson ? JSON.parse(expensesJson) : []

            const friendIdMap = new Map<string, string>() // Old ID -> New ID

            // 1. Migrate Friends
            setStatus(`Migrating ${friends.length} friends...`)
            for (const friend of friends) {
                const newId = crypto.randomUUID()
                const { error } = await supabase.from('friends').insert({
                    id: newId,
                    user_id: userId,
                    name: friend.name,
                    created_at: new Date().toISOString()
                })

                if (!error) {
                    friendIdMap.set(friend.id, newId)
                } else {
                    console.error(`Failed to migrate friend ${friend.name}`, error)
                }
            }

            // 2. Migrate Expenses
            setStatus(`Migrating ${expenses.length} expenses...`)
            for (const expense of expenses) {
                const newExpenseId = crypto.randomUUID()

                // Resolve Payer
                let payerId = userId
                if (expense.splitDetails?.paidBy && expense.splitDetails.paidBy !== 'me') {
                    // Try to map old friend ID to new friend ID
                    if (friendIdMap.has(expense.splitDetails.paidBy)) {
                        payerId = friendIdMap.get(expense.splitDetails.paidBy)!
                    }
                }

                const { error: expError } = await supabase.from('expenses').insert({
                    id: newExpenseId,
                    created_by: userId,
                    amount: expense.amount,
                    description: expense.description,
                    category: expense.category,
                    type: expense.type,
                    date: expense.date,
                    payer_id: payerId
                })

                if (!expError) {
                    // Create Splits
                    if (expense.splitDetails?.shares) {
                        const splits = expense.splitDetails.shares.map((share: any) => {
                            let friendId = null
                            let isUser = false

                            if (share.userId === 'me') {
                                isUser = true
                            } else if (friendIdMap.has(share.userId)) {
                                friendId = friendIdMap.get(share.userId)
                            }

                            // Only add if we resolved the user/friend correctly
                            if (isUser || friendId) {
                                return {
                                    expense_id: newExpenseId,
                                    friend_id: friendId,
                                    is_user: isUser,
                                    amount: share.amount
                                }
                            }
                            return null
                        }).filter(Boolean)

                        if (splits.length > 0) {
                            await supabase.from('expense_splits').insert(splits)
                        }
                    }
                } else {
                    console.error("Failed to migrate expense", expError)
                }
            }

            localStorage.setItem('supabase_migrated', 'true')
            // Don't clear local storage yet just in case.

            setStatus('Migration complete!')
            setTimeout(() => {
                setMigrating(false)
                window.location.reload()
            }, 1000)

        } catch (e) {
            console.error("Migration failed", e)
            setStatus("Migration failed. Please check console.")
            setMigrating(false) // Allow user to use app even if partial fail
        }
    }

    if (!migrating) return null

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Upgrading Database</h2>
            <p>{status}</p>
        </div>
    )
}
