// filepath: [server.js](http://_vscodecontentref_/1)
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { generateMeaningfulSummary } = require("./summarization");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// NewsAPI endpoint
app.get("/news", async (req, res) => {
  const apiKey = "97da8a5e18194bd39464e1ec24ebbd1a";
  const { category } = req.query;
  let url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${apiKey}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  try {
    const newsRes = await axios.get(url);
    const articles = newsRes.data.articles || [];
    const headlines = articles.map(a => ({
      title: a.title,
      url: a.url
    }));
    res.json({ headlines });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error fetching news" });
  }
});

// SerpAPI news endpoint
app.get("/api/news", async (req, res) => {
  try {
    const serpApiKey = "155466f395262b3847065b28ff8054cec70ed403ac046ef8d123ea0de57f8fe7";
    const query = req.query.q || "top news india";
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&location=India&api_key=${serpApiKey}`;
    const serpRes = await axios.get(serpUrl);
    const news = serpRes.data.news_results || [];
    const top5 = news.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link
    }));
    res.json(top5);
  } catch (err) {
    console.error("SerpAPI error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Gemini Chatbot endpoint
app.post("/chat", async (req, res) => {
  const { message, intent } = req.body;

  // Enhanced processing using intent data from frontend
  if (intent && intent.intent === 'news_query') {
    try {
      // Use SerpAPI for news with enhanced query based on intent
      const serpApiKey = "155466f395262b3847065b28ff8054cec70ed403ac046ef8d123ea0de57f8fe7";
      let searchQuery = message;
      
      // Enhance query based on detected intent
      if (intent.category && intent.category !== 'general') {
        searchQuery = `${intent.category} news ${intent.keywords.join(' ')}`;
      }
      if (intent.location && intent.location !== 'global') {
        searchQuery += ` ${intent.location}`;
      }
      
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}`;
      const serpRes = await axios.get(serpUrl);
      const data = serpRes.data;

      // Try to extract news from SerpAPI response
      let answer = null;
      if (data.answer_box && data.answer_box.answer) {
        answer = data.answer_box.answer;
      } else if (data.answer_box && data.answer_box.snippet) {
        answer = data.answer_box.snippet;
      } else if (data.news_results && data.news_results.length > 0) {
        // Format top 5 news headlines
        answer = data.news_results
          .slice(0, 5)
          .map((n, i) => `${i + 1}. ${n.title} (${n.link})`)
          .join("\n");
      } else if (data.organic_results && data.organic_results.length > 0) {
        answer = data.organic_results[0].snippet || data.organic_results[0].title;
      }

      if (answer) {
        return res.json({ reply: answer });
      } else {
        return res.json({ reply: "Sorry, I couldn't find any news right now." });
      }
    } catch (err) {
      console.error("SerpAPI error:", err.response?.data || err.message);
      return res.status(500).json({ reply: "Error fetching news from SerpAPI" });
    }
  }

  // 1. Check for news-related queries (fallback)
  if (/news/i.test(message)) {
    try {
      // Use SerpAPI for news
      const serpApiKey = "155466f395262b3847065b28ff8054cec70ed403ac046ef8d123ea0de57f8fe7";
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(message)}&api_key=${serpApiKey}`;
      const serpRes = await axios.get(serpUrl);
      const data = serpRes.data;

      // Try to extract news from SerpAPI response
      let answer = null;
      if (data.answer_box && data.answer_box.answer) {
        answer = data.answer_box.answer;
      } else if (data.answer_box && data.answer_box.snippet) {
        answer = data.answer_box.snippet;
      } else if (data.news_results && data.news_results.length > 0) {
        // Format top 5 news headlines
        answer = data.news_results
          .slice(0, 5)
          .map((n, i) => `${i + 1}. ${n.title} (${n.link})`)
          .join("\n");
      } else if (data.organic_results && data.organic_results.length > 0) {
        answer = data.organic_results[0].snippet || data.organic_results[0].title;
      }

      if (answer) {
        return res.json({ reply: answer });
      } else {
        return res.json({ reply: "Sorry, I couldn't find any news right now." });
      }
    } catch (err) {
      console.error("SerpAPI error:", err.response?.data || err.message);
      return res.status(500).json({ reply: "Error fetching news from SerpAPI" });
    }
  }

  // 2. Fallback to Gemini for all other queries
  try {
    const geminiRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAxtOF7oTK9nTU4TCZHsvEAcdMdUuYehPU",
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );
    const reply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ reply: "Error contacting Gemini API" });
  }
});

/**
 * Summarize news headlines using the Gemini API.
 * @param {Array} articles - Array of news articles, each with a headline and description.
 * @returns {Promise<Array>} - Array of articles with AI-generated summaries.
 */
async function summarizeHeadlines(articles) {
  const geminiApiKey = "AIzaSyAxtOF7oTK9nTU4TCZHsvEAcdMdUuYehPU"; // Updated API key
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  const summarizedArticles = await Promise.all(
    articles.map(async (article) => {
      const { title: headline, description } = article;
      const prompt = `
        You are an AI assistant helping a news chatbot summarize headlines for quick reading. 
        Given a news headline and its short description or snippet, generate a concise one-line summary that captures the key point or takeaway. 
        Keep it factual, avoid opinions, and limit the summary to under 20 words.
        Format your response as:
        Summary: <one-line summary>
        Headline: '${headline}'
        Description: '${description || "No description available"}'
      `;

      try {
        const response = await axios.post(geminiUrl, {
          contents: [{ parts: [{ text: prompt }] }],
        });

        const summary =
          response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available";
        return { ...article, summary };
      } catch (err) {
        console.error("Error summarizing headline:", err.response?.data || err.message);
        return { ...article, summary: "Error generating summary" };
      }
    })
  );

  return summarizedArticles;
}

// Example usage in an endpoint
app.post("/summarize-news", async (req, res) => {
  const { articles } = req.body;

  if (!Array.isArray(articles)) {
    return res.status(400).json({ error: "Invalid input. Expected an array of articles." });
  }

  try {
    const summarizedArticles = await summarizeHeadlines(articles);
    res.json(summarizedArticles);
  } catch (err) {
    console.error("Error summarizing news:", err.message);
    res.status(500).json({ error: "Failed to summarize news articles." });
  }
});

app.post("/generate-summary", async (req, res) => {
  const { headline, description } = req.body;

  if (!headline) {
    return res.status(400).json({ error: "Headline is required." });
  }

  try {
    const summary = await generateMeaningfulSummary(headline, description);
    res.json({ summary });
  } catch (err) {
    console.error("Error generating summary:", err.message);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});