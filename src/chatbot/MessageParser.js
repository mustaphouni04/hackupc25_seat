class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    // This function will be overridden by our CustomMessageParser
    // But we keep a default implementation
    const lowerCase = message.toLowerCase();
    
    if (
      lowerCase.includes("hello") ||
      lowerCase.includes("hi") ||
      lowerCase.includes("hey")
    ) {
      this.actionProvider.handleGeminiResponse("Hello! How can I help you with your CUPRA Tavascan?");
    } else {
      this.actionProvider.handleGeminiResponse("I'll provide information about your CUPRA Tavascan. What would you like to know?");
    }
  }
}

export default MessageParser;