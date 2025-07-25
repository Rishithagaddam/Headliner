// Gemini API Service for centralized AI operations
import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyAxtOF7oTK9nTU4TCZHsvEAcdMdUuYehPU";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Generic Gemini API caller
export const callGeminiAPI = async (prompt, config = {}) => {
  const defaultConfig = {
    temperature: 0.7,
    maxOutputTokens: 1000,
    topP: 0.9,
    topK: 20
  };

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: { ...defaultConfig, ...config },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to process with Gemini API');
  }
};

// Enhance news queries using Gemini
export const enhanceNewsQuery = async (query) => {
  const prompt = `Enhance this news search query to be more specific and effective for news APIs. Keep it concise but comprehensive. Add relevant keywords that would help find better news results.

Original query: "${query}"

Return only the enhanced query, nothing else.`;

  try {
    return await callGeminiAPI(prompt, { temperature: 0.3, maxOutputTokens: 100 });
  } catch (error) {
    return query; // fallback to original
  }
};

// Generate contextual responses for chat
export const generateContextualResponse = async (message, context = '') => {
  const prompt = `You are a helpful news assistant. Respond to the user's message in a conversational and informative way. If it's news-related, provide relevant information. If it's a general question, be helpful and friendly.

${context ? `Context: ${context}` : ''}

User message: "${message}"

Provide a helpful response:`;

  try {
    return await callGeminiAPI(prompt, { temperature: 0.7, maxOutputTokens: 500 });
  } catch (error) {
    return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
  }
};

// Summarize long news content
export const summarizeNewsContent = async (content) => {
  const prompt = `Summarize this news content in 2-3 sentences. Focus on the key facts and main points. Make it clear and easy to understand.

Content: "${content}"

Summary:`;

  try {
    return await callGeminiAPI(prompt, { temperature: 0.3, maxOutputTokens: 200 });
  } catch (error) {
    return "Summary unavailable";
  }
};

// Analyze sentiment of news or text
export const analyzeSentiment = async (text) => {
  const prompt = `Analyze the sentiment of this text and categorize it as positive, negative, or neutral. Also provide a confidence score from 0-1.

Text: "${text}"

Return in this format: {"sentiment": "positive/negative/neutral", "confidence": 0.85, "explanation": "brief explanation"}`;

  try {
    const result = await callGeminiAPI(prompt, { temperature: 0.1, maxOutputTokens: 150 });
    return JSON.parse(result);
  } catch (error) {
    return { sentiment: "neutral", confidence: 0.5, explanation: "Unable to analyze" };
  }
};

// Extract key topics from news text
export const extractTopics = async (text) => {
  const prompt = `Extract the main topics and keywords from this news text. Return as a JSON array of strings.

Text: "${text}"

Return format: ["topic1", "topic2", "topic3"]`;

  try {
    const result = await callGeminiAPI(prompt, { temperature: 0.2, maxOutputTokens: 100 });
    return JSON.parse(result);
  } catch (error) {
    return [];
  }
};

// Generate follow-up questions for news articles
export const generateFollowUpQuestions = async (headline, summary) => {
  const prompt = `Based on this news headline and summary, generate 3 relevant follow-up questions that a reader might want to ask.

Headline: "${headline}"
Summary: "${summary}"

Return as JSON array: ["question1", "question2", "question3"]`;

  try {
    const result = await callGeminiAPI(prompt, { temperature: 0.5, maxOutputTokens: 200 });
    return JSON.parse(result);
  } catch (error) {
    return ["Tell me more about this", "What are the implications?", "Any recent updates?"];
  }
};
