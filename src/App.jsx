import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import { knowledgeBase } from "./data/knowledgeBase";
import "./styles/app.css";

const BACKEND_URL = "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("FAQ");
  const [faqMessages, setFaqMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);

  // Fetch messages from MongoDB when the component mounts or when 'mode' changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/messages?mode=${mode}`);
        if (response.ok) {
          const data = await response.json();
          const history = data.map((msg) => ({
            id: msg._id,
            sender: msg.sender,
            text: msg.text,
          }));

          // Always give a nice greeting if the database returns an empty history
          if (history.length === 0) {
            history.push({
              id: crypto.randomUUID(),
              sender: "bot",
              text: mode === "FAQ" ? "Hello! Ask me any programming FAQ." : "Hi! I am the AI bot. How can I help?",
            });
          }

          if (mode === "FAQ") setFaqMessages(history);
          else setAiMessages(history);
        }
      } catch (error) {
        console.log("Backend unavailable. Continuing seamlessly...");
        // Seamless Fallback logic 
        const defaultMsg = {
          id: crypto.randomUUID(),
          sender: "bot",
          text: mode === "FAQ" ? "Hello! Ask me any programming FAQ." : "Hi! I am the AI bot. How can I help?",
        };
        if (mode === "FAQ" && faqMessages.length === 0) setFaqMessages([defaultMsg]);
        if (mode === "AI" && aiMessages.length === 0) setAiMessages([defaultMsg]);
      }
    };

    fetchHistory();
  }, [mode]);

  // Abstracted out the FAQ search logic to keep handleSend clean
  const resolveFAQ = (question) => {
    const normalizedQuestion = question
      .toLowerCase()
      .replace(/[^\w\s\d]/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    let answer = knowledgeBase[normalizedQuestion];
    if (!answer) {
      const userWords = normalizedQuestion.split(" ");
      const stopWords = ["what", "is", "the", "a", "an", "tell", "me", "about", "explain", "how", "does", "work", "can", "you"];
      const meaningfulWords = userWords.filter((w) => !stopWords.includes(w));

      for (const key in knowledgeBase) {
        const keyWords = key.split(" ");
        const isMatch = meaningfulWords.some((word) => word.length > 1 && keyWords.includes(word));
        if (isMatch) {
          answer = knowledgeBase[key];
          break;
        }
      }
    }
    return answer || "Sorry, I don't know the answer to that question.";
  };

  const handleSend = async (question) => {
    if (question.trim().toLowerCase() === "cls") {
      const resetMsg = [{ id: crypto.randomUUID(), sender: "bot", text: "Chat cleared!" }];
      if (mode === "FAQ") setFaqMessages(resetMsg);
      else setAiMessages(resetMsg);
      return;
    }

    const userMessage = { id: crypto.randomUUID(), sender: "user", text: question };

    if (mode === "FAQ") {
      // 1. Resolve FAQ Locally immediately
      const answer = resolveFAQ(question);
      const botMessage = { id: crypto.randomUUID(), sender: "bot", text: answer };
      
      setFaqMessages((prev) => [...prev, userMessage, botMessage]);

      // 2. Background Sync (Fire-and-forget. The .catch ignores failures for seamlessness)
      fetch(`${BACKEND_URL}/api/faq-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: question, botMessage: answer }),
      }).catch(() => console.log("Background sync failed, but app continues."));

    } else {
      // AI Mode logic
      setAiMessages((prev) => [...prev, userMessage]); 

      try {
        const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        });

        const data = await response.json();

        if (response.ok) {
          const botMessage = { id: crypto.randomUUID(), sender: "bot", text: data.answer };
          setAiMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error(data.error || "AI Backend Error");
        }
      } catch (err) {
        setAiMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: "bot", text: err.message || "AI is currently unavailable." },
        ]);
      }
    }
  };

  const activeMessages = mode === "FAQ" ? faqMessages : aiMessages;

  return (
    <div className="app">
      <h1>Programming FAQ Chatbot</h1>
      
      {/* Mode Toggle Buttons with some inline styling for simplicity */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
        <button
          onClick={() => setMode("FAQ")}
          style={{ padding: "8px 16px", cursor: "pointer", background: mode === "FAQ" ? "#007bff" : "#ccc", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          FAQ Mode
        </button>
        <button
          onClick={() => setMode("AI")}
          style={{ padding: "8px 16px", cursor: "pointer", background: mode === "AI" ? "#007bff" : "#ccc", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          AI Mode
        </button>
      </div>

      <ChatWindow messages={activeMessages} onSend={handleSend} />
      <InputBox onSend={handleSend} />
    </div>
  );
}

export default App;
