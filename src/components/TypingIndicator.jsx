import React from "react";

export default function TypingIndicator({ username }) {
  return (
    <div className="typing-indicator-container">
      <div className="typing-bubbles">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="typing-text">{username} is typing...</span>
    </div>
  );
}
