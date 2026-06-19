import { useRef, useEffect } from "react";
import Message from "./Message";

// An array of questions we want to suggest to the user
const SUGGESTED_QUESTIONS = [
  "What is React?",
  "What is MERN stack?",
  "Docker vs Kubernetes",
  "What is a Neural Network?",
  "What is Git?"
];

function ChatWindow({ messages, onSend }) {
  // 1. Create a reference to point to an empty div at the bottom
  const endOfMessagesRef = useRef(null);

  // 2. Automatically scroll to that div whenever 'messages' change
  useEffect(() => {
    // The smooth behavior makes the scroll look nice
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((message) => (
        <Message
          key={message.id}
          sender={message.sender}
          text={message.text}
        />
      ))}
      
      {/* Suggestion Buttons placed inside the chat window so they scroll */}
      <div className="suggestions">
        {SUGGESTED_QUESTIONS.map((q, index) => (
          <button 
            key={index} 
            className="suggestion-btn" 
            onClick={() => onSend(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {/* 3. Place the empty div at the very end of the message list */}
      <div ref={endOfMessagesRef} />
    </div>
  );
}

export default ChatWindow;