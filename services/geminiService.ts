import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze a bin image for defects or fill level
export const analyzeBinImage = async (base64Image: string): Promise<{ status: string; defects: string[]; confidence: number }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image
                        }
                    },
                    {
                        text: "Analyze this fruit bin image. Check fill level. IDENTIFY DEFECTS SPECIFICALLY: Spurs attached, Bruising/Damage, Small fruit, Lack of Color. Return JSON."
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, description: "full, empty, or partial" },
                        defects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        confidence: { type: Type.NUMBER, description: "Confidence score 0-100" }
                    }
                }
            }
        });
        
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Gemini Image Analysis Error:", error);
        return { status: "unknown", defects: [], confidence: 0 };
    }
};

// Generate a smart broadcast message
export const generateSmartBroadcast = async (input: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an orchard management assistant. Rewrite this rough note into a clear, professional broadcast message for the crew. Keep it concise. Urgent if weather related.
            
            Input: "${input}"`,
        });
        return response.text || "";
    } catch (error) {
        console.error("Gemini Text Generation Error:", error);
        return input; // Fallback to original
    }
};