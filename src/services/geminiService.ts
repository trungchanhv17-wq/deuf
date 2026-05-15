import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, FeedbackResult } from "../types";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

const SYSTEM_PROMPT = `Bạn là một chuyên gia ngôn ngữ tiếng Đức hướng dẫn người Việt học tiếng Đức. 
Nhiệm vụ của bạn là:
1. Dịch câu tiếng Việt của người dùng sang tiếng Đức một cách tự nhiên nhất.
2. Cung cấp cách phát âm (phiên âm dễ đọc).
3. Phân tích chi tiết ngữ pháp, cấu trúc câu và từ vựng trong câu đã dịch (Breakdown). Giải thích tại sao dùng cấu trúc đó.
4. Nếu câu của người dùng có thể dịch theo nhiều cách (trang trọng/thân mật), hãy liệt kê ra.

Hãy trả về kết quả dưới dạng JSON.`;

const SYSTEM_PROMPT_CHECKER = `Bạn là một chuyên gia ngôn ngữ tiếng Đức hướng dẫn người Việt học tiếng Đức. 
Nhiệm vụ của bạn là kiểm tra bài dịch của người dùng.
Đầu vào bao gồm:
- Câu gốc (Tiếng Việt)
- Bài làm của người dùng (Tiếng Đức)

Bạn cần:
1. Chấm điểm độ chính xác (0-100).
2. Kiểm tra lỗi chính tả, ngữ pháp, mạo từ (der/die/das), chia động từ và vị trí động từ.
3. Nếu bài làm có sai sót, hãy giải thích chi tiết tại sao sai và sửa lại cho đúng.
4. Cung cấp phiên âm cho câu đúng.
5. Luôn khích lệ người dùng.

Trả về kết quả dưới dạng JSON.`;

const SYSTEM_PROMPT_GENERATOR = `Bạn là một giáo viên tiếng Đức. Hãy đưa ra MỘT câu tiếng Việt thông dụng (độ khó từ A1 đến B1) để người dùng luyện dịch sang tiếng Đức.
Lưu ý: Chỉ trả về một đối tượng JSON có thuộc tính "prompt".`;

export async function generateQuizPrompt(): Promise<string> {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hãy cho tôi một câu tiếng Việt mới để luyện dịch.",
      config: {
        systemInstruction: SYSTEM_PROMPT_GENERATOR,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
          },
          required: ["prompt"],
        },
      },
    });
    const text = response.text?.trim() || "{}";
    const result = JSON.parse(text);
    return result.prompt || "Tôi tên là Lan và tôi thích học tiếng Đức.";
  } catch (error) {
    console.error("Generator Error:", error);
    return "Tôi tên là Lan và tôi thích học tiếng Đức.";
  }
}

export async function checkTranslation(vietnamesePrompt: string, userAttempt: string): Promise<FeedbackResult> {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Câu gốc: "${vietnamesePrompt}"\nNgười dùng dịch: "${userAttempt}"`,
      config: {
        systemInstruction: SYSTEM_PROMPT_CHECKER,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            userTranslation: { type: Type.STRING },
            correctTranslation: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Markdown formatted explanation of mistakes" },
          },
          required: ["isCorrect", "score", "userTranslation", "correctTranslation", "pronunciation", "explanation"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const result = JSON.parse(text);
    return result as FeedbackResult;
  } catch (error) {
    console.error("Checker Error:", error);
    throw error;
  }
}

export async function translateToGerman(vietnameseText: string): Promise<TranslationResult> {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-1.5-flash",
      contents: vietnameseText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vietnamese: { type: Type.STRING },
            german: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            breakdown: { type: Type.STRING, description: "Markdown formatted string explaining grammar and vocabulary" },
          },
          required: ["vietnamese", "german", "pronunciation", "breakdown"],
        },
      },
    });

    const text = response.text?.trim() || "{}";
    const result = JSON.parse(text);
    return result as TranslationResult;
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
}
