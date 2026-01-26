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

    const parseNumberWords = (text: string): string => {
        let cleanText = text.toLowerCase();

        // Fix common mishearings & Hinglish support
        const mishearings: Record<string, string> = {
            'spain': 'spend',
            'pane': 'spend',
            'spent': 'spend',
            'got': 'income',
            'bill': 'bill',
            // Hinglish / Hindi Numbers
            'ek': '1',
            'do': '2',
            'teen': '3',
            'chaar': '4',
            'char': '4',
            'paanch': '5',
            'panch': '5',
            'che': '6',
            'saat': '7',
            'aath': '8',
            'nau': '9',
            'das': '10',
            'dus': '10',
            'gyara': '11',
            'barah': '12',
            'bees': '20',
            'tis': '30',
            'tice': '30',
            'pachaas': '50',
            'pachas': '50',
            'sau': 'hundred',
            'hajar': 'thousand',
            'hazzar': 'thousand',
            'hazaar': 'thousand',
            'azar': 'thousand', // "Das Azar" -> "10 thousand"
            'lakh': 'lakh',
            'lac': 'lakh',
            'crore': 'crore',
            'kharcha': 'expense',
            'aaya': 'income', // Payment aaya
            'mila': 'income', // Payment mila
            'diya': 'spend',  // Payment diya
            'gaya': 'spend'   // Payment gaya
        };

        Object.keys(mishearings).forEach(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            cleanText = cleanText.replace(regex, mishearings[key]);
        });

        // Simple word-to-number replacement for common magnitudes
        const multiplierMap: Record<string, number> = {
            'k': 1000,
            'thousand': 1000,
            'lakh': 100000,
            'crore': 10000000,
            'hundred': 100
        };

        // Replace "5 thousand" -> "5000", "1.5 lakh" -> "150000"
        cleanText = cleanText.replace(/(\d+(?:\.\d+)?)\s*(k|thousand|lakh|crore|hundred)/gi, (match, number, unit) => {
            const num = parseFloat(number);
            const mult = multiplierMap[unit.toLowerCase()];
            return (num * mult).toString();
        });

        // Handle standalone "thousand" -> "1000" (e.g., "spend thousand")
        cleanText = cleanText.replace(/\b(a\s)?thousand\b/gi, '1000');
        cleanText = cleanText.replace(/\b(a\s)?hundred\b/gi, '100');
        cleanText = cleanText.replace(/\b(a\s)?lakh\b/gi, '100000');

        return cleanText;
    };

    const processTranscript = (text: string) => {
        const lowerText = parseNumberWords(text);

        // 1. Extract Amount
        let amount = 0;
        const amountMatch = lowerText.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
        if (amountMatch) {
            amount = parseFloat(amountMatch[0].replace(/,/g, ''));
        }

        // 2. Determine Type
        let type: 'income' | 'expense' = 'expense';
        if (
            lowerText.includes('received') ||
            lowerText.includes('got') ||
            lowerText.includes('income') ||
            lowerText.includes('deposit') ||
            lowerText.includes('credit') ||
            lowerText.includes('salary') ||
            lowerText.includes('aaya') || // Redundant matched by substitute but safe
            lowerText.includes('mila')
        ) {
            type = 'income';
        }

        // 3. Determine Category
        let category = 'Other';
        if (type === 'income') {
            if (lowerText.includes('salary')) category = 'Salary';
            else if (lowerText.includes('freelance')) category = 'Freelance';
            else if (lowerText.includes('gift')) category = 'Gift';
        } else {
            if (/(coffee|burger|pizza|food|lunch|dinner|restaurant|swiggy|zomato|tea|snack)/.test(lowerText)) category = 'Food';
            else if (/(taxi|uber|bus|train|flight|gas|fuel|petrol|metro|cab|auto)/.test(lowerText)) category = 'Transport';
            else if (/(clothes|shoes|amazon|buy|bought|shopping|zara|h&m|jeans|shirt)/.test(lowerText)) category = 'Shopping';
            else if (/(movie|netflix|game|cinema|fun|party)/.test(lowerText)) category = 'Entertainment';
            else if (/(electricity|water|internet|bill|rent|recharge|wifi|mobile)/.test(lowerText)) category = 'Bills';
            else if (/(medicine|doctor|hospital|gym|health|yoga)/.test(lowerText)) category = 'Health';
        }

        // 4. Clean Description
        let description = text;
        if (amountMatch) {
            description = description.replace(amountMatch[0], '');
        }

        description = description
            .replace(/dollars?|rupees?|bucks?|inr/gi, '')
            .replace(/spent|paid|bought|received|got|spain/gi, '') // Remove keywords
            .replace(/thousand|lakh/gi, '') // Remove used units
            .replace(/ on /gi, ' ')
            .replace(/ for /gi, ' ')
            .trim();

        description = description.replace(/[^\w\s]/gi, '').trim(); // Remove symbols
        description = description.charAt(0).toUpperCase() + description.slice(1);
        if (description.length === 0) description = "Voice Entry";

        setParsedData({
            amount: amount === 0 ? '' : amount.toString(),
            description,
            category,
            type,
            originalDate: new Date().toISOString()
        });
    };

    const handleConfirm = () => {
        if (parsedData && parsedData.amount) {
            const finalAmount = parseFloat(parsedData.amount);
            if (isNaN(finalAmount)) {
                alert("Please enter a valid amount");
                return;
            }

            addExpense({
                description: parsedData.description,
                amount: finalAmount,
                type: parsedData.type,
                category: parsedData.category,
                date: parsedData.originalDate
            });
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
            recognition.start();

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
