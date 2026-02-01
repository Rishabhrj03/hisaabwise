
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

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': ['coffee', 'burger', 'pizza', 'food', 'lunch', 'dinner', 'restaurant', 'swiggy', 'zomato', 'tea', 'chai', 'snack', 'khana', 'khane', 'bhojan', 'dudh', 'doodh', 'milk', 'dairy', 'grocery', 'groceries', 'rashan', 'nashta', 'blinkit', 'zepto', 'breakfast'],
    'Transport': ['taxi', 'uber', 'bus', 'train', 'flight', 'gas', 'fuel', 'petrol', 'metro', 'cab', 'auto', 'gadi', 'gaadi', 'bike', 'car', 'ola', 'rapido', 'scooty', 'ride'],
    'Shopping': ['clothes', 'shoes', 'amazon', 'buy', 'bought', 'shopping', 'zara', 'h&m', 'jeans', 'shirt', 'kapde', 'jute', 'kharid', 'myntra', 'ajio', 'flipkart', 'uniqlo', 'kapda'],
    'Entertainment': ['movie', 'netflix', 'game', 'cinema', 'fun', 'party', 'prime', 'hotstar', 'ticket'],
    'Bills': ['electricity', 'water', 'internet', 'bill', 'rent', 'recharge', 'wifi', 'mobile', 'bijli', 'phone', 'jio', 'airtel', 'vi', 'broadband', 'dth'],
    'Health': ['medicine', 'doctor', 'hospital', 'gym', 'health', 'yoga', 'dawai', 'dawa', 'meds', 'pharmacy', '1mg', 'apollo']
};

const FILLER_WORDS = ['ka', 'ke', 'ki', 'liye', 'mein', 'me', 'pe', 'par', 'ko', 'se', 'for', 'on', 'at', 'to', 'in'];

