import React, { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ShowLatestNews from '../components/news/ShowLatestNews';
import axios from 'axios';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! Ask me anything \n\n Use the 'Show Latest News' button for headlines.",
      time: new Date(),
      reactions: { up: 0, down: 0 }
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date();
    const userMsg = { from: "user", text: input, time: now, reactions: { up: 0, down: 0 } };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setUserTyping(false);
    try {
      const res = await axios.post("http://localhost:5000/chat", { message: input });
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: res.data.reply, time: new Date(), reactions: { up: 0, down: 0 } }
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Error contacting Gemini API.", time: new Date(), reactions: { up: 0, down: 0 } }
      ]);
    }
    setInput("");
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        from: "bot",
        text: "👋 Hi! Ask me anything or try 'latest news'.\n\n💡 Tip: Use the 'Show Latest News' button for headlines.",
        time: new Date(),
        reactions: { up: 0, down: 0 }
      }
    ]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const reactToMessage = (idx, type) => {
    setMessages(msgs =>
      msgs.map((msg, i) =>
        i === idx
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [type]: msg.reactions[type] + 1
              }
            }
          : msg
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-4">
          Chat with Gemini News Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Ask questions about current events, get news summaries, or discuss any topic with our AI assistant.
        </p>
      </div>

      <div className="grid md:grid-cols-[2fr,1fr] gap-8">
        {/* Chat Window */}
        <div className="md:order-1">
          <ChatWindow
            messages={messages}
            loading={loading}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            userTyping={userTyping}
            clearChat={clearChat}
            copyToClipboard={copyToClipboard}
            reactToMessage={reactToMessage}
          />
        </div>

        {/* News Section */}
        <div className="md:order-2 space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-purple-100/20">
            <ShowLatestNews />
          </div>
          
          {/* Quick Prompts */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-purple-100/20">
            <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300 mb-4">
              Quick Prompts
            </h3>
            <div className="space-y-2">
              {[
                "Show me today's top headlines",
                "Summarize the latest tech news",
                "What's happening in sports?",
                "Latest business updates"
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}