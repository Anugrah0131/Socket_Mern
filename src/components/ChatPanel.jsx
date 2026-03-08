import React from "react";
export default function ChatPanel({
  messages,
  message,
  setMessage,
  sendMessage,
  skipChat
}) {

  return (

    <div className="chat-panel">

      <div className="messages">

        {messages.map((msg, i) => (

          <div key={i} className="message">
            <b>{msg.sender}: </b> {msg.message}
          </div>

        ))}

      </div>

      <div className="chat-input">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>
          Send
        </button>

        <button className="skip-btn" onClick={skipChat}>
          Skip
        </button>

      </div>

    </div>

  );

}