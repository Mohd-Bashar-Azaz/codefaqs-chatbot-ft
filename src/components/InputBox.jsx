import { useState } from "react";

function InputBox({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;

    onSend(input);
    setInput("");
  };

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder="Ask a programming question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}

export default InputBox;