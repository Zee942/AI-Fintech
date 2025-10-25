import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT_TEMPLATE } from '../constants';
import type { AnalysisResult } from '../types';
import { Category, Severity } from '../types';
import { QCB_RULES } from '../data/rules';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Overall readiness score from 0 to 100." },
    categoryScores: {
      type: Type.OBJECT,
      properties: {
        [Category.AML]: { type: Type.NUMBER },
        [Category.Governance]: { type: Type.NUMBER },
        [Category.Capital]: { type: Type.NUMBER },
        [Category.DataResidency]: { type: Type.NUMBER },
      },
      required: [Category.AML, Category.Governance, Category.Capital, Category.DataResidency]
    },
    gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          gapId: { type: Type.STRING, description: "A unique identifier for the gap, e.g., GAP-001." },
          category: { type: Type.STRING, enum: Object.values(Category) },
          rule: { type: Type.STRING, description: "The specific QCB article violated, e.g., 'QCB Article 2.1.1'." },
          description: { type: Type.STRING, description: "A clear explanation of the compliance gap." },
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          recommendation: { type: Type.STRING, description: "An actionable recommendation to fix the gap." },
          expertId: { type: Type.STRING, description: "A reference to a QDB expert, e.g., 'QDB_EXPERT_002'." },
        },
        required: ["gapId", "category", "rule", "description", "severity", "recommendation", "expertId"]
      }
    }
  },
  required: ["overallScore", "categoryScores", "gaps"]
};


export const analyzeDocuments = async (docs: { [key: string]: string }): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-pro';

  const combinedDocs = `
    **Business Plan:**
    ${docs.businessPlan || "Not provided."}
    ---
    **Legal Documents:**
    ${docs.legalDocs || "Not provided."}
    ---
    **Policy Documents:**
    ${docs.policyDocs || "Not provided."}
  `;

  try {
    // Format all rules to be injected into the prompt
    const allRulesText = QCB_RULES.map(rule => rule.text).join('\n\n');

    // Prepare the system prompt by injecting all regulatory rules
    const systemInstruction = SYSTEM_PROMPT_TEMPLATE.replace(
        '{relevant_rules}', 
        allRulesText
    );
    
    const userPrompt = `
      Here are the startup's documents for analysis:
      ---
      ${combinedDocs}
      ---
      Please perform the readiness assessment now based on the rules provided in the system instructions.
    `;

    // Generate the response
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The API returned an empty response. The model may have been unable to process the request.");
    }
    
    const parsedResult = JSON.parse(jsonText);
    return parsedResult as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API or processing the result:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The model returned an invalid JSON format. Please check the input documents for unusual characters or formatting.");
    }
    if (error instanceof Error) {
        throw new Error(`Failed to get a valid analysis from the AI model: ${error.message}`);
    }
    throw new Error("An unknown error occurred during the analysis.");
  }
};