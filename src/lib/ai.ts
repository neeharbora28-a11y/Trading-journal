import { GoogleGenAI } from "@google/genai";
import { Trade, DailyLog } from "../store";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

const MODEL_NAME = "gemini-3-flash-preview";

export async function generateTradeReflection(trade: Trade): Promise<string> {
  const prompt = `
    As an expert trading coach, provide a 2-3 sentence actionable reflection on this trade.
    Trade Details:
    - Pair: ${trade.pair}
    - Direction: ${trade.direction}
    - Setup: ${trade.setup}
    - Result: ${trade.result > 0 ? "Win" : "Loss"} ($${trade.result})
    - Emotion: ${trade.emotion}
    - User Notes: ${trade.notes}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Unable to generate reflection at this time.";
  } catch (error) {
    console.error("AI Reflection Error:", error);
    return "AI insight unavailable.";
  }
}

export async function generateWeeklySummary(trades: Trade[], dailyLogs: DailyLog[]): Promise<string> {
  const tradesSummary = trades.map(t => 
    `- ${t.date}: ${t.pair} ${t.direction} (${t.setup}) - Result: $${t.result}`
  ).join("\n");
  
  const psychologySummary = dailyLogs.map(l => 
    `- ${l.date}: Discipline: ${l.discipline}/10, Stress: ${l.stress}/10. Notes: ${l.notes}`
  ).join("\n");

  const prompt = `
    Generate a professional weekly trading report based on these trades and psychology logs.
    Keep it concise but insightful. Focus on the relationship between mental state and performance.
    
    Trades:
    ${tradesSummary}
    
    Psychology Logs:
    ${psychologySummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Weekly summary could not be generated.";
  } catch (error) {
    console.error("AI Weekly Summary Error:", error);
    return "Weekly summary unavailable.";
  }
}

export async function detectTradingPatterns(trades: Trade[]): Promise<string[]> {
  const tradesData = trades.map(t => 
    `- ${t.pair}, ${t.setup}, Result: ${t.result > 0 ? "Win" : "Loss"}, Emotion: ${t.emotion}`
  ).join("\n");

  const prompt = `
    Analyze these trades and return exactly 3-5 detected patterns or behavioral habits.
    Return them as a simple list.
    
    Recent Trades:
    ${tradesData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    const text = response.text || "";
    return text.split("\n")
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-\d.]+\s*/, "").trim())
      .slice(0, 5);
  } catch (error) {
    console.error("AI Pattern Detection Error:", error);
    return ["Pattern detection currently unavailable."];
  }
}
