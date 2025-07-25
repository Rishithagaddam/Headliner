# 🚀 Gemini News Assistant - AI Integration Guide

## 📍 Gemini API Integration Locations

This guide shows exactly where Gemini API is integrated throughout your application for both **data fetching** and **speech-to-text** functionality.

### 🎯 **Current Gemini API Integrations**

## 🔧 **Server-Side Integrations**

### 1. **Main Chat Endpoint** (`server/server.js`)
```javascript
// Location: Lines 50-120
// Purpose: Main chat functionality with intent-based routing
app.post("/chat", async (req, res) => {
  const { message, intent } = req.body;
  // Enhanced with intent processing from client-side Gemini analysis
```
**Features:**
- ✅ Intent-based query routing
- ✅ Enhanced news queries using Gemini analysis
- ✅ Fallback to Gemini for general chat

### 2. **News Summarization** (`server/summarization.js`)
```javascript
// Location: Entire file
// Purpose: Generate intelligent summaries of news articles
async function generateMeaningfulSummary(headline, description)
```
**Features:**
- ✅ AI-powered news summarization
- ✅ Health/medical content optimization
- ✅ Smart fallback mechanisms

### 3. **Bulk Summarization Endpoint** (`server/server.js`)
```javascript
// Location: Lines 140-170
// Purpose: Summarize multiple articles at once
app.post("/summarize-news", async (req, res) => {
```

## 💻 **Client-Side Integrations**

### 4. **Enhanced Speech Service** (`client/src/services/speechService.js`)
```javascript
// Location: Lines 1-30 (Configuration)
const GEMINI_API_KEY = "AIzaSyAxtOF7oTK9nTU4TCZHsvEAcdMdUuYehPU";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
```

**🎤 Speech-to-Text Enhancements:**
- ✅ **Text Enhancement** (Lines 40-65): Fixes speech recognition errors using Gemini
- ✅ **Speech Optimization** (Lines 85-110): Makes text more natural for voice output  
- ✅ **Intent Detection** (Lines 180-210): Analyzes user intent from voice input
- ✅ **Audio Processing** (Lines 135-165): Alternative speech-to-text using Gemini API

### 5. **Centralized Gemini Service** (`client/src/services/geminiService.js`)
```javascript
// Location: Entire file (NEW)
// Purpose: Centralized AI operations
```
**Features:**
- ✅ Generic Gemini API caller
- ✅ News query enhancement
- ✅ Contextual response generation
- ✅ Sentiment analysis
- ✅ Topic extraction
- ✅ Follow-up question generation

### 6. **Smart Chat Page** (`client/src/pages/ChatPage.jsx`)
```javascript
// Location: Lines 50-85 (sendMessage function)
// Purpose: Enhanced chat with voice and intent detection
```
**🗣️ Voice Features:**
- ✅ Voice input with Gemini enhancement
- ✅ Intent detection before sending messages
- ✅ Speech synthesis for responses
- ✅ Auto-send in speech mode

### 7. **Enhanced News Cards** (`client/src/components/news/NewsCard.jsx`)
```javascript
// Location: Lines 20-45 (fetchSummary function)
// Purpose: AI-powered news summaries with follow-up questions
```
**Features:**
- ✅ Gemini-powered summarization
- ✅ Follow-up question generation
- ✅ Fallback to server endpoint

### 8. **Voice-Enabled News Filters** (`client/src/components/news/NewsFilters.jsx`)
```javascript
// Location: Lines 30-80 (handleVoiceInput function)
// Purpose: Voice control for news category/location selection
```

## 🎯 **Specific Use Cases**

### **For Speech-to-Text:**
1. **Voice Input Recognition** → `speechService.js` (startListening)
2. **Text Enhancement** → `speechService.js` (enhanceTextWithGemini)
3. **Intent Detection** → `speechService.js` (detectIntent)
4. **Voice Output Optimization** → `speechService.js` (optimizeTextForSpeech)

### **For Data Fetching & Processing:**
1. **Chat Responses** → `server.js` (/chat endpoint)
2. **News Summarization** → `summarization.js` + `geminiService.js`
3. **Query Enhancement** → `geminiService.js` (enhanceNewsQuery)
4. **Follow-up Questions** → `geminiService.js` (generateFollowUpQuestions)

## 🔧 **Setup Instructions**

### 1. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. **Install Dependencies**
```bash
# Client
cd client && npm install

# Server  
cd server && npm install
```

### 3. **Start the Application**
```bash
# Start server (Terminal 1)
cd server && npm start

# Start client (Terminal 2)
cd client && npm run dev
```

## 🎮 **How to Use Voice Features**

1. **Enable Speech Mode**: Click the speech toggle in the header
2. **Voice Chat**: Use the microphone button in the chat interface
3. **Voice News Filters**: Speak your category preferences on the category page
4. **Voice Commands**: Say things like:
   - "Show me technology news"
   - "Latest health updates from India"
   - "Summarize sports news"

## 🛠️ **API Key Requirements**

Your application needs these API keys:
- ✅ **Gemini API Key**: For all AI features
- ✅ **News API Key**: For basic news fetching
- ✅ **SerpAPI Key**: For enhanced news search

## 🔍 **Testing the Integration**

1. **Test Speech Recognition**: Enable speech mode and try voice input
2. **Test Summarization**: Click "Show Summary" on any news card
3. **Test Chat**: Ask news-related questions in the chat
4. **Test Voice Filters**: Use voice to select news categories

## 🐛 **Troubleshooting**

- **Speech not working**: Check microphone permissions
- **API errors**: Verify your Gemini API key in the console
- **Slow responses**: Gemini API calls may take 2-3 seconds
- **Network issues**: Check your internet connection

## 📈 **Future Enhancements**

Consider adding:
- Real-time speech streaming
- Multi-language support
- Offline speech recognition fallback
- Voice commands for navigation
- Personalized news recommendations using Gemini
