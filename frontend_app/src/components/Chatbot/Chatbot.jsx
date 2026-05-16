import {useState, useEffect} from "react";
import {useAuthContext} from "../../context/AuthContext";
import {API_BASE_URL} from "../../config/api";

export const Chatbot = () => {
    const {userEmail, token, isAuthenticated} = useAuthContext();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setMessages([
                {from: "bot", text: `Hello ${userEmail}, how can I help you today?`}
            ]);
        }
    }, [isAuthenticated, userEmail]);

    useEffect(() => {
        if (!isAuthenticated) {
            setMessages([]);
            setInput("");
            setTyping(false);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) return null;

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {from: "user", text: input};
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        setTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatbot/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({message: userMessage.text}),
            });

            const data = await response.json();
            setTyping(false);

            const botMessage = {from: "bot", text: data.reply};
            setMessages(prev => [...prev, botMessage]);

        } catch (err) {
            setTyping(false);
            setMessages(prev => [
                ...prev,
                {from: "bot", text: "Sorry, I couldn't reach the server."}
            ]);
        }
    };

    return (
        <div className="chatbot-container">
            <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
                💬
            </button>

            <div className={`chatbot-window ${open ? "open" : ""}`}>
                <div className="chatbot-header">
                    <span>Game Assistant</span>
                    <button onClick={() => setOpen(false)}>✖</button>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`chatbot-message ${msg.from}`}
                            style={{
                                whiteSpace: "pre-line",   // 🔥 FIX: RESPECT NEWLINES
                                lineHeight: "1.4",
                                marginBottom: "10px"
                            }}
                        >
                            {msg.text}
                        </div>
                    ))}

                    {typing && (
                        <div className="chatbot-message bot typing">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                </div>

                <div className="chatbot-input">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask something..."
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};
