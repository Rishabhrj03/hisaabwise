import { useFriends } from '@/context/FriendContext';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { parseVoiceInput } from '@/utils/voiceParser';
import { sendGTMEvent } from '@next/third-parties/google';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useExpenses } from '@/context/ExpenseContext';
import { AlertModal } from '@/components/ui/AlertModal';

interface VoiceInputProps {
    onTranscript?: (text: string) => void;
}

interface ParsedData {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense' | 'transfer'; // Added transfer
    originalDate: string;
    splitDetails?: {
        paidBy: string;
        splitWith: string[];
        splitRatios?: number[];
        unknownFriends?: string[];
    };
}

export function VoiceInput({ }: VoiceInputProps) {
    const { addExpense, categories } = useExpenses();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                setIsSupported(true);
                const reco = new SpeechRecognition();
                reco.continuous = false;
                reco.interimResults = true;
                reco.lang = 'en-US';
                recognitionRef.current = reco;
            } else {
                setIsSupported(false);
            }
        }
    }, []);

    const { friends, addFriend } = useFriends();

    const processTranscript = (text: string) => {
        const friendNames = friends.map(f => f.name);
        const result = parseVoiceInput(text, friendNames);

        sendGTMEvent({
            event: 'voice_command_processed',
            value: { category: result.category }
        });

        setParsedData({
            amount: result.amount,
            description: result.description,
            category: result.category,
            type: result.type as 'income' | 'expense' | 'transfer',
            originalDate: result.originalDate || new Date().toISOString().split('T')[0], // Default to today
            splitDetails: result.splitDetails || { paidBy: 'me', splitWith: ['me'] } // Default split structure
        });
    };

    const handleConfirm = async () => {
        if (parsedData && parsedData.amount) {
            const finalAmount = parseFloat(parsedData.amount);
            if (isNaN(finalAmount)) {
                setAlertConfig({ isOpen: true, title: 'Invalid Amount', message: "Please enter a valid amount" });
                return;
            }

            const expenseData: any = {
                description: parsedData.description,
                amount: finalAmount,
                type: parsedData.type,
                category: parsedData.category,
                date: parsedData.originalDate,
                relatedTo: []
            };

            // Handle Split Logic
            if (parsedData.splitDetails && (parsedData.splitDetails.splitWith.length > 0 || parsedData.splitDetails.paidBy !== 'me')) {
                const { paidBy: payerName, splitWith: splitNames } = parsedData.splitDetails;

                // 1. Resolve Payer ID
                let payerId = 'me';
                if (payerName && payerName.toLowerCase() !== 'me') {
                    const payer = friends.find(f => f.name.toLowerCase() === payerName.toLowerCase());
                    if (payer) payerId = payer.id;
                }

                // 2. Resolve Split IDs
                const involvedIds = new Set<string>();
                if (splitNames.length > 0) {
                    involvedIds.add('me');
                    splitNames.forEach(name => {
                        const friend = friends.find(f => f.name.toLowerCase() === name.toLowerCase());
                        if (friend) involvedIds.add(friend.id);
                    });
                }

                // Handle Unknown Friends
                if (parsedData.splitDetails.unknownFriends) {
                    try {
                        const newIdPromises = parsedData.splitDetails.unknownFriends.map(name => {
                            const capName = name.charAt(0).toUpperCase() + name.slice(1);
                            return addFriend(capName);
                        });
                        const newIds = await Promise.all(newIdPromises);
                        newIds.forEach(id => involvedIds.add(id));
                    } catch (error) {
                        console.error("Failed to add unknown friends", error);
                        setAlertConfig({ isOpen: true, title: 'Error', message: "Failed to add unknown friends. Please try again." });
                        return;
                    }
                }

                involvedIds.add(payerId);
                const involvedArray = Array.from(involvedIds);

                if (involvedArray.length > 1) {
                    let shares;
                    // (Simple Equal Split Logic for now, same as before)
                    const shareAmount = parseFloat((finalAmount / involvedArray.length).toFixed(2));
                    shares = involvedArray.map(uid => ({
                        userId: uid,
                        amount: shareAmount
                    }));

                    const totalCalc = shares.reduce((sum, s) => sum + s.amount, 0);
                    if (Math.abs(totalCalc - finalAmount) > 0.01) {
                        shares[0].amount = parseFloat((shares[0].amount + (finalAmount - totalCalc)).toFixed(2));
                    }

                    expenseData.splitDetails = {
                        paidBy: payerId,
                        shares
                    };
                    expenseData.relatedTo = involvedArray.filter(id => id !== 'me');
                } else if (payerId !== 'me') {
                    expenseData.splitDetails = {
                        paidBy: payerId,
                        shares: [{ userId: 'me', amount: finalAmount }]
                    };
                    expenseData.relatedTo = [payerId];
                }
            }

            addExpense(expenseData);
            setParsedData(null);
            setTranscript('');
        }
    };

    const handleDiscard = () => {
        setParsedData(null);
        setTranscript('');
    };

    const toggleListening = () => {
        if (!isSupported) {
            setAlertConfig({ isOpen: true, title: 'Not Supported', message: "Voice input is not supported in this browser." });
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            const recognition = recognitionRef.current;
            if (!recognition) return;

            setParsedData(null);
            setTranscript('');
            setIsListening(true);
            try {
                recognition.start();
                sendGTMEvent({ event: 'voice_recording_started' });
            } catch (error) {
                console.warn("Speech recognition already started:", error);
            }

            recognition.onresult = (event: any) => {
                const results = event.results;
                const lastIdx = results.length - 1;
                const result = results[lastIdx];
                const text = result[0].transcript;
                const isFinal = result.isFinal;

                setTranscript(text);

                if (isFinal) {
                    recognition.stop();
                    setIsListening(false);
                    processTranscript(text);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                if (isListening) {
                    setIsListening(false);
                }
            };
        }
    };

    if (!isSupported) return null;

    return (
        <div style={{ position: 'relative' }}>
            <Button
                variant={isListening ? "danger" : "secondary"}
                onClick={toggleListening}
                title="Click to speak"
                style={{
                    minWidth: '40px',
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                {isListening ? <span className="animate-pulse">🛑</span> : <span>🎤</span>}
            </Button>

            {/* Listen Modal - Kept same */}
            {isListening && typeof document !== 'undefined' && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }} onClick={toggleListening}>
                    <div style={{
                        background: 'hsl(var(--color-surface))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                        width: '100%', maxWidth: '320px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
                    }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <div className="animate-pulse" style={{ fontSize: '2rem' }}>🎤</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'hsl(var(--color-primary))', marginBottom: '0.5rem' }}>Listening...</div>
                            <div style={{ fontStyle: 'italic', color: 'hsl(var(--color-text-muted))' }}>&quot;{transcript || "Speak now..."}&quot;</div>
                        </div>
                        <Button variant="danger" size="sm" onClick={toggleListening} style={{ width: '100%' }}>Stop</Button>
                    </div>
                </div>,
                document.body
            )}

            {/* Enhanced Review Modal */}
            {!isListening && parsedData && typeof document !== 'undefined' && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }} onClick={handleDiscard}>
                    <div style={{
                        background: 'hsl(var(--color-surface))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                        width: '100%', maxWidth: '360px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        display: 'flex', flexDirection: 'column', gap: '1.25rem'
                    }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', textAlign: 'center', fontWeight: 600 }}>Review Details</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Description */}
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>DESCRIPTION</label>
                                <Input
                                    value={parsedData.description}
                                    onChange={(e) => setParsedData({ ...parsedData, description: e.target.value })}
                                />
                            </div>

                            {/* Amount & Date - Side by Side */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>AMOUNT</label>
                                    <Input
                                        type="number"
                                        value={parsedData.amount!}
                                        onChange={(e) => setParsedData({ ...parsedData, amount: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>DATE</label>
                                    <Input
                                        type="date"
                                        value={parsedData.originalDate}
                                        onChange={(e) => setParsedData({ ...parsedData, originalDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Category - Dynamic Options */}
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>CATEGORY</label>
                                <select
                                    value={parsedData.category}
                                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                                    style={{
                                        width: '100%', height: '42px', borderRadius: 'var(--radius-md)',
                                        border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface))',
                                        padding: '0 0.75rem', fontSize: '0.875rem', outline: 'none', color: 'hsl(var(--color-text-main))'
                                    }}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {parsedData.type === 'expense' ? (
                                        categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))
                                    ) : parsedData.type === 'transfer' ? (
                                        <>
                                            <option value="Transfer">Transfer</option>
                                            <option value="Credit Card Payment">Credit Card Payment</option>
                                            <option value="Loan Payment">Loan Payment</option>
                                            <option value="Savings">Savings</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Salary">Salary</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Investments">Investments</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Type Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    type="button"
                                    variant={parsedData.type === 'expense' ? 'danger' : 'secondary'}
                                    size="sm"
                                    onClick={() => setParsedData({ ...parsedData, type: 'expense', category: '' })}
                                    style={{ flex: 1, opacity: parsedData.type === 'expense' ? 1 : 0.6 }}
                                >
                                    Expense
                                </Button>
                                <Button
                                    type="button"
                                    variant={parsedData.type === 'income' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setParsedData({ ...parsedData, type: 'income', category: 'Salary' })}
                                    style={{
                                        flex: 1,
                                        backgroundColor: parsedData.type === 'income' ? 'hsl(var(--color-income))' : undefined,
                                        borderColor: parsedData.type === 'income' ? 'transparent' : undefined,
                                        color: parsedData.type === 'income' ? 'white' : undefined,
                                        opacity: parsedData.type === 'income' ? 1 : 0.6
                                    }}
                                >
                                    Income
                                </Button>
                                <Button
                                    type="button"
                                    variant={parsedData.type === 'transfer' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setParsedData({ ...parsedData, type: 'transfer', category: 'Transfer' })}
                                    style={{
                                        flex: 1,
                                        backgroundColor: parsedData.type === 'transfer' ? 'hsl(var(--color-text-main))' : undefined,
                                        color: parsedData.type === 'transfer' ? 'hsl(var(--color-background))' : undefined,
                                        borderColor: parsedData.type === 'transfer' ? 'transparent' : undefined,
                                        opacity: parsedData.type === 'transfer' ? 1 : 0.6
                                    }}
                                >
                                    Transfer
                                </Button>
                            </div>

                            {/* Split Details Section (Only for Expense) */}
                            {parsedData.type === 'expense' && friends.length > 0 && (
                                <div style={{
                                    padding: '0.75rem', background: 'hsl(var(--color-background))',
                                    borderRadius: '8px', border: '1px solid hsl(var(--color-border))'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))' }}>PAID BY</label>
                                        <select
                                            value={parsedData.splitDetails?.paidBy || 'me'}
                                            onChange={(e) => {
                                                const newPayer = e.target.value;
                                                const currentSplits = parsedData.splitDetails?.splitWith || ['me'];
                                                const newSplits = !currentSplits.includes(newPayer) ? [...currentSplits, newPayer] : currentSplits;
                                                setParsedData({
                                                    ...parsedData,
                                                    splitDetails: {
                                                        ...parsedData.splitDetails,
                                                        paidBy: newPayer,
                                                        splitWith: newSplits,
                                                        unknownFriends: parsedData.splitDetails?.unknownFriends
                                                    }
                                                })
                                            }}
                                            style={{
                                                padding: '0.25rem', borderRadius: '4px', border: 'none', background: 'transparent',
                                                fontWeight: 500, color: 'hsl(var(--color-primary))', cursor: 'pointer', textAlign: 'right'
                                            }}
                                        >
                                            <option value="me">Me</option>
                                            {friends.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {/* Me Toggle */}
                                        {parsedData.splitDetails?.paidBy !== 'me' && (
                                            <Button
                                                type="button" size="sm"
                                                variant={(parsedData.splitDetails?.splitWith || []).includes('me') ? 'primary' : 'secondary'}
                                                onClick={() => {
                                                    const current = parsedData.splitDetails?.splitWith || [];
                                                    const newSplits = current.includes('me') ? current.filter(id => id !== 'me') : [...current, 'me'];
                                                    setParsedData({ ...parsedData, splitDetails: { ...parsedData.splitDetails!, splitWith: newSplits } });
                                                }}
                                                style={{ borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                            >
                                                You {(parsedData.splitDetails?.splitWith || []).includes('me') ? '✓' : ''}
                                            </Button>
                                        )}

                                        {/* Friends Toggles */}
                                        {friends.filter(f => f.name !== parsedData.splitDetails?.paidBy).map(f => {
                                            const isSelected = (parsedData.splitDetails?.splitWith || []).includes(f.name);
                                            return (
                                                <Button
                                                    key={f.id} type="button" size="sm"
                                                    variant={isSelected ? 'primary' : 'secondary'}
                                                    onClick={() => {
                                                        const current = parsedData.splitDetails?.splitWith || [];
                                                        const newSplits = current.includes(f.name)
                                                            ? current.filter(n => n !== f.name)
                                                            : [...current, f.name];
                                                        setParsedData({ ...parsedData, splitDetails: { ...parsedData.splitDetails!, splitWith: newSplits } });
                                                    }}
                                                    style={{ borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                >
                                                    {f.name} {isSelected ? '✓' : ''}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <Button variant="ghost" size="lg" onClick={handleDiscard} style={{ flex: 1 }}>Discard</Button>
                            <Button variant="primary" size="lg" onClick={handleConfirm} style={{ flex: 1, boxShadow: '0 4px 14px 0 var(--color-primary-glow)' }}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </div>
    );
}
