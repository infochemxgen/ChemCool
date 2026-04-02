import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client
// Note: process.env.GEMINI_API_KEY is automatically provided by the platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MolecularAlternative {
  name: string;
  casNumber: string;
  industrialUse: string;
  safetyScore: number; // 1-100
  sustainabilityBenefits: string;
  functionalProperties: string;
  matchPercentage: number;
}

const SYSTEM_INSTRUCTION = `
You are a world-class "Molecular Chemist" and sustainability expert. 
Your goal is to help industrial manufacturers replace banned or hazardous chemicals with sustainable, "Next-Gen" alternatives.

Given a banned chemical and its primary industrial use, you must suggest exactly 3 sustainable alternatives.
For each alternative, provide:
1. Name: The common chemical name.
2. CAS Number: The standard Chemical Abstracts Service registry number.
3. Industrial Use: How it functions in the specified application.
4. Safety Score: A score from 1 to 100 (100 being perfectly safe/non-toxic).
5. Sustainability Benefits: Why this is better for the environment (e.g., biodegradable, bio-based, low VOC).
6. Functional Properties: How it matches the performance of the original chemical.
7. Match Percentage: How closely it replicates the original's function (0-100).

Be scientifically accurate and prioritize commercially available or emerging green chemistry solutions.
`;

export interface ComplianceStatus {
  chemical: string;
  casNumber: string;
  status: 'Banned' | 'Restricted' | 'Safe' | 'Under Review';
  reason: string;
  agency: string;
  regulations: string[];
  recommendation: string;
}

const COMPLIANCE_SYSTEM_INSTRUCTION = `
You are a "Regulatory Compliance Specialist" for industrial chemicals.
Your goal is to analyze a list of chemicals and determine their current regulatory status under global frameworks (REACH, TSCA, RoHS, ECHA, EPA, etc.).

For each chemical provided, return:
1. chemical: The name of the chemical.
2. casNumber: The standard CAS registry number.
3. status: One of "Banned", "Restricted", "Under Review", or "Safe".
4. reason: A brief explanation of why this status was assigned.
5. agency: The primary regulatory agency (e.g., "ECHA", "EPA", "REACH").
6. regulations: A list of specific regulations that apply (e.g., "REACH Annex XIV", "TSCA Section 6").
7. recommendation: A brief recommendation for the manufacturer (e.g., "Immediate substitution required", "Monitor concentration limits").

Be conservative and prioritize safety. If a chemical is under investigation or has known high toxicity, mark it as "Restricted" or "Under Review".
`;

export const getMolecularAlternatives = async (
  chemical: string,
  industrialUse: string
): Promise<MolecularAlternative[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Banned Chemical: ${chemical}\nIndustrial Use: ${industrialUse}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              casNumber: { type: Type.STRING },
              industrialUse: { type: Type.STRING },
              safetyScore: { type: Type.NUMBER },
              sustainabilityBenefits: { type: Type.STRING },
              functionalProperties: { type: Type.STRING },
              matchPercentage: { type: Type.NUMBER },
            },
            required: [
              "name",
              "casNumber",
              "industrialUse",
              "safetyScore",
              "sustainabilityBenefits",
              "functionalProperties",
              "matchPercentage",
            ],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching molecular alternatives:", error);
    throw error;
  }
};

export const getComplianceStatus = async (
  chemicals: string[]
): Promise<ComplianceStatus[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following chemicals: ${chemicals.join(", ")}`,
      config: {
        systemInstruction: COMPLIANCE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chemical: { type: Type.STRING },
              casNumber: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["Banned", "Restricted", "Safe", "Under Review"] },
              reason: { type: Type.STRING },
              agency: { type: Type.STRING },
              regulations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendation: { type: Type.STRING },
            },
            required: ["chemical", "casNumber", "status", "reason", "agency", "regulations", "recommendation"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching compliance status:", error);
    throw error;
  }
};
