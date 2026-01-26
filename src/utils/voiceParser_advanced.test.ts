
import { parseVoiceInput } from './voiceParser';

describe('Voice Parser Advanced Scenarios', () => {
    const friends = ['Rahul', 'Sneha', 'Amit'];

    // Scenario 1: Hinglish Payer "Rahul ne diya"
    test('Hinglish Payer: Rahul ne diya', () => {
        // "diya" maps to "spend" in current mishearings
        // input: "Rahul ne diya 500" -> clean: "rahul ne spend 500"
        // payer logic checks: "paid by rahul" or "rahul paid"
        // content: does "rahul ne spend 500" match "rahul paid"? No.
        const result = parseVoiceInput('Rahul ne diya 500', friends);
        expect(result.splitDetails?.paidBy).toBe('rahul');
    });

    // Scenario 2: "Mere aur Rahul ke beech" (Between me and Rahul) -> Split
    test('Hinglish Split: Rahul ke saath', () => {
        const result = parseVoiceInput('Dinner 500 Rahul ke saath', friends);
        expect(result.splitDetails?.splitWith).toContain('rahul');
    });

    // Scenario 3: Unequal split (Check if it fails gracefully or ignores)
    test('Unequal Split: I paid 70 percent', () => {
        const result = parseVoiceInput('Lunch 1000 split 70 30 with Rahul', friends);
        // Parser correctly identifies Rahul is involved
        expect(result.amount).toBe('1000');
        expect(result.splitDetails?.splitWith).toContain('rahul');
        // Note: Actual share calculation happens in VoiceInput.tsx component, not in parser util.
    });
});
