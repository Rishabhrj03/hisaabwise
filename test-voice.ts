
import { parseVoiceInput } from './src/utils/voiceParser';

const text = "Spent 500 on clothes";
const result = parseVoiceInput(text);

console.log("Input:", text);
console.log("Parsed Result:", JSON.stringify(result, null, 2));

if (result.amount === "500" && result.category === "Shopping" && result.type === "expense") {
    console.log("✅ Parsing Successful");
} else {
    console.log("❌ Parsing Failed");
}
