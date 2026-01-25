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

        // Fix common mishearings
        const mishearings: Record<string, string> = {
            'spain': 'spend',
            'pane': 'spend',
            'spent': 'spend',
            'got': 'income',
            'bill': 'bill',
        };

        Object.keys(mishearings).forEach(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            cleanText = cleanText.replace(regex, mishearings[key]);
        });

        // Simple word-to-number replacement for common magnitudes
        // This is a heuristic, not a full parser
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
        if (lowerText.includes('received') || lowerText.includes('got') || lowerText.includes('income') || lowerText.includes('deposit') || lowerText.includes('credit') || lowerText.includes('salary')) {
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

            {/* Listening State */}
            {isListening && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    background: 'hsl(var(--color-surface))',
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    width: '300px',
                    zIndex: 50,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                    <div style={{ fontWeight: 600, color: 'hsl(var(--color-primary))', marginBottom: '0.5rem' }}>
                        Listening...
                    </div>
                    <div style={{ fontStyle: 'italic', color: 'hsl(var(--color-text-muted))' }}>
                        "{transcript}"
                    </div>
                </div>
            )}

            {/* Review State - Editable */}
            {!isListening && parsedData && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    background: 'hsl(var(--color-surface))',
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    width: '320px',
                    zIndex: 50,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>Review Transaction</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>Description</label>
                            <Input
                                value={parsedData.description}
                                onChange={(e) => setParsedData({ ...parsedData, description: e.target.value })}
                                style={{ height: '32px', padding: '0 0.5rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>Amount</label>
                                <Input
                                    type="number"
                                    value={parsedData.amount}
                                    onChange={(e) => setParsedData({ ...parsedData, amount: e.target.value })}
                                    style={{ height: '32px', padding: '0 0.5rem' }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>Category</label>
                                <select
                                    value={parsedData.category}
                                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'hsl(var(--color-surface))',
                                        padding: '0 0.5rem',
                                        fontSize: '0.875rem'
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
                                style={{ flex: 1, fontSize: '0.75rem' }}
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
                                    fontSize: '0.75rem',
                                    backgroundColor: parsedData.type === 'income' ? 'hsl(var(--color-income))' : undefined,
                                    borderColor: parsedData.type === 'income' ? 'transparent' : undefined,
                                    color: parsedData.type === 'income' ? 'white' : undefined
                                }}
                            >
                                Income
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleConfirm}
                            style={{ flex: 1 }}
                        >
                            Confirm
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDiscard}
                            style={{ flex: 1 }}
                        >
                            Discard
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
