
console.log("1. Script started...");

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("2. Modules loaded...");

const app = express(); // puru is here // fo

app.use(cors());
app.use(express.json());


const API_KEY = ""; 

if (!API_KEY || API_KEY.startsWith("PASTE_")) {
    console.error(" CRITICAL ERROR: You didn't paste your API Key in server/ai.js!");
    process.exit(1);
}

console.log("3. API Key is set.");

const genAI = new GoogleGenerativeAI("");
console.log("4. Google Generative AI client initialized.");

const SYSTEM_PROMPT = `
Return strictly valid JSON for a whiteboard app.
Format: { "shapes": [ { "id": "1", "type": "rect", "x": 0, "y": 0, "text": "Label", "fill": "#ff6b6b" } ], "connectors": [] }
`;

app.get('/', (req, res) => {
    res.send("AI Server is UP and Running! ");
});

app.post('/generate', async (req, res) => {
  console.log(" Received Request:", req.body);
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Sending to Gemini...");
    const result = await model.generateContent(SYSTEM_PROMPT + "\nPrompt: " + prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw AI Response:", text.substring(0, 50) + "..."); 

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    
    res.json(data);

  } catch (error) {
    console.error("ERROR DURING GENERATION:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ SUCCESS: AI Server is running on http://localhost:${PORT}`);
});
