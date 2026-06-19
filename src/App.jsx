import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import { knowledgeBase } from "./data/knowledgeBase";
import "./styles/app.css";

function App() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      sender: "bot",
      text: "Hello! Ask me any programming question."
    }
  ]);

  const handleSend = (question) => {
    // Check if the user wants to clear the chat
    if (question.trim().toLowerCase() === "cls") {
      // Reset the messages to just one greeting message
      setMessages([
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: "Chat cleared! What would you like to ask next?"
        }
      ]);
      // Return early so we don't try to answer "cls"
      return;
    }

    // Normalize: lower case, remove punctuation, remove extra spaces
    const normalizedQuestion = question
      .toLowerCase()
      .replace(/[^\w\s\d]/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // 1. Try exact match first
    let answer = knowledgeBase[normalizedQuestion];

    // 2. If no exact match, try keyword matching
    if (!answer) {
      const userWords = normalizedQuestion.split(" ");
      const stopWords = ["what", "is", "the", "a", "an", "tell", "me", "about", "explain", "how", "does", "work", "can", "you"];
      const meaningfulWords = userWords.filter(w => !stopWords.includes(w));

      for (const key in knowledgeBase) {
        const keyWords = key.split(" ");
        const isMatch = meaningfulWords.some(word => word.length > 1 && keyWords.includes(word));
        
        if (isMatch) {
          answer = knowledgeBase[key];
          break;
        }
      }
    }

    // 3. Fallback answer
    if (!answer) {
      answer = "Sorry, I don't know the answer to that question.";
    }

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: question
    };

    const botMessage = {
      id: crypto.randomUUID(),
      sender: "bot",
      text: answer
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  return (
    <div className="app">
      <h1>Programming FAQ Chatbot</h1>

      <ChatWindow messages={messages} onSend={handleSend} />

      <InputBox onSend={handleSend} />
    </div>
  );
}

export default App;