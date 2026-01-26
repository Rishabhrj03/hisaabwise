
interface ParsedData {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    splitDetails?: {
        paidBy: string;
        splitWith: string[];
        splitRatios?: number[];
    };
    originalDate: string;
}

export const parseVoiceInput = (text: string, friends: string[] = []): ParsedData => {
    let cleanText = text.toLowerCase();
    const lowerFriends = friends.map(f => f.toLowerCase());

    // 1. Pre-process Friend Names to avoid accidental replacement
    // If a friend's name sounds like a number (e.g. "Das"), we protect it temporarily
    // BUT only if it looks like a name usage. 
    // Heuristic: "Das paid", "paid by Das", "split with Das", "for Das"
    const friendPlaceholders: Record<string, string> = {};

    lowerFriends.forEach((friend, index) => {
        if (cleanText.includes(friend)) {
            // Check context. If it's "Das hazaar" (10,000), it's a number.
            // If it's "Das paid", it's a person.

            // Simple approach: If followed by specific number words, it's a number.
            const numberFollowers = ['hazaar', 'azar', 'sau', 'hundred', 'thousand', 'lakh', 'crore', 'rupees', 'rupaye'];
            const words = cleanText.split(' ');
            const friendIndex = words.indexOf(friend);

            if (friendIndex !== -1) {
                const nextWord = words[friendIndex + 1];
                if (nextWord && numberFollowers.includes(nextWord)) {
                    // It's likely a number, do not protect
                } else {
                    // Protect it
                    const placeholder = `__FRIEND_${index}__`;
                    friendPlaceholders[placeholder] = friend;
                    // Replace all occurrences that are NOT followed by number words?
                    // For now, let's just replace the string if it's not part of a number phrase
                    // Ideally we use regex with lookahead?

                    // Let's rely on the specific mishearing map.
                    // The mishearing map converts 'das' -> '10'.
                    // We should only convert 'das' -> '10' if appropriate.
                }
            }
        }
    });

    // Fix common mishearings & Hinglish support
    const mishearings: Record<string, string> = {
        'spain': 'spend',
        'pane': 'spend',
        'spent': 'spend',
        'got': 'income',
        'bill': 'bill',
        // Hinglish / Hindi Numbers
        'ek': '1', 'do': '2', 'teen': '3', 'chaar': '4', 'char': '4',
        'paanch': '5', 'panch': '5', 'che': '6', 'saat': '7', 'aath': '8',
        'nau': '9',
        // 'das': '10', // HANDLED SEPARATELY BELOW
        'dus': '10',
        'gyara': '11', 'barah': '12',
        'bees': '20', 'tis': '30', 'tice': '30', 'pachaas': '50', 'pachas': '50',
        'sau': 'hundred',
        'hajar': 'thousand', 'hazzar': 'thousand', 'hazaar': 'thousand', 'azar': 'thousand',
        'lakh': 'lakh', 'lac': 'lakh', 'crore': 'crore',
        'kharcha': 'expense',
        'aaya': 'income',
        'mila': 'income',
        'diya': 'spend',
        'gaya': 'spend'
    };

    // Apply standard mishearings
    Object.keys(mishearings).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        cleanText = cleanText.replace(regex, mishearings[key]);
    });

    // Special handling for "Das" (10) vs Friend Name "Das"
    if (cleanText.includes('das')) {
        let isFriend = false;
        // Check if "Das" is a known friend
        if (lowerFriends.includes('das')) {
            // Check context
            if (/\bdas\s+(hazaar|thousand|sau|hundred|lakh|crore)\b/.test(cleanText)) {
                isFriend = false; // It's a number
            } else {
                isFriend = true; // Assume friend default if strictly a friend name
            }
        }

        if (!isFriend) {
            cleanText = cleanText.replace(/\bdas\b/g, '10');
        }
    }

    // Simple word-to-number replacement for common magnitudes
    const multiplierMap: Record<string, number> = {
        'k': 1000,
        'thousand': 1000,
        'lakh': 100000,
        'crore': 10000000,
        'hundred': 100
    };

    cleanText = cleanText.replace(/(\d+(?:\.\d+)?)\s*(k|thousand|lakh|crore|hundred)/gi, (match, number, unit) => {
        const num = parseFloat(number);
        const mult = multiplierMap[unit.toLowerCase()];
        return (num * mult).toString();
    });

    cleanText = cleanText.replace(/\b(a\s)?thousand\b/gi, '1000');
    cleanText = cleanText.replace(/\b(a\s)?hundred\b/gi, '100');
    cleanText = cleanText.replace(/\b(a\s)?lakh\b/gi, '100000');

    // Classification Logic (Same as existing)
    let amount = 0;
    const amountMatch = cleanText.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
    if (amountMatch) {
        amount = parseFloat(amountMatch[0].replace(/,/g, ''));
    }

    let type: 'income' | 'expense' = 'expense';
    if (
        cleanText.includes('received') ||
        cleanText.includes('got') ||
        cleanText.includes('income') ||
        cleanText.includes('deposit') ||
        cleanText.includes('credit') ||
        cleanText.includes('salary') ||
        cleanText.includes('aaya') ||
        cleanText.includes('mila')
    ) {
        type = 'income';
    }

    let category = 'Other';
    if (type === 'income') {
        if (cleanText.includes('salary')) category = 'Salary';
        else if (cleanText.includes('freelance')) category = 'Freelance';
        else if (cleanText.includes('gift')) category = 'Gift';
    } else {
        if (/(coffee|burger|pizza|food|lunch|dinner|restaurant|swiggy|zomato|tea|snack)/.test(cleanText)) category = 'Food';
        else if (/(taxi|uber|bus|train|flight|gas|fuel|petrol|metro|cab|auto)/.test(cleanText)) category = 'Transport';
        else if (/(clothes|shoes|amazon|buy|bought|shopping|zara|h&m|jeans|shirt)/.test(cleanText)) category = 'Shopping';
        else if (/(movie|netflix|game|cinema|fun|party)/.test(cleanText)) category = 'Entertainment';
        else if (/(electricity|water|internet|bill|rent|recharge|wifi|mobile)/.test(cleanText)) category = 'Bills';
        else if (/(medicine|doctor|hospital|gym|health|yoga)/.test(cleanText)) category = 'Health';
    }

    // Attempt to extract Split details
    // "Paid by Rahul"
    // "Split with Sneha"
    let paidBy = 'me';
    let splitWith: string[] = [];
    let splitRatios: number[] | undefined;

    // Detect Split Ratios/Percentages
    // Pattern 1: "Split 70 30" or "Split 6040" (if joined)
    // Pattern 2: "70 percent" or "70%"

    // Check for "split X Y"
    const splitRatioMatch = cleanText.match(/split\s+(\d+)\s+(\d+)/i);
    if (splitRatioMatch) {
        const v1 = parseFloat(splitRatioMatch[1]);
        const v2 = parseFloat(splitRatioMatch[2]);
        if (v1 + v2 === 100 || v1 + v2 <= 100) { // Tolerate if not exactly 100? Assume percentages.
            splitRatios = [v1, v2];
        }
    } else {
        // Check for specific percentages mentioned
        const percentMatches = cleanText.match(/(\d+)\s*(?:percent|%)/gi);
        if (percentMatches) {
            const ratios = percentMatches.map(p => parseFloat(p));
            if (ratios.length > 0) {
                // If only one percentage is mentioned "I paid 70%", assume the rest is remainder?
                // Let's store what we found. Logic in VoiceInput will handle "remainder".
                splitRatios = ratios;
            }
        }
    }

    // Check "Paid by [Name]" or "[Name] paid"
    for (const friend of lowerFriends) {
        // "Paid by Rahul"
        if (new RegExp(`paid by ${friend}`, 'i').test(cleanText)) {
            // Map back to original casing if possible, or just return the match
            // We need the original casing for the ID lookup ideally, but the app uses IDs.
            // VoiceInput passes names. app logic needs to find friend by name.
            paidBy = friend;
        }
        // "Rahul paid"
        else if (new RegExp(`${friend} paid`, 'i').test(cleanText)) {
            paidBy = friend;
        }
        // Hinglish: "Rahul ne diya" -> "Rahul ne spend" (diya->spend)
        // match "Rahul ne"
        else if (new RegExp(`${friend} ne`, 'i').test(cleanText)) {
            paidBy = friend;
        }
    }

    // Check "Split with [Name]" or just "[Name]" mentioned in context
    // Heuristic: If a friend is mentioned and is NOT the payer, they are likely involved.
    lowerFriends.forEach(friend => {
        if (friend !== paidBy && cleanText.includes(friend)) {
            // Avoid false positives if name equals a common word?
            // "Bill" is a name but also "bill". 
            // "Will" is a name but also "will".
            // We'll trust the user's friend list is unique enough or context is sufficient.

            // Check specific "split" context if needed, but "Lunch with Rahul" is common.
            // So simply `includes` is a good starting point.
            if (!splitWith.includes(friend)) {
                splitWith.push(friend);
            }
        }
    });

    // If splitWith has entries, add 'me' to it? 
    // Usually "Split with Rahul" means "Me and Rahul". 
    // The App logic handles "Me" usually. 
    // But specific return type `splitDetails` expects IDs?
    // VoiceInput returns `ParsedData` which has `splitDetails`.
    // Let's populate `splitDetails`.

    // Let's refine Description clean up
    let description = text;
    if (amountMatch) description = description.replace(amountMatch[0], '');

    description = description
        .replace(/dollars?|rupees?|bucks?|inr/gi, '')
        .replace(/spent|paid|bought|received|got|spain/gi, '')
        .replace(/thousand|lakh/gi, '')
        .replace(/ on /gi, ' ')
        .replace(/ for /gi, ' ')
        .trim();

    description = description.replace(/[^\w\s]/gi, '').trim();
    description = description.charAt(0).toUpperCase() + description.slice(1);
    if (description.length === 0) description = "Voice Entry";

    return {
        amount: amount === 0 ? '' : amount.toString(),
        description,
        category,
        type,
        splitDetails: {
            paidBy,
            splitWith,
            splitRatios
        },
        originalDate: new Date().toISOString()
    };
};
