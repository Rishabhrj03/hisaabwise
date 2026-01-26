
import { parseVoiceInput } from './voiceParser';

describe('Voice Parser', () => {
    const friends = ['Das', 'Rahul', 'Sneha'];

    test('Basic Expense', () => {
        const result = parseVoiceInput('500 for lunch', friends);
        expect(result.amount).toBe('500');
        expect(result.category).toBe('Food');
        expect(result.type).toBe('expense');
    });

    test('Hinglish Numbers', () => {
        const result = parseVoiceInput('do hazaar rupees received', friends);
        expect(result.amount).toBe('2000');
        expect(result.type).toBe('income');
    });

    test('Context Aware: Das as Number', () => {
        const result = parseVoiceInput('Das Hazaar salary', friends);
        expect(result.amount).toBe('10000');
        expect(result.category).toBe('Salary');
    });

    test('Context Aware: Das as Friend (Not Implemented fully yet just avoiding number conversion)', () => {
        // Here we expect "Das" to NOT remain "10" if it's used as a name.
        // current logic only avoids converting "das" to "10" if not followed by number words.
        // But "Das paid" -> "Das" (name)
        // "Das" alone -> ambiguous, currently defaults to friend if in list?

        const result = parseVoiceInput('Dinner with Das', friends);
        // "Dinner with 10" wouldn't make sense.
        // Expect description to contain "Das" not "10"
        expect(result.description).toMatch(/Das/i);
        expect(result.description).not.toContain('10');
    });

    test('Specific Friend Name vs Number: "Das paid"', () => {
        const result = parseVoiceInput('Das paid 500', friends);
        expect(result.description).toContain('Das');
        expect(result.description).not.toContain('10');
    });

    test('Split Logic: Paid by Friend', () => {
        const result = parseVoiceInput('Paid by Rahul 500 for lunch', friends);
        expect(result.amount).toBe('500');
        expect(result.splitDetails?.paidBy).toBe('rahul');
    });

    test('Split Logic: Split with Friend', () => {
        const result = parseVoiceInput('Dinner 2000 split with Sneha', friends);
        expect(result.amount).toBe('2000');
        expect(result.splitDetails?.splitWith).toContain('sneha');
    });

    test('Split Logic: Paid by and Split with', () => {
        const result = parseVoiceInput('Rahul paid 1000 split with Sneha', friends);
        expect(result.amount).toBe('1000');
        expect(result.splitDetails?.paidBy).toBe('rahul');
        expect(result.splitDetails?.splitWith).toContain('sneha');
    });

    test('Mishearings', () => {
        const result = parseVoiceInput('Spain 500', friends);
        expect(result.amount).toBe('500');
        expect(result.type).toBe('expense'); // 'spain' -> 'spend' -> expense
    });

    // Advanced Hinglish Scenarios
    test('Hinglish Payer: Rahul ne diya', () => {
        const result = parseVoiceInput('Rahul ne diya 500', friends);
        expect(result.splitDetails?.paidBy).toBe('rahul');
    });

    test('Hinglish Split: Rahul ke saath', () => {
        const result = parseVoiceInput('Dinner 500 Rahul ke saath', friends);
        expect(result.splitDetails?.splitWith).toContain('rahul');
    });

    test('Unequal Split (Parsing Involved Friends)', () => {
        const result = parseVoiceInput('Lunch 1000 split 70 30 with Rahul', friends);
        expect(result.amount).toBe('1000');
        expect(result.splitDetails?.splitWith).toContain('rahul');
        expect(result.splitDetails?.splitRatios).toEqual([70, 30]);
    });

    test('Unknown Friend Detection', () => {
        const result = parseVoiceInput('Dinner with Kashish', friends);
        expect(result.splitDetails?.unknownFriends).toContain('kashish');
    });

    test('Exclusion Logic: Don\'t include me', () => {
        // "Split with Rahul but don't include me"
        const result = parseVoiceInput('Split with Rahul but don\'t include me', friends);
        expect(result.splitDetails?.splitWith).toContain('rahul');
        expect(result.description).not.toMatch(/don't include/i);
    });

    test('Exclusion Logic: Exclude specific friend', () => {
        const result = parseVoiceInput('Split with Rahul and Sneha exclude Rahul', friends);
        expect(result.splitDetails?.splitWith).toContain('sneha');
        expect(result.splitDetails?.splitWith).not.toContain('rahul');
    });

    test('Hinglish Income: account me aaye', () => {
        const result = parseVoiceInput('10000 account me aaye', friends);
        expect(result.amount).toBe('10000');
        expect(result.type).toBe('income');
    });

    test('Exclusion with Pronoun: Exclude him', () => {
        const result = parseVoiceInput('Spend 1000 on dinner with Rahul Bhai and exclude him', friends);
        expect(result.splitDetails?.splitWith).not.toContain('rahul');
    });

    test('Implicit Exclusion: but not including', () => {
        // "Spend fun friday with Vijay Bhai but not including"
        // Should exclude Vijay (implied).
        const result = parseVoiceInput('Spend 1000 fun friday with Rahul Bhai but not including', friends);
        expect(result.splitDetails?.splitWith).not.toContain('rahul');
    });

    test('Unknown Friend in simple phrase: Fun friday with Rishabh', () => {
        // Rishabh is not in friends list
        const result = parseVoiceInput('Fun friday with Rishabh', friends);
        expect(result.splitDetails?.unknownFriends).toContain('rishabh');
    });
});
