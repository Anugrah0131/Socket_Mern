import React from "react";

export default function ControlBar({
  status,
  findMatch,
  skipChat,
  stopChat,
  toggleMic,
  toggleCamera,
  micEnabled,
  cameraEnabled,
  activeDrawer,
  toggleChat
}) {
  return (
    <div className="floating-control-wrap flex-center">
      <div className="floating-control-bar glass premium-shadow">
        
        {/* Media Controls */}
        <div className="control-section">
          <button
            className={`control-circle-btn ${!micEnabled ? "muted" : ""}`}
            onClick={toggleMic}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? "🎤" : "🔇"}
          </button>

          <button
            className={`control-circle-btn ${!cameraEnabled ? "muted" : ""}`}
            onClick={toggleCamera}
            title={cameraEnabled ? "Stop Camera" : "Start Camera"}
          >
            {cameraEnabled ? "📷" : "🚫"}
          </button>
        </div>

        <div className="control-divider"></div>

        {/* Action Controls */}
        <div className="control-section">
          {status === "chatting" ? (
            <>
              <button className="premium-btn skip-btn" onClick={skipChat}>
                <span className="btn-icon">⏭️</span>
                <span className="btn-label">Next</span>
              </button>
              
              <button className="premium-btn stop-btn" onClick={stopChat}>
                <span className="btn-icon">⏹️</span>
                <span className="btn-label">Stop</span>
              </button>
            </>
          ) : (
            <button 
              className="premium-btn start-btn" 
              onClick={findMatch}
              disabled={status === "waiting"}
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-label">{status === "waiting" ? "Searching..." : "Start Matching"}</span>
            </button>
          )}
        </div>

        <div className="control-divider"></div>

        {/* Interaction Controls */}
        <div className="control-section">
          <button 
            className={`control-circle-btn chat-toggle-btn ${activeDrawer === 'chat' ? "active" : ""}`}
            onClick={toggleChat}
            title="Toggle Chat"
          >
            💬
          </button>
        </div>

      </div>
    </div>
  );
}