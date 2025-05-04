// Chatbot.jsx
import React, { useEffect, useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "../chatbot/config";
import ActionProvider from "../chatbot/ActionProvider";
import MessageParser from "../chatbot/MessageParser";
import { createChatBotMessage } from "react-chatbot-kit";
import { initializeRAG, queryRAG } from './rag.js';

export default function MyChatbot({ intro }) {
  const [ragSystem, setRagSystem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const system = await initializeRAG(
          "/CUPRA_Tavascan_Owners_Manual_11_24_GB.pdf",
          import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || ""
        );
        setRagSystem(system);
        console.log("RAG system initialized successfully.");
      } catch (error) {
        console.error("Error initializing RAG system:", error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // This function will be passed to both the MessageParser and ActionProvider
  const processMessage = async (message, actions) => {
    if (!ragSystem) {
      actions.handleGeminiResponse("The document is still loading. Please wait.");
      return;
    }
    
    try {
      console.log("Querying with message:", message);
      actions.setLoading(true); // Show loading indicator
      const response = await queryRAG(ragSystem, message);
      console.log("Received response:", response);
      actions.handleGeminiResponse(response);
    } catch (error) {
      console.error("Error querying RAG system:", error);
      actions.handleGeminiResponse("Error getting response: " + error.message);
    } finally {
      actions.setLoading(false); // Hide loading indicator
    }
  };

  // Create custom MessageParser that uses our RAG
  const CustomMessageParser = ({ children, actions }) => {
    const parse = (message) => {
      processMessage(message, actions);
    };

    return (
      <div>
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            parse: parse,
            actions,
          });
        })}
      </div>
    );
  };

  // Create custom ActionProvider that handles Gemini responses
  const CustomActionProvider = ({ createChatBotMessage, setState, children }) => {
    const setLoading = (loading) => {
      setState((prev) => ({
        ...prev,
        loading
      }));
    };

    const handleGeminiResponse = (response) => {
      const botMessage = createChatBotMessage(response);
      
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage]
      }));
    };

    // Create the actions for the MessageParser to use
    const actions = {
      handleGeminiResponse,
      setLoading
    };

    return (
      <div>
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            actions: {
              ...actions,
            },
            setState,
            createChatBotMessage,
          });
        })}
      </div>
    );
  };

  return (
    <div className="h-full">
      <Chatbot
        config={{
          ...config,
          initialMessages: [
            // must be BotMessage instances:
            createChatBotMessage(
              "Hello! I'm your CUPRA assistant. I'm ready to answer questions about your CUPRA Tavascan."
            ),
            // only add the description if intro is truthy
            ...(intro
              ? [createChatBotMessage(intro)]
              : []
            ),
          ],
        }}

        messageParser={CustomMessageParser}
        actionProvider={CustomActionProvider}
      />
    </div>
  );
}