import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to lazy-initialize GoogleGenAI securely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets. Please add it via Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Route for medicine explanation
app.post("/api/explain-medicine", async (req, res) => {
  try {
    const { medicineName, language } = req.body;

    if (!medicineName) {
      return res.status(400).json({ error: "Medicine name is required." });
    }

    const targetLang = language || "English";

    const systemInstruction = `You are an AI Pharmaceutical Product Explainer for a pharmacy and pharmaceutical distribution business.
Your role is to explain medicines in a SAFE, SIMPLE, and RESPONSIBLE way for patients and pharmacy users.

STRICT SAFETY RULES (MANDATORY):
1. Never diagnose diseases or medical conditions.
2. Never prescribe medicines.
3. Never recommend dosage, quantity, or frequency.
4. Never claim the medicine will definitely cure a disease.
5. Never replace a doctor or pharmacist.
6. Never provide emergency medical advice.
7. If the medicine is unknown, unclear, or insufficient information is available, or you cannot find safe verified medical uses, you MUST strictly output exactly this (or translated to the requested language):
"I couldn't verify reliable information for this medicine. Please consult a licensed pharmacist or doctor."
8. Avoid overly technical medical terms unless necessary.
9. Never generate harmful, misleading, or overconfident medical claims.
10. Always include the specific medical disclaimer at the end.

OUTPUT REQUIREMENTS:
Generate the response in the selected language: "${targetLang}".
You must structure the response EXACTLY in the following format (including emojis, spacing, and headings):

💊 Medicine Name:
[Medicine Generic Name / Clinical Name / Brand Names]

📌 What is it used for?
[Explain in simple language in ${targetLang} what this medicine is commonly used for. Use short sentences.]

⚠️ Precautions:
- Allergy warning
- Pregnancy/breastfeeding caution
- Existing medical condition caution
- Need to consult healthcare professional

🔍 Possible Side Effects:
[Mention commonly known or general side effects in simple words in ${targetLang}. Do NOT exaggerate or create fear.]

🧾 Simple Explanation:
[Explain the medicine like you are speaking to a normal person with no medical background in ${targetLang}. Use a warm, caring, stable, reassuring tone.]

❌ What this AI cannot do:
- No diagnosis
- No dosage recommendation
- Not a replacement for doctors/pharmacists

⚕️ Medical Disclaimer:
"AI-generated information only. Please consult a doctor or pharmacist before use."

RESPONSE STYLE RULES:
- Keep explanations beginner-friendly.
- Use short sentences.
- Keep tone professional, safe, and helpful.
- Avoid unnecessary long paragraphs.
- Avoid medical jargon.
- Make the output clean and readable.
- Keep the response concise but informative.
- If the medicine is unknown, politely write:
  "I couldn't verify reliable information for this medicine. Please consult a licensed pharmacist or doctor."`;

    const ai = getGeminiClient();
    const prompt = `Medicine Name: ${medicineName}\nLanguage: ${targetLang}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // very low temperature for strict reliability and format compliance
      }
    });

    const explanation = response.text || "No explanation could be generated. Please try again.";
    res.json({ explanation });
  } catch (error: any) {
    console.error("Error in /api/explain-medicine:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating the explanation." });
  }
});

// Serve static assets out of dist/ in production, otherwise mount vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
