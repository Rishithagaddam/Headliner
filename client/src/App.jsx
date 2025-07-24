// filepath: [App.jsx](http://_vscodecontentref_/2)
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ShowLatestNews from "./ShowLatestNews";
import CategoryNewsFilter from "./CategoryNewsFilter";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <span className="flex gap-1 items-center h-5">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
    </span>
  );
}

const BOT_AVATAR =
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Gemini";
const USER_AVATAR =
  "https://api.dicebear.com/7.x/personas/svg?seed=User";

function App() {
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
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [userTyping, setUserTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // User typing indicator
  useEffect(() => {
    if (!input) {
      setUserTyping(false);
      return;
    }
    setUserTyping(true);
    const timeout = setTimeout(() => setUserTyping(false), 2000);
    return () => clearTimeout(timeout);
  }, [input]);

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
    <div className={`${dark ? "dark" : ""}`}>
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-gradient-x" />
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -translate-x-1/2 -z-10 animate-pulse" />
      </div>
      <div className="relative min-h-screen flex flex-col items-center justify-center px-2 z-10">
        {/* Chat Card */}
        <div className="w-full max-w-xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-8 border border-white/40 dark:border-gray-700 transition-colors mt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-700 dark:text-purple-300 drop-shadow-lg tracking-tight flex items-center gap-2">
              <span className="animate-spin-slow">💠</span> Gemini Chatbot
            </h1>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                title="Toggle theme"
                onClick={() => setDark((d) => !d)}
              >
                {dark ? (
                  <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"></path></svg>
                ) : (
                  <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
                )}
              </button>
              <button
                className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                title="Clear chat"
                onClick={clearChat}
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          {/* Chat area */}
          <div
            ref={chatRef}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 min-h-[220px] mb-4 bg-white/60 dark:bg-gray-800/60 overflow-y-auto max-h-80 transition-all"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`group flex items-end gap-2 mb-3 ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {msg.from === "bot" && (
                  <img
                    src={BOT_AVATAR}
                    alt="Bot"
                    className="w-8 h-8 rounded-full border border-purple-200 dark:border-purple-700 shadow"
                  />
                )}
                <div
                  className={`relative px-4 py-2 rounded-2xl max-w-[75%] shadow-sm transition-all ${
                    msg.from === "user"
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}
                >
                  <span className="block font-semibold text-xs mb-1 opacity-70">
                    {msg.from === "user" ? "You" : "Gemini"}
                  </span>
                  <span className="block whitespace-pre-line">{msg.text}</span>
                  <span className="absolute bottom-1 right-3 text-[10px] text-gray-400 dark:text-gray-300">
                    {formatTime(new Date(msg.time))}
                  </span>
                  {/* Copy button */}
                  <button
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-white/70 dark:bg-gray-800/70 rounded p-1"
                    title="Copy message"
                    onClick={() => copyToClipboard(msg.text)}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>
                  </button>
                  {/* Reactions */}
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-xs hover:scale-125 transition"
                      title="Like"
                      onClick={() => reactToMessage(i, "up")}
                      type="button"
                    >
                      👍 {msg.reactions.up}
                    </button>
                    <button
                      className="text-xs hover:scale-125 transition"
                      title="Dislike"
                      onClick={() => reactToMessage(i, "down")}
                      type="button"
                    >
                      👎 {msg.reactions.down}
                    </button>
                  </div>
                </div>
                {msg.from === "user" && (
                  <img
                    src={USER_AVATAR}
                    alt="You"
                    className="w-8 h-8 rounded-full border border-blue-200 dark:border-blue-700 shadow"
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2 mb-3 justify-start animate-fade-in">
                <img
                  src={BOT_AVATAR}
                  alt="Bot"
                  className="w-8 h-8 rounded-full border border-purple-200 dark:border-purple-700 shadow"
                />
                <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none flex items-center gap-2">
                  <TypingDots />
                  <span className="text-xs text-gray-400 ml-2">Gemini is typing...</span>
                </div>
              </div>
            )}
            {userTyping && (
              <div className="flex items-end gap-2 mb-3 justify-end animate-fade-in">
                <div className="px-4 py-2 rounded-2xl bg-blue-100 text-blue-900 rounded-br-none flex items-center gap-2">
                  <TypingDots />
                  <span className="text-xs text-blue-400 ml-2">You are typing...</span>
                </div>
                <img
                  src={USER_AVATAR}
                  alt="You"
                  className="w-8 h-8 rounded-full border border-blue-200 dark:border-blue-700 shadow"
                />
              </div>
            )}
          </div>
          {/* Top 5 Headlines button and cards */}
          <ShowLatestNews />
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-100 bg-white/80 shadow"
              disabled={loading}
              autoFocus
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow transition disabled:bg-gray-300 flex items-center gap-2"
            >
              <span className="transition-transform group-hover:scale-110">Send</span>
              <svg className="w-5 h-5 ml-1 animate-bounce-x" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-400">
            Powered by Gemini API & NewsAPI &copy; {new Date().getFullYear()}
          </div>
        </div>
        {/* Category News Filter below chat card */}
        <CategoryNewsFilter />
      </div>
      {/* Custom animations */}
      <style>
        {`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0);}
          50% { transform: translateX(5px);}
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
        `}
      </style>
    </div>
  );
}

export default App;