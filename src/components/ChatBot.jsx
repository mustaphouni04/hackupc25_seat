import React, { useEffect, useRef, useState } from "react";

export default function ChatBot({ initialBotMessage }) {
  const [messages, setMessages] = useState([
    { id: 0, sender: "bot", text: initialBotMessage },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, sender: "user", text },
      {
        id: prev.length + 1,
        sender: "bot",
        text: "🤖 (placeholder) Backend reply coming soon!",
      },
    ]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* message list */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-white">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] text-sm px-3 py-2 rounded-lg ${
              m.sender === "bot"
                ? "bg-gray-200 text-gray-800 self-start"
                : "bg-blue-500 text-white self-end"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* input row */}
      <div className="flex border-t border-gray-300">
        <input
          className="flex-1 px-2 py-1 text-sm outline-none"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="bg-blue-600 text-white px-4 text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
