class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  // This is a placeholder that will be overridden by CustomActionProvider
  handleGeminiResponse(response) {
    const message = this.createChatBotMessage(response);
    this.updateChatbotState(message);
  }

  // Helper function to update state
  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }

  // Loading indicator functionality
  setLoading(loading) {
    this.setState((prevState) => ({
      ...prevState,
      loading,
    }));
  }
}

export default ActionProvider;