
function parseNumberWords(text) {
    let cleanText = text.toLowerCase();

    // Fix common mishearings & Hinglish support
    const mishearings = {
        'spain': 'spend',
        'pane': 'spend',
        'spent': 'spend',
        'got': 'income',
        'bill': 'bill',
        'ek': '1', 'do': '2', 'teen': '3', 'chaar': '4', 'char': '4',
        'paanch': '5', 'panch': '5', 'che': '6', 'saat': '7', 'aath': '8',
        'nau': '9', 'das': '10', 'dus': '10', 'gyara': '11', 'barah': '12',
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

    Object.keys(mishearings).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        cleanText = cleanText.replace(regex, mishearings[key]);
    });

    const multiplierMap = {
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

    return cleanText;
}

const input = "Das Azar payment Aaya";
const processed = parseNumberWords(input);
console.log("Input:", input);
console.log("Processed:", processed);

let amount = 0;
const amountMatch = processed.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
if (amountMatch) {
    amount = parseFloat(amountMatch[0].replace(/,/g, ''));
}
console.log("Extracted Amount:", amount);

let type = 'expense';
if (processed.includes('received') || processed.includes('got') || processed.includes('income') || processed.includes('aaya') || processed.includes('mila')) {
    type = 'income';
}
console.log("Detected Type:", type);
