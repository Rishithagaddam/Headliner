const axios = require("axios");

/**
 * Generate a meaningful one-line summary of a news headline and description using the Gemini API.
 * @param {string} headline - The headline of the news article.
 * @param {string} description - The description or snippet of the news article.
 * @returns {Promise<string>} - A concise one-line summary.
 */
async function generateMeaningfulSummary(headline, description) {
  const geminiApiKey = "AIzaSyAxtOF7oTK9nTU4TCZHsvEAcdMdUuYehPU";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  // Enhanced prompt with better context and instructions
  const prompt = `
    Task: Generate a concise one-line summary of this health/news article.
    
    Input Headline: "${headline}"
    Context/Description: "${description || 'No additional context available'}"
    
    Instructions:
    1. Extract the key medical/health concern or main news point
    2. Rephrase using simple, clear language
    3. Keep summary under 15 words
    4. Include any specific numbers, statistics, or key findings
    5. Format as a complete, informative sentence
    
    Bad summary: "Doctor talks about men's health issues"
    Good summary: "Heart disease identified as leading cause of death among Indian men, alongside diabetes and stress"
    
    Provide ONLY the summary, no additional text.
  `;

  try {
    const response = await axios.post(geminiUrl, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 50,
      },
      // Updated safety settings with correct category values
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

    let summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Enhanced fallback mechanism
    if (!summary || summary.trim().length < 10) {
      // Try extracting key phrases from headline
      const keyPhrases = headline
        .replace(/['"]/g, '')
        .split(':')
        .pop()
        .split(',')[0]
        .trim();
      
      summary = keyPhrases.length > 20 ? keyPhrases : headline;
    }

    // Clean up the summary
    return summary
      .trim()
      .replace(/^Summary:?\s*/i, '')
      .replace(/^['"]|['"]$/g, '')
      .replace(/\s+/g, ' ');
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    
    // Intelligent fallback: Extract main clause from headline
    const simplifiedHeadline = headline
      .split(':')
      .pop()
      .split(',')[0]
      .trim();
    
    return simplifiedHeadline || "Unable to generate summary";
  }
}

module.exports = { generateMeaningfulSummary };