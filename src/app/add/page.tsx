'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm';
import { parseVoiceInput } from '@/utils/voiceParser'; // You'll need to export this or move logic if not exported
import { useFriends } from '@/context/FriendContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function QuickAddContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { friends } = useFriends();
    const { user, loading } = useAuth();
    const [initialData, setInitialData] = useState<any>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login with callback URL
            const callbackUrl = encodeURIComponent(window.location.href);
            router.push(`/login?callbackUrl=${callbackUrl}`);
        }
    }, [user, loading, router]);

    useEffect(() => {
        const text = searchParams?.get('text');
        if (text) {
            const friendNames = friends.map(f => f.name);
            const parsed = parseVoiceInput(text, friendNames);

            setInitialData({
                amount: parsed.amount,
                description: parsed.description,
                category: parsed.category,
                type: parsed.type,
                date: parsed.originalDate
            });
        }
    }, [searchParams, friends]);

    if (loading || !user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                    Quick Add
                </h1>
                <Button variant="ghost" onClick={() => router.push('/')}>Dashboard</Button>
            </div>

            <Card className="mb-6">
                {initialData ? (
                    <AddExpenseForm
                        initialData={initialData}
                        onClose={() => {
                            setTimeout(() => router.push('/'), 1500);
                        }}
                    />
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Waiting for voice input...</p>
                        <p className="text-xs text-gray-400">Use Siri shortcut to trigger this page with data.</p>
                    </div>
                )}
            </Card>

            <div className="text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="text-xs text-gray-500 underline"
                >
                    {showInstructions ? 'Hide Setup Guide' : 'How to set up Siri Shortcut?'}
                </Button>
            </div>

            {showInstructions && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                    <p className="font-semibold mb-2">iOS Shortcut Setup:</p>
                    <ol className="list-decimal pl-4 space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Open <strong>Shortcuts</strong> app.</li>
                        <li>Add action: <strong>Dictate Text</strong>.</li>
                        <li>Add action: <strong>Open URL</strong>.</li>
                        <li>
                            Set URL to:<br />
                            <code className="block mt-1 p-2 bg-gray-100 dark:bg-black rounded text-xs break-all select-all font-mono">
                                {window.location.origin}/add?text=Dictated Text
                            </code>
                        </li>
                    </ol>
                </div>
            )}
        </div>
    );
}

export default function QuickAddPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuickAddContent />
        </Suspense>
    );
}