export const parseVoiceInput = (text: string, friends: string[] = []): ParsedData => {
    // 0. Initialize Friend Map early
    const friendMap: Record<string, string> = {};
    friends.forEach(f => {
        friendMap[f.toLowerCase()] = f;
    });

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

    // Added \b at the end to prevent 'ka' matching 'k'
    cleanText = cleanText.replace(/(\d+(?:\.\d+)?)\s*(k|thousand|lakh|crore|hundred)\b/gi, (match, number, unit) => {
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
        cleanText.includes('refund') || cleanText.includes('return') || cleanText.includes('cashback') ||
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
        // Dynamic Category Matching
        for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => cleanText.includes(keyword))) {
                category = catName;
                break; // Stop at first match
            }
        }
    }

    // Split details
    let paidBy = 'me';
    let splitWith: string[] = [];
    let splitRatios: number[] | undefined;
    let unknownFriends: string[] = [];
    const excludedPeople: string[] = [];

    // Advanced Split Logic
    // 1. Check for Colon Ratios (e.g. 30:40:30)
    const ratioMatch = cleanText.match(/(\d+)(?::(\d+))+/);
    if (ratioMatch) {
        const parts = ratioMatch[0].split(':').map(Number);
        const sum = parts.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) < 1 || Math.abs(sum - 10) < 1) { // Allow 10 scale (e.g. 3:4:3)
            splitRatios = parts.map(p => (p / sum) * 100);
        }
    }

    // 2. Check for Explicit Amounts per Person (e.g. "300 Rahul ne, 400 Vijay ne")
    // Regex to find "Number Name" or "Name Number" patterns
    const amountPersonMatches: { name: string; amount: number }[] = [];

    // Heuristic: limit search to friend names + amounts
    lowerFriends.forEach(friend => {
        // "300 Rahul" or "Rahul 300"
        // Handle "Rahul ne 300"
        const patterns = [
            new RegExp(`(\\d+)\\s+${friend}\\b`),
            new RegExp(`\\b${friend}\\s+(?:ne\\s+)?(\\d+)`)
        ];

        for (const pat of patterns) {
            const m = cleanText.match(pat);
            if (m) {
                amountPersonMatches.push({ name: friend, amount: parseFloat(m[1]) });
                break; // Found one pattern for this friend
            }
        }
    });

    if (amountPersonMatches.length > 0 && amount > 0) {
        const totalClaimed = amountPersonMatches.reduce((sum, p) => sum + p.amount, 0);
        // If total matches roughly (allow small margin?) match total amount
        // Or if it's a significant portion.
        // Let's assume valid if > 0. 
        // We need to map these to splitWith and ratios.

        // Strategy: If user specifies amounts, they likely mean *those* people are in the split.
        // We override splitWith with these names.

        // Wait, if totalClaimed != totalAmount?
        // Case: "Total 1000. 300 Rahul, 300 Vijay." -> Remainder 400 is 'Me'?
        // Case: "Total 1000. 300 Rahul, 700 Vijay." -> Me is 0?

        // Let's just calculate percentages based on Total Amount.
        const dynamicSplitWith: string[] = [];
        const dynamicRatios: number[] = [];

        let currentSumParams = 0;

        amountPersonMatches.forEach(p => {
            const originalName = friendMap[p.name];
            if (originalName) {
                dynamicSplitWith.push(originalName);
                const ratio = (p.amount / amount) * 100;
                dynamicRatios.push(ratio);
                currentSumParams += p.amount;
            }
        });

        // If there is a remainder, and 'me' wasn't explicitly mentioned with an amount...
        // usually 'me' takes the rest.
        // BUT `splitWith` array typically implies "Friends I split with". "Me" is implicit payer/participant.
        // The `splitRatios` array in backend usually corresponds to `[Me, ...splitWith]`.
        // Wait, need to check how splitRatios matches splitWith in the backend/UI.
        // Standard convention: splitRatios[0] is often user, then splitWith[0], splitWith[1]...

        // Let's look at `VoiceInput.tsx` or `ParsedData` usage.
        // Actually typical app logic: splitWith = [Friend1, Friend2]. 
        // Type 'expense' implies I paid. 
        // If splitRatios is set, it might need to align with participants.
        // Let's assume we return the ratios for the *Friends* found, and the caller handles the rest?
        // OR: we assume strict N+1 split including Me.

        // If "300 Rahul, 400 Vijay" out of 1000. Me = 300.
        // Ratios: Me:30, Rahul:30, Vijay:40.
        // splitWith should be [Rahul, Vijay]. splitRatios should be [30, 30, 40].

        // Let's construct it.
        if (dynamicSplitWith.length > 0) {
            const remainder = amount - currentSumParams;
            const meRatio = (remainder / amount) * 100;

            // We need to know where 'Me' fits. 
            // Usually [Me, ...Friends].
            splitWith = dynamicSplitWith;
            splitRatios = [meRatio, ...dynamicRatios];
        }
    } else if (ratioMatch && splitRatios) {
        // We have ratios [30, 40, 30]. We need to see who they belong to.
        // We need to match names in the text order?
        // Or if we have splitWith candidates found later.
        // Let's defer mapping to after friend detection?
        // No, let's keep ratios here.
    } else {
        // Standard percent logic fallback
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

    // Date Extraction
    let finalDate = new Date();
    const dateLower = cleanText.toLowerCase();

    if (dateLower.includes('day before yesterday') || dateLower.includes('parso')) {
        finalDate.setDate(finalDate.getDate() - 2);
    } else if (dateLower.includes('yesterday') || dateLower.includes('cal') || dateLower.includes('kal')) {
        // "Kal" in Hindi can be yesterday or tomorrow, context matters but usually yesterday for expenses
        finalDate.setDate(finalDate.getDate() - 1);
    } else if (dateLower.includes('tomorrow')) {
        finalDate.setDate(finalDate.getDate() + 1);
    } else if (dateLower.includes('today') || dateLower.includes('aaj')) {
        // Explicit logic if needed
        finalDate.setDate(finalDate.getDate());
    }

    // Friend Matching with Original Casing
    // Map lower to original for lookup
    // (friendMap is already initialized at the top)

    lowerFriends.forEach(friend => {
        if (friend !== paidBy.toLowerCase() && cleanText.includes(friend)) {
            // Use the original name from the map
            const originalName = friendMap[friend];
            if (originalName && !splitWith.includes(originalName)) {
                splitWith.push(originalName);
            }
        }
    });

    // Also fix paidBy casing if possible
    if (paidBy !== 'me' && friendMap[paidBy]) {
        paidBy = friendMap[paidBy];
    }

    const withMatches = cleanText.matchAll(/(?:split\s+with|with)\s+([a-zA-Z]+)(?:\s+(?:bhai|bro|sir|maam|ji))?/gi);
    for (const match of withMatches) {
        let potentialName = match[1];
        const lowerPot = potentialName.toLowerCase();

        // If we found it in our friend list, use the canonical version
        if (friendMap[lowerPot]) {
            potentialName = friendMap[lowerPot];
            if (!splitWith.includes(potentialName)) {
                splitWith.push(potentialName);
            }
            continue;
        }

        const stopWords = ['me', 'us', 'him', 'her', 'them', 'all', 'everyone', 'some', 'rupees', 'bucks', 'cash', 'card', 'upi', 'yesterday', 'today', 'tomorrow'];

        if (!lowerFriends.includes(lowerPot) && !stopWords.includes(lowerPot) && lowerPot.length > 2) {
            // Capitalize for unknown friend
            potentialName = potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
            if (!unknownFriends.includes(potentialName) && lowerPot !== 'split' && lowerPot !== 'friends') {
                unknownFriends.push(potentialName);
            }
        }
    }

    // Check for hanging exclusion first
    // "but not including" at the end, or "not including" followed by nothing useful.
    if (/(?:but\s+)?not\s+including\s*$/i.test(cleanText)) {
        // Implicitly exclude the last added person
        if (splitWith.length > 0) excludedPeople.push(splitWith[splitWith.length - 1].toLowerCase());
        if (unknownFriends.length > 0) excludedPeople.push(unknownFriends[unknownFriends.length - 1].toLowerCase());
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
                excludedPeople.push(splitWith[splitWith.length - 1].toLowerCase());
            }
            if (unknownFriends.length > 0) {
                excludedPeople.push(unknownFriends[unknownFriends.length - 1].toLowerCase());
            }
        } else if (['splitwise', 'split'].includes(name)) {
            // Noise
        } else {
            excludedPeople.push(name);
        }
    }

    splitWith = splitWith.filter(p => !excludedPeople.includes(p.toLowerCase()));
    if (unknownFriends.length > 0) {
        unknownFriends = unknownFriends.filter(p => !excludedPeople.includes(p.toLowerCase()));
    }

    // Clean Description
    let description = text;
    if (amountMatch) description = description.replace(amountMatch[0], '');

    // Remove filler words
    const fillerRegex = new RegExp(`\\b(${FILLER_WORDS.join('|')})\\b`, 'gi');
    description = description.replace(fillerRegex, '');

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
        .replace(/yesterday|tomorrow|today|aaj|kal|cal|parso/gi, '') // Remove date words
        .replace(/on /gi, ' ')
        .replace(/for /gi, ' ')
        .trim();

    // Optional: Remove the category keyword itself if it appears (e.g. "Uber" in "Uber ride")
    // ONLY if it's not the entire description. 
    // Heuristic: If we matched a category, try to remove that keyword to keep it clean?
    // Let's remove the exact keyword matched if found.
    if (category !== 'Other') {
        const keywords = CATEGORY_KEYWORDS[category] || [];
        for (const kw of keywords) {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            // description = description.replace(regex, ''); // aggressive?
            // Maybe keep it for now as user might say "Uber ride to work", removing "Uber" leaves "ride to work".
            // If user says "Uber", removing it leaves "".
        }
    }

    description = description.replace(/[^\w\s]/gi, '').trim();
    description = description.charAt(0).toUpperCase() + description.slice(1);

    // Fallback if description became empty after cleaning
    if (description.length === 0) {
        // Restore category as description or generic
        description = category !== 'Other' ? category : "Voice Entry";
    }

    // Format date as YYYY-MM-DD
    const year = finalDate.getFullYear();
    const month = String(finalDate.getMonth() + 1).padStart(2, '0');
    const day = String(finalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

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
        originalDate: formattedDate
    };
};
