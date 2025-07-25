import React, { useRef, useEffect } from "react";
import TypingDots from "./TypingDots";

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Gemini";
const USER_AVATAR = "https://api.dicebear.com/7.x/personas/svg?seed=User";

export default function ChatWindow({ 
  messages, 
  loading, 
  input, 
  setInput, 
  sendMessage, 
  userTyping,
  clearChat,
  copyToClipboard,
  reactToMessage,
  speechMode,
  listening,
  handleVoiceInput
}) {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      {/* Chat Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex gap-3 max-w-[80%]">
              <img
                src={msg.from === "user" ? USER_AVATAR : BOT_AVATAR}
                alt={msg.from}
                className="w-8 h-8 rounded-full"
              />
              <div className="space-y-1">
                <div className={`p-3 rounded-xl ${
                  msg.from === "user" 
                    ? "bg-purple-100 dark:bg-purple-900" 
                    : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{new Date(msg.time).toLocaleTimeString()}</span>
                  <button 
                    onClick={() => copyToClipboard(msg.text)}
                    className="hover:text-gray-700"
                  >
                    📋
                  </button>
                  <button 
                    onClick={() => reactToMessage(idx, 'up')}
                    className="hover:text-gray-700"
                  >
                    👍 {msg.reactions.up}
                  </button>
                  <button 
                    onClick={() => reactToMessage(idx, 'down')}
                    className="hover:text-gray-700"
                  >
                    👎 {msg.reactions.down}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <img src={BOT_AVATAR} alt="bot" className="w-8 h-8 rounded-full" />
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={speechMode ? "Tap mic to speak or type..." : "Type your message..."}
            className="flex-1 p-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
          />
          
          {/* Voice Input Button (shown in speech mode) */}
          {speechMode && handleVoiceInput && (
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={listening}
              className={`px-4 py-2 rounded-lg transition-colors ${
                listening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
              }`}
            >
              {listening ? '🎤' : '🎙️'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 hover:bg-purple-700"
          >
            Send
          </button>
          <button
            type="button"
            onClick={clearChat}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        {userTyping && (
          <div className="text-xs text-gray-500 mt-1">User is typing...</div>
        )}
        {listening && (
          <div className="text-xs text-purple-600 mt-1 animate-pulse">🎤 Listening for voice input...</div>
        )}
      </form>
    </div>
  );
}