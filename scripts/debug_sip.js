
const P = 1000;
const rate = 12;
const years = 1;

const i = rate / 100;
const n = years * 12;
const r = i / 12;

console.log("Inputs:", { P, rate, years, i, n, r });
console.log("Target Return: 766");
console.log("Target Total: 12766");

// 1. Annuity Due (Investment at BO Moth) - My Implementation
const v1 = P * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
console.log("1. Annuity Due (Beginning of Month):", v1.toFixed(2));

// 2. Annuity Immediate (Investment at EO Month)
const v2 = P * (Math.pow(1 + r, n) - 1) / r;
console.log("2. Annuity Immediate (End of Month):", v2.toFixed(2));

// 3. Simple Interest on Monthly Balances
// Month 1: 1000 invested for 12 months? No, simple interest usually doesn't work like this for SIP but...
// Interest = P * r * (n + n-1 + ... + 1)/12
const totalInterestSimple = P * i * (n * (n + 1) / 2) / 12;
console.log("3. Simple Interest Sum:", (P * n + totalInterestSimple).toFixed(2));

// 4. Daily Compounding?
const dailyRate = i / 365;
// Assuming 30 days per month
let totalDaily = 0;
for (let m = 0; m < n; m++) {
    // Each installment roughly
    // This is complex, let's just try 30.416 days
}

// 5. EAR Logic (12% is Effective Annual Rate, not Nominal)
const r_ear = Math.pow(1 + i, 1 / 12) - 1;
const v5 = P * ((Math.pow(1 + r_ear, n) - 1) * (1 + r_ear)) / r_ear;
console.log("5. Annuity Due with EAR:", v5.toFixed(2));

// 6. Monthly compounding, but investment happens at specific intervals?
// Let's brute force "XIRR" style? No, we need forward projection.

// 7. Groww often uses Monthly Compounding, but maybe the result 12766 comes from specific date logic?
// If we assume investment on 1st of each month, and value on 1st of 13th month?

// Let's try 12,766 exactly.
// 12766 is the value.
// Maybe they use Simple Interest but rate is slightly different?
// Or maybe they exclude the last month's interest?
// End of Month (12682) is too low.
// Start of Month (12809) is too high.
// Average? (12682 + 12809)/2 = 12745. Close.

// What if return is calculated on average balance?
// Avg Balance = (1000 + 12000)/2 = 6500? No.

// Try daily compounding with 365 days
// Rate per day = 12% / 365 = 0.0328%
const dailyR = 0.12 / 365;
let dailyTotal = 0;
// 12 investments
for (let j = 0; j < 12; j++) {
    // Investment grows for (12-j) months
    // Approx 30.416 days per month * (12-j)
    const days = (12 - j) * (365 / 12);
    dailyTotal += P * Math.pow(1 + dailyR, days);
}
console.log("6. Daily Compounding (365/12 days per month):", dailyTotal.toFixed(2));

