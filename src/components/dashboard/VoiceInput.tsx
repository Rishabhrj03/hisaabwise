import { useFriends } from '@/context/FriendContext';
import { parseVoiceInput } from '@/utils/voiceParser';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // Import Input
import { useExpenses } from '@/context/ExpenseContext';

interface VoiceInputProps {
    onTranscript?: (text: string) => void;
}

interface ParsedData {
    amount: string; // Changed to string to handle input editing easily
    description: string;
    category: string;
    type: 'income' | 'expense';
    originalDate: string;
    splitDetails?: {
        paidBy: string;
        splitWith: string[];
        splitRatios?: number[];
        unknownFriends?: string[];
    };
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
    const { addExpense } = useExpenses();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);
    const [isSupported, setIsSupported] = useState(true);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const reco = new SpeechRecognition();
                reco.continuous = false;
                reco.interimResults = true;
                reco.lang = 'en-US';
                setRecognition(reco);
            } else {
                setIsSupported(false);
            }
        }
    }, []);

    const { friends, addFriend } = useFriends();

    const processTranscript = (text: string) => {
        const friendNames = friends.map(f => f.name);
        const result = parseVoiceInput(text, friendNames);

        setParsedData({
            amount: result.amount,
            description: result.description,
            category: result.category,
            type: result.type,
            originalDate: result.originalDate,
            splitDetails: result.splitDetails
        });
    };

    const handleConfirm = async () => {
        if (parsedData && parsedData.amount) {
            const finalAmount = parseFloat(parsedData.amount);
            if (isNaN(finalAmount)) {
                alert("Please enter a valid amount");
                return;
            }

            let expenseData: any = {
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
                        alert("Failed to add unknown friends. Please try again.");
                        return;
                    }
                }

                involvedIds.add(payerId);
                const involvedArray = Array.from(involvedIds);

                if (involvedArray.length > 1) {
                    let shares;

                    // Check if we have ratios
                    if (parsedData.splitDetails && parsedData.splitDetails.splitRatios && parsedData.splitDetails.splitRatios.length > 0) {
                        const ratios = parsedData.splitDetails.splitRatios;

                        // Case 1: Ratios match number of people (e.g. "Split 70 30" -> Me, Friend)
                        if (ratios.length === involvedArray.length) {
                            shares = involvedArray.map((uid, index) => ({
                                userId: uid,
                                amount: parseFloat((finalAmount * (ratios[index] / 100)).toFixed(2))
                            }));
                        }
                        // Case 2: Single percentage ("I paid 70%") -> First person gets X%, implicit remainder
                        else if (ratios.length === 1 && involvedArray.length === 2) {
                            const percent = ratios[0];
                            const firstAmount = parseFloat((finalAmount * (percent / 100)).toFixed(2));
                            const remainder = finalAmount - firstAmount;

                            shares = [
                                { userId: involvedArray[0], amount: firstAmount },
                                { userId: involvedArray[1], amount: remainder }
                            ];
                        } else {
                            // Fallback to equal
                            const shareAmount = parseFloat((finalAmount / involvedArray.length).toFixed(2));
                            shares = involvedArray.map(uid => ({
                                userId: uid,
                                amount: shareAmount
                            }));
                        }
                    } else {
                        // Default Equal Split
                        const shareAmount = parseFloat((finalAmount / involvedArray.length).toFixed(2));
                        shares = involvedArray.map(uid => ({
                            userId: uid,
                            amount: shareAmount
                        }));
                    }

                    const totalCalc = shares.reduce((sum, s) => sum + s.amount, 0);
                    // Fix rounding difference
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
            alert("Voice input is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setParsedData(null); // Clear previous review
            setTranscript('');
            setIsListening(true);
            try {
                recognition.start();
            } catch (error) {
                console.warn("Speech recognition already started:", error);
                // If it's already started, we assume it's working.
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {isListening ? (
                    <span className="animate-pulse">🛑</span>
                ) : (
                    <span>🎤</span>
                )}
            </Button>

            {/* Listening State - Modal Overlay */}
            {isListening && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }} onClick={toggleListening}>
                    <div style={{
                        background: 'hsl(var(--color-surface))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '320px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }} onClick={e => e.stopPropagation()}>
                        <div className="animate-pulse" style={{ fontSize: '2rem' }}>🎤</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'hsl(var(--color-primary))', marginBottom: '0.5rem' }}>
                                Listening...
                            </div>
                            <div style={{ fontStyle: 'italic', color: 'hsl(var(--color-text-muted))' }}>
                                "{transcript || "Speak now..."}"
                            </div>
                        </div>
                        <Button variant="danger" size="sm" onClick={toggleListening} style={{ width: '100%' }}>
                            Stop
                        </Button>
                    </div>
                </div>
            )}

            {/* Review State - Modal Overlay */}
            {!isListening && parsedData && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }} onClick={handleDiscard}>
                    <div style={{
                        background: 'hsl(var(--color-surface))',
                        border: '1px solid hsl(var(--color-border))',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '350px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', textAlign: 'center' }}>Review Transaction</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>Description</label>
                                <Input
                                    value={parsedData.description}
                                    onChange={(e) => setParsedData({ ...parsedData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>Amount</label>
                                    <Input
                                        type="number"
                                        value={parsedData.amount}
                                        onChange={(e) => setParsedData({ ...parsedData, amount: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem', display: 'block' }}>Category</label>
                                    <select
                                        value={parsedData.category}
                                        onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '42px', // Match generic Input height
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'hsl(var(--color-surface))',
                                            padding: '0 0.75rem',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="Food">Food & Dining</option>
                                        <option value="Transport">Transportation</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Bills">Bills & Utilities</option>
                                        <option value="Health">Health & Fitness</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    type="button"
                                    variant={parsedData.type === 'expense' ? 'danger' : 'secondary'}
                                    size="sm"
                                    onClick={() => setParsedData({ ...parsedData, type: 'expense' })}
                                    style={{ flex: 1 }}
                                >
                                    Expense
                                </Button>
                                <Button
                                    type="button"
                                    variant={parsedData.type === 'income' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setParsedData({ ...parsedData, type: 'income' })}
                                    style={{
                                        flex: 1,
                                        backgroundColor: parsedData.type === 'income' ? 'hsl(var(--color-income))' : undefined,
                                        borderColor: parsedData.type === 'income' ? 'transparent' : undefined,
                                        color: parsedData.type === 'income' ? 'white' : undefined
                                    }}
                                >
                                    Income
                                </Button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleConfirm}
                                style={{ flex: 1 }}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={handleDiscard}
                                style={{ flex: 1 }}
                            >
                                Discard
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
