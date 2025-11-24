
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, IntentType, KeywordInput, KeywordRelation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeKeywords = async (keywords: KeywordInput[]): Promise<AnalysisResult[]> => {
  if (!keywords || keywords.length === 0) return [];

  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    你是一位 SEO 架构专家。请基于 Google SERP 的逻辑，将关键词整理成“网站架构图谱”。

    核心任务：**URL 去重 (Canonicalization)**。
    很多关键词其实是同义词（如 "fake flowers" 和 "artificial flowers"），它们应该对应**同一个页面**。
    
    请构建以下四层结构：
    1. **Theme (主题/Hub)**: 顶层的大分类 (Level 1)。
    2. **Pillar (支柱)**: 主题下的子分类 (Level 2)。
    3. **Page (页面/Primary Keyword)**: 这是用户实际访问的 URL。请从一组同义词中选出搜索量最大或最准确的一个作为“核心词 (primaryVariant)”。
    4. **Keywords**: 属于该页面的具体词（包含核心词本身和同义词）。

    意图判断逻辑 (模拟 SERP):
    - 集合页 (Collection): 宽泛词，用户想看列表。
    - 产品页 (Product): 具体商业词，用户想买。
    - 文章页 (Article): 信息词 (How to, Best of, VS)。

    输出要求：
    - 对于同义词组，**primaryVariant 必须相同**，且等于其中一个关键词。
    - relation 字段：选中的词为 "核心大词"，其他的为 "同义词" 或 "长尾词"。
  `;

  // Prepare the data for the prompt
  const inputString = keywords.map(k => `${k.term} (Volume: ${k.volume || 'N/A'})`).join('\n');

  const prompt = `请对以下关键词进行架构规划，务必识别同义词并归组到同一个页面 (primaryVariant) 下:\n\n${inputString}`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              translation: { type: Type.STRING, description: "中文翻译" },
              parentTopic: { type: Type.STRING, description: "Theme (主题)" },
              pillar: { type: Type.STRING, description: "Pillar (支柱板块)" },
              primaryVariant: { type: Type.STRING, description: "归属页面的核心词 (用于同义词分组)" },
              relation: { 
                type: Type.STRING, 
                enum: [
                  KeywordRelation.PRIMARY,
                  KeywordRelation.SYNONYM,
                  KeywordRelation.LONG_TAIL
                ] 
              },
              intent: { 
                type: Type.STRING, 
                enum: [
                  IntentType.PRODUCT,
                  IntentType.COLLECTION,
                  IntentType.ARTICLE
                ] 
              },
              contentStrategy: { type: Type.STRING, description: "针对该页面的简短内容策略" },
              confidenceScore: { type: Type.INTEGER }
            },
            required: ["keyword", "translation", "parentTopic", "pillar", "primaryVariant", "relation", "intent", "contentStrategy", "confidenceScore"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Gemini 没有返回数据。");

    const parsedResults = JSON.parse(rawText) as AnalysisResult[];
    
    // Map back to preserve original volume data
    return parsedResults.map(res => {
      const original = keywords.find(k => k.term.toLowerCase() === res.keyword.toLowerCase()) || { volume: 0 };
      return {
        ...res,
        volume: original.volume || 0
      };
    });

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("架构分析失败，请检查 API Key 或减少关键词数量重试。");
  }
};
