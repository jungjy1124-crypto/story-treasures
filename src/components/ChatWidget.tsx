import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

const suggestedChips = [
  "라스콜니코프는 왜 자수했나요?",
  "소냐는 어떤 인물인가요?",
  "도스토옙스키가 말하고 싶은 게 뭔가요?",
  "포르피리는 왜 바로 체포 안 했나요?",
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "안녕하세요. 죄와 벌에 대해 궁금한 것이 있으시면 뭐든 물어보세요. 라스콜니코프의 심리, 등장인물, 주제, 현대적 의미 — 어떤 이야기든 함께 나눌 수 있어요.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async (text?: string) => {
    const msgText = (text || inputValue).trim();
    if (!msgText || isSending) return;

    setInputValue("");
    setShowChips(false);
    setIsSending(true);

    setMessages((prev) => [...prev, { role: "user", text: msgText }]);
    setIsTyping(true);

    // Simulate AI response (placeholder - no actual API call)
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "죄송해요, 지금은 AI 응답 기능이 연결되어 있지 않아요. 곧 업데이트될 예정이에요.",
        },
      ]);
      setIsSending(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  };

  return (
    <>
      {/* FAB */}
      <div
        className={`chat-fab ${isOpen ? "open" : ""}`}
        onClick={toggleChat}
      >
        {isOpen ? "✕" : "💬"}
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header-bar">
          <div className="chat-header-avatar">📖</div>
          <div className="chat-header-info">
            <div className="chat-header-title">죄와 벌 이야기하기</div>
            <div className="chat-header-sub">AI가 함께 읽어드려요</div>
          </div>
          <div className="chat-close" onClick={() => setIsOpen(false)}>
            ✕
          </div>
        </div>

        <div className="chat-messages" ref={messagesRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === "user" ? "user" : "ai"}`}>
              <div className="msg-avatar">
                {msg.role === "user" ? "👤" : "📖"}
              </div>
              <div
                className="msg-bubble"
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\n/g, "<br>"),
                }}
              />
            </div>
          ))}
          {isTyping && (
            <div className="msg ai">
              <div className="msg-avatar">📖</div>
              <div className="msg-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {showChips && (
          <div className="chat-chips">
            {suggestedChips.map((chip) => (
              <div
                key={chip}
                className="chip"
                onClick={() => sendMessage(chip)}
              >
                {chip}
              </div>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="작품에 대해 질문해보세요..."
            rows={1}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={isSending}
          />
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
