'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm';
import { parseVoiceInput } from '@/utils/voiceParser'; // You'll need to export this or move logic if not exported
import { useFriends } from '@/context/FriendContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function QuickAddContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { friends } = useFriends();
    const [initialData, setInitialData] = useState<any>(null);

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
                // split logic handling might be needed but form handles defaults
            });
        }
    }, [searchParams, friends]);

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Quick Add</h1>
                <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            </div>

            <Card>
                {initialData ? (
                    <AddExpenseForm
                        initialData={initialData}
                        onSuccess={() => {
                            // Feedback handled in form
                            setTimeout(() => router.push('/dashboard'), 2000);
                        }}
                    />
                ) : (
                    <p className="text-center p-4">Waiting for input...</p>
                )}
            </Card>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <p className="font-semibold mb-2">How to use locally with Siri Shortcuts:</p>
                <ol className="list-decimal pl-4 space-y-1">
                    <li>Open <strong>Shortcuts</strong> app on iOS.</li>
                    <li>Create new shortcut named <strong>"Add to HisaabWise"</strong>.</li>
                    <li>Add action <strong>"Documents: Dictate Text"</strong>.</li>
                    <li>Add action <strong>"Web: Open URL"</strong>.</li>
                    <li>Set URL to: <br /><code className="text-xs break-all select-all">https://your-app.com/add?text=Dictated Text</code></li>
                </ol>
            </div>
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
