import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  botName: "CUPRA Assistant",
  initialMessages: [
    createChatBotMessage("Initializing CUPRA assistant..."),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#3b82f6",
    },
    chatButton: {
      backgroundColor: "#3b82f6",
    },
  },
  state: {
    loading: true,
  },
};

export default config;