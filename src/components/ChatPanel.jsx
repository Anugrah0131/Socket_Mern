import React, { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatPanel({
  messages,
  message,
  setMessage,
  sendMessage,
  isPartnerTyping,
  partnerUsername,
  onTyping,
  sendVoiceMessage
}) {
  const messagesEndRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          sendVoiceMessage(reader.result);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="premium-chat-panel flex-column">
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-chat-icon">✨</div>
            <p>Start a conversation with {partnerUsername}!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble 
              key={msg.id || i} 
              msg={msg} 
              isSelf={msg.isSelf} 
            />
          ))
        )}

        {isPartnerTyping && (
          <div className="typing-indicator-wrap slide-up">
            <div className="typing-bubble glass">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container glass-dark">
        <div className="chat-input-row">
          <button 
            className={`record-btn ${isRecording ? "recording" : ""}`}
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            title="Hold to record voice"
          >
            {isRecording ? "🔴" : "🎤"}
          </button>

          <input
            type="text"
            className="chat-text-input"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Write something..."
          />

          <button 
            className="send-message-btn" 
            onClick={sendMessage}
            disabled={!message.trim() || isRecording}
          >
            <span className="send-icon">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
}