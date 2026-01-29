
interface ParsedData {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    splitDetails?: {
        paidBy: string;
        splitWith: string[];
        splitRatios?: number[];
        unknownFriends?: string[];
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
                }
            }
        }
    });

    // Fix common mishearings & Hinglish support
    const mishearings: Record<string, string> = {
        'spain': 'spend', 'pane': 'spend', 'spent': 'spend', 'got': 'income', 'bill': 'bill',
        'ek': '1', 'do': '2', 'teen': '3', 'chaar': '4', 'char': '4',
        'paanch': '5', 'panch': '5', 'che': '6', 'saat': '7', 'aath': '8', 'nau': '9',
        'dus': '10', 'gyara': '11', 'barah': '12',
        'bees': '20', 'tis': '30', 'tice': '30', 'pachaas': '50', 'pachas': '50',
        'sau': 'hundred', 'hajar': 'thousand', 'hazzar': 'thousand', 'hazaar': 'thousand', 'azar': 'thousand',
        'lakh': 'lakh', 'lac': 'lakh', 'crore': 'crore',
        'kharcha': 'expense', 'aaya': 'income', 'aaye': 'income', 'mila': 'income',
        'diya': 'spend', 'gaya': 'spend'
    };

    // Apply standard mishearings
    Object.keys(mishearings).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        cleanText = cleanText.replace(regex, mishearings[key]);
    });

    // Special handling for "Das" (10) vs Friend Name "Das"
    if (cleanText.includes('das')) {
        let isFriend = false;
        if (lowerFriends.includes('das')) {
            if (/\bdas\s+(hazaar|thousand|sau|hundred|lakh|crore)\b/.test(cleanText)) {
                isFriend = false;
            } else {
                isFriend = true;
            }
        }
        if (!isFriend) {
            cleanText = cleanText.replace(/\bdas\b/g, '10');
        }
    }

    const multiplierMap: Record<string, number> = {
        'k': 1000, 'thousand': 1000, 'lakh': 100000, 'crore': 10000000, 'hundred': 100
    };

    cleanText = cleanText.replace(/(\d+(?:\.\d+)?)\s*(k|thousand|lakh|crore|hundred)/gi, (match, number, unit) => {
        const num = parseFloat(number);
        const mult = multiplierMap[unit.toLowerCase()];
        return (num * mult).toString();
    });

    cleanText = cleanText.replace(/\b(a\s)?thousand\b/gi, '1000');
    cleanText = cleanText.replace(/\b(a\s)?hundred\b/gi, '100');
    cleanText = cleanText.replace(/\b(a\s)?lakh\b/gi, '100000');

    // Classification Logic
    let amount = 0;
    const amountMatch = cleanText.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
    if (amountMatch) {
        amount = parseFloat(amountMatch[0].replace(/,/g, ''));
    }

    let type: 'income' | 'expense' = 'expense';
    if (
        cleanText.includes('received') || cleanText.includes('got') || cleanText.includes('income') ||
        cleanText.includes('deposit') || cleanText.includes('credit') || cleanText.includes('salary') ||
        cleanText.includes('aaya') || cleanText.includes('aaye') || cleanText.includes('mila')
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

    // Split details
    let paidBy = 'me';
    let splitWith: string[] = [];
    let splitRatios: number[] | undefined;
    let unknownFriends: string[] = [];
    const excludedPeople: string[] = [];

    const splitRatioMatch = cleanText.match(/split\s+(\d+)\s+(\d+)/i);
    if (splitRatioMatch) {
        const v1 = parseFloat(splitRatioMatch[1]);
        const v2 = parseFloat(splitRatioMatch[2]);
        if (v1 + v2 === 100 || v1 + v2 <= 100) {
            splitRatios = [v1, v2];
        }
    } else {
        const percentMatches = cleanText.match(/(\d+)\s*(?:percent|%)/gi);
        if (percentMatches) {
            const ratios = percentMatches.map(p => parseFloat(p));
            if (ratios.length > 0) {
                splitRatios = ratios;
            }
        }
    }

    for (const friend of lowerFriends) {
        if (new RegExp(`paid by ${friend}`, 'i').test(cleanText)) {
            paidBy = friend;
        } else if (new RegExp(`${friend} paid`, 'i').test(cleanText)) {
            paidBy = friend;
        } else if (new RegExp(`${friend} ne`, 'i').test(cleanText)) {
            paidBy = friend;
        }
    }

    lowerFriends.forEach(friend => {
        if (friend !== paidBy && cleanText.includes(friend)) {
            if (!splitWith.includes(friend)) {
                splitWith.push(friend);
            }
        }
    });

    const withMatches = cleanText.matchAll(/(?:split\s+with|with)\s+([a-zA-Z]+)(?:\s+(?:bhai|bro|sir|maam|ji))?/gi);
    for (const match of withMatches) {
        const potentialName = match[1].toLowerCase();
        const stopWords = ['me', 'us', 'him', 'her', 'them', 'all', 'everyone', 'some', 'rupees', 'bucks', 'cash', 'card', 'upi'];

        if (!lowerFriends.includes(potentialName) && !stopWords.includes(potentialName) && potentialName.length > 2) {
            if (!unknownFriends.includes(potentialName) && potentialName !== 'split' && potentialName !== 'friends') {
                unknownFriends.push(potentialName);
            }
        }
    }

    // Check for hanging exclusion first?
    // "but not including" at the end, or "not including" followed by nothing useful.
    if (/(?:but\s+)?not\s+including\s*$/i.test(cleanText)) {
        // Implicitly exclude the last added person
        if (splitWith.length > 0) excludedPeople.push(splitWith[splitWith.length - 1]);
        if (unknownFriends.length > 0) excludedPeople.push(unknownFriends[unknownFriends.length - 1]);
    }

    const excludeMatches = cleanText.matchAll(/(?:exclude|don't\s+include|not\s+include|not\s+including|not\s+for|except)\s+(me|myself|him|her|them|us|in\s+the\s+split|split\s+wise|splitwise|[a-zA-Z]+)(?:\s+(?:bhai|bro|sir|maam|ji))?/gi);
    for (const match of excludeMatches) {
        const name = match[1].toLowerCase();

        if (name === 'me' || name === 'myself') {
            excludedPeople.push('me');
        } else if (name.includes('in') && name.includes('split')) {
            excludedPeople.push('me');
        } else if (['him', 'her', 'them'].includes(name)) {
            // Heuristic: Exclude last added person
            if (splitWith.length > 0) {
                excludedPeople.push(splitWith[splitWith.length - 1]);
            }
            if (unknownFriends.length > 0) {
                excludedPeople.push(unknownFriends[unknownFriends.length - 1]);
            }
        } else if (['splitwise', 'split'].includes(name)) {
            // Noise
        } else {
            excludedPeople.push(name);
        }
    }

    splitWith = splitWith.filter(p => !excludedPeople.includes(p));
    if (unknownFriends.length > 0) {
        unknownFriends = unknownFriends.filter(p => !excludedPeople.includes(p));
    }

    let description = text;
    if (amountMatch) description = description.replace(amountMatch[0], '');

    description = description
        .replace(/dollars?|rupees?|bucks?|inr|rs/gi, '')
        .replace(/spent|paid|bought|received|got|spain/gi, '')
        .replace(/thousand|lakh/gi, '')
        .replace(/split with/gi, '')
        .replace(/don't include \w+/gi, '')
        .replace(/not include \w+/gi, '')
        .replace(/not including/gi, '')
        .replace(/exclude \w+/gi, '')
        .replace(/not for \w+/gi, '')
        .replace(/in the split/gi, '')
        .replace(/split\s?wise/gi, '')
        .replace(/on /gi, ' ')
        .replace(/for /gi, ' ')
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
            splitRatios,
            unknownFriends: unknownFriends.length > 0 ? unknownFriends : undefined
        },
        originalDate: new Date().toISOString()
    };
};
