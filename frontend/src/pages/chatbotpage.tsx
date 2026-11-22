import { useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the SmartBet NFL Chatbot! Ask me about teams, games, players, and historical statistics."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const question = input.trim();

    if (!question || loading) return;

    setInput("");
    setError("");

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question }
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get an answer.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer
        }
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot-page">
      <h1>SmartBet NFL Chatbot</h1>
      <p>Ask questions about real NFL teams, games, and player statistics.</p>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role}`}
          >
            <strong>
              {message.role === "user" ? "You" : "NFL Chatbot"}
            </strong>
            <p>{message.content}</p>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <strong>NFL Chatbot</strong>
            <p>Looking up information...</p>
          </div>
        )}
      </div>

      {error && <p className="chatbot-error">{error}</p>}

      <form onSubmit={sendMessage} className="chatbot-form">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask an NFL question..."
          disabled={loading}
          maxLength={1000}
        />

        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatbotPage;
