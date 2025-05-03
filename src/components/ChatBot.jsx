import React, { useEffect, useRef, useState } from "react";
import { initializeRAG, queryRAG } from './rag.js';

export default function ChatBot({ initialBotMessage, pdfUrl, apiKey }) {
  const [messages, setMessages] = useState([
    { id: 0, sender: "bot", text: initialBotMessage },
  ]);
  const [input, setInput] = useState("");
  const [ragSystem, setRagSystem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const system = await initializeRAG(pdfUrl, apiKey);
        setRagSystem(system);
        setMessages((prev) => [
          ...prev,
          { id: prev.length, sender: "bot", text: "I'm ready to answer your questions about the document." },
        ]);
      } catch (error) {
        console.error("Error initializing RAG system:", error);
        setMessages((prev) => [
          ...prev,
          { id: prev.length, sender: "bot", text: "Error loading the document: " + error.message },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [pdfUrl, apiKey]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, sender: "user", text },
    ]);
    setInput("");
    if (isLoading || !ragSystem) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, sender: "bot", text: "Still loading the document, please wait." },
      ]);
    } else {
      try {
        const response = await queryRAG(ragSystem, text);
        setMessages((prev) => [
          ...prev,
          { id: prev.length, sender: "bot", text: response },
        ]);
      } catch (error) {
        console.error("Error querying RAG system:", error);
        setMessages((prev) => [
          ...prev,
          { id: prev.length, sender: "bot", text: "Error getting response: " + error.message },
        ]);
      }
    }
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
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
