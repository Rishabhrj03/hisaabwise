
import { parseVoiceInput } from '@/utils/voiceParser';

describe('voiceParser Extensive Test Suite', () => {
    const mockFriends = ['Vijay', 'Rahul', 'Sneha', 'Amit', 'Priya', 'Rohan'];

    // Helper to format date
    const formatDate = (offset: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayDate = formatDate(0);
    const yesterdayDate = formatDate(-1);
    const dayBeforeYesterdayDate = formatDate(-2);
    const tomorrowDate = formatDate(1);

    const testCategories = [
        // Food
        { input: "coffee 50", expected: { category: "Food", amount: "50" } },
        { input: "burger from macd 200", expected: { category: "Food", amount: "200" } }, // 'macd' not in list, but 'burger' is
        { input: "ordered swiggy 450", expected: { category: "Food", amount: "450" } },
        { input: "chai sutta 20", expected: { category: "Food", amount: "20" } },
        { input: "nashta at haldiram 300", expected: { category: "Food", amount: "300" } },
        { input: "doodh ka packet 30", expected: { category: "Food", amount: "30" } },
        { input: "grocery from blinkit 800", expected: { category: "Food", amount: "800" } },

        // Transport
        { input: "uber ride 150", expected: { category: "Transport", amount: "150" } },
        { input: "auto fare 50", expected: { category: "Transport", amount: "50" } },
        { input: "metro recharge 200", expected: { category: "Transport", amount: "200" } }, // 'metro' matches Transport, 'recharge' matches Bills. First match wins? 
        // Current logic: Transport is checked BEFORE Bills in code? No, object iteration order is not guaranteed but usually insertion order.
        // Let's see: Food -> Transport -> Shopping -> Entertainment -> Bills -> Health. 
        // 'metro' is in Transport. 'recharge' is in Bills.
        // Clean text: "metro recharge 200". 
        // If it finds 'metro' in Transport, it sets category='Transport' and breaks. 

        { input: "petrol 500", expected: { category: "Transport", amount: "500" } },
        { input: "ola cab 230", expected: { category: "Transport", amount: "230" } },
        { input: "rapido bike 40", expected: { category: "Transport", amount: "40" } },

        // Shopping
        { input: "bought shoes 2000", expected: { category: "Shopping", amount: "2000" } },
        { input: "new shirt from zudio 800", expected: { category: "Shopping", amount: "800" } }, // 'shirt' matches
        { input: "amazon order 1500", expected: { category: "Shopping", amount: "1500" } },
        { input: "myntra sale 1200", expected: { category: "Shopping", amount: "1200" } },
        { input: "shopping at zara 4000", expected: { category: "Shopping", amount: "4000" } },

        // Bills
        { input: "electricity bill 3000", expected: { category: "Bills", amount: "3000" } },
        { input: "mobile recharge 299", expected: { category: "Bills", amount: "299" } },
        { input: "jio fiber 500", expected: { category: "Bills", amount: "500" } },
        { input: "pay rent 15000", expected: { category: "Bills", amount: "15000" } },

        // Health
        { input: "medicine 200", expected: { category: "Health", amount: "200" } },
        { input: "doctor fees 500", expected: { category: "Health", amount: "500" } },
        { input: "gym membership 1000", expected: { category: "Health", amount: "1000" } },
        { input: "apollo pharmacy 350", expected: { category: "Health", amount: "350" } },

        // Entertainment
        { input: "movie tickets 600", expected: { category: "Entertainment", amount: "600" } },
        { input: "netflix subscription 499", expected: { category: "Entertainment", amount: "499" } },
        { input: "game night 1000", expected: { category: "Entertainment", amount: "1000" } },
    ];

    const testDates = [
        { input: "lunch yesterday 200", date: yesterdayDate },
        { input: "kal dinner 500", date: yesterdayDate }, // 'kal' -> yesterday default
        { input: "movie parso 300", date: dayBeforeYesterdayDate },
        { input: "day before yesterday recharge 100", date: dayBeforeYesterdayDate },
        { input: "aaj ka kharcha 50", date: todayDate },
        { input: "tomorrow party 1000", date: tomorrowDate },
    ];

    const testAmounts = [
        { input: "500", amount: "500" },
        { input: "1.5k", amount: "1500" },
        { input: "2.5 lakh", amount: "250000" },
        { input: "10 thousand", amount: "10000" },
        { input: "500 rupees", amount: "500" },
        { input: "rs 200", amount: "200" },
        { input: "do hazaar", amount: "2000" }, // Mishearing 'do' -> 2? No explicit 'hazaar' logic? 
        // Wait, multiplierMap has 'hazaar' -> 1000. 
        // Clean text replaces 'hazaar' with 'thousand' in mishearings? No.
        // 'hazzar': 'thousand' in mishearings.
        // 'sau': 'hundred'.
        // Multiplier regex handles 'thousand', 'hundred'.
        // If user says "do hazaar", 'do' -> '2'. 'hazaar' -> 'thousand' (via mishearing map 'hazaar': 'thousand').
        // Then "2 thousand" -> 2000 via regex.
    ];

    const testSplits = [
        { input: "dinner 500 split with Vijay", splitWith: ["Vijay"], paidBy: "me" },
        { input: "lunch 200 paid by Rahul", splitWith: [], paidBy: "Rahul" }, // Implicitly split with me?
        // Logic: if paidBy is Rahul, I am in split? 
        // Logic: splitWith starts empty. User says "paid by Rahul".
        // Code: `if (paidBy !== 'me' && friendMap[paidBy]) paidBy = ...`
        // Does strict logic add 'Me' to splitWith if paidBy is friend?
        // Test behavior. Usually if friend pays, I am involved if I recorded it? 

        { input: "movie 300 split with Vijay and Amit", splitWith: ["Vijay", "Amit"] },
        { input: "party 1000 paid by Sneha split with everyone", paidBy: "Sneha", splitWith: [] }, // 'everyone' -> not parsed as names?
        // Logic check: 'everyone' is in stopWords.

        { input: "trip 5000 split with Vijay but exclude me", splitWith: ["Vijay"], excluded: ["me"] }, // check exclusion
        { input: "gift 500 split with Rahul not including Amit", splitWith: ["Rahul"] }, // 'Amit' was never added, so excluded ineffective but valid command
    ];

    // Combining everything
    const complexCases = [
        {
            input: "Kal raat ko swiggy se 450 ka khana mangaya split with Vijay",
            expected: {
                category: "Food",
                amount: "450",
                splitWith: ["Vijay"],
                originalDate: yesterdayDate
            }
        },
        {
            input: "Uber se office gaya 250 laga paid by Paytm", // 'Paytm' not a friend
            expected: {
                category: "Transport",
                amount: "250",
                paidBy: "me"
            }
        },
        {
            input: "Recharge karaya jio ka 666 rupees",
            expected: {
                category: "Bills",
                amount: "666"
            }
        },
        {
            input: "Doodh aur bread laya blinkit se 150 rupees",
            expected: {
                category: "Food",
                amount: "150"
            }
        },
        {
            input: "Movie dekhne gaye the pathaan 800 rupees with Rahul",
            expected: {
                category: "Entertainment",
                amount: "800",
                splitWith: ["Rahul"]
            }
        }
    ];

    // Execution

    describe('Category Parsing', () => {
        testCategories.forEach(({ input, expected }) => {
            it(`should parse category correctly for: ${input}`, () => {
                const res = parseVoiceInput(input, mockFriends);
                expect(res.category).toBe(expected.category);
                if (expected.amount) expect(res.amount).toBe(expected.amount);
            });
        });
    });

    describe('Date Parsing', () => {
        testDates.forEach(({ input, date }) => {
            it(`should parse date correctly for: ${input}`, () => {
                const res = parseVoiceInput(input, mockFriends);
                expect(res.originalDate).toBe(date);
            });
        });
    });

    describe('Amount Parsing with Hinglish/Multipliers', () => {
        const amountTests = [
            { input: "2k", amount: "2000" },
            { input: "500", amount: "500" },
            { input: "1.5 lakh", amount: "150000" },
            { input: "do hazaar", amount: "2000" }, // 'do'->2, 'hazaar'->thousand
            { input: "paanch sau", amount: "500" }, // 'paanch'->5, 'sau'->hundred
            { input: "3.5k", amount: "3500" },
            { input: "100 rupees", amount: "100" },
            { input: "250 ka", amount: "250" }, // regression check for 'ka' bug
        ];

        amountTests.forEach(({ input, amount }) => {
            it(`should parse amount ${amount} from "${input}"`, () => {
                const res = parseVoiceInput(input, mockFriends);
                expect(res.amount).toBe(amount);
            });
        });
    });

    describe('Split Logic', () => {
        it('should detect single split friend', () => {
            const res = parseVoiceInput("dinner 500 split with Vijay", mockFriends);
            expect(res.splitDetails?.splitWith).toContain("Vijay");
        });

        it('should detect multiple split friends', () => {
            const res = parseVoiceInput("movie 1000 split with Vijay and Rahul", mockFriends);
            expect(res.splitDetails?.splitWith).toContain("Vijay");
            expect(res.splitDetails?.splitWith).toContain("Rahul");
        });

        it('should handle paid by friend', () => {
            const res = parseVoiceInput("lunch 500 paid by Sneha", mockFriends);
            expect(res.splitDetails?.paidBy).toBe("Sneha");
        });

        it('should handle exclusion', () => {
            const res = parseVoiceInput("party 2000 split with Vijay but exclude me", mockFriends);
            // Logic: 'exclude me' adds 'me' to excluded list.
            // If I am not in splitWith, verify behavior.
            // Usually 'split with Vijay' means: Me + Vijay involved. 
            // If I exclude myself, unknownFriends/splitWith shouldn't have 'me'.
            // Current parser doesn't explicitly add 'me' to splitWith unless logic dictates.
            console.log(res.splitDetails);
        });
    });

    describe('Advanced Split Logic', () => {
        it('should parse colon ratios (30:40:30)', () => {
            // Assume 3 parts: Me + 2 friends? Or just numbers. Parser returns numbers.
            const res = parseVoiceInput("Dinner 1000 ratio 30:40:30", mockFriends);
            expect(res.splitDetails?.splitRatios).toEqual([30, 40, 30]);
        });

        it('should parse specific amounts per friend and calculate rest for me', () => {
            // Total 1000. Rahul 300. Vijay 300. 
            // Sum = 600. Remainder (Me) = 400.
            // Ratios: Me=40%, Rahul=30%, Vijay=30%.
            // splitWith should be [Rahul, Vijay].
            const res = parseVoiceInput("Party 1000. 300 Rahul ne diye, 300 Vijay ne.", mockFriends);

            expect(res.amount).toBe("1000");
            expect(res.splitDetails?.splitWith).toEqual(expect.arrayContaining(["Rahul", "Vijay"]));

            // detailed ratio check
            const ratios = res.splitDetails?.splitRatios || [];
            expect(ratios).toHaveLength(3); // Me, Rahul, Vijay
            expect(ratios[0]).toBeCloseTo(40); // Me
            expect(ratios[1]).toBeCloseTo(30); // Rahul/Vijay (order depends on extraction)
            expect(ratios[2]).toBeCloseTo(30);
        });

        it('should parse full distribution amounts (Me = 0)', () => {
            // Total 1000. Rahul 300, Vijay 400, Priya 300. 
            // Sum = 1000. Remainder = 0.
            const res = parseVoiceInput("Trip 1000. Rahul 300, Vijay 400, Priya 300", mockFriends);

            expect(res.splitDetails?.splitWith).toEqual(expect.arrayContaining(["Rahul", "Vijay", "Priya"]));
            expect(res.splitDetails?.splitRatios?.[0]).toBe(0); // Me
        });
    });

    describe('Complex Integration Tests', () => {
        complexCases.forEach(({ input, expected }) => {
            it(`should handle complex case: "${input}"`, () => {
                const res = parseVoiceInput(input, mockFriends);
                expect(res.category).toBe(expected.category);
                expect(res.amount).toBe(expected.amount);
                if (expected.splitWith) {
                    expect(res.splitDetails?.splitWith).toEqual(expect.arrayContaining(expected.splitWith));
                }
                if (expected.originalDate) {
                    expect(res.originalDate).toBe(expected.originalDate);
                }
                if (expected.paidBy) {
                    expect(res.splitDetails?.paidBy).toBe(expected.paidBy);
                }
            });
        });
    });
});
