import React from "react";

export default function ControlBar({
  skipChat,
  stopChat,
  toggleMic,
  toggleCamera,
  micEnabled,
  cameraEnabled
}) {

  return (

    <div className="control-bar">

      <button
        className={`control-btn ${!micEnabled ? "off" : ""}`}
        onClick={toggleMic}
      >
        {micEnabled ? "🎤" : "🔇"}
        <span>{micEnabled ? "Mute" : "Unmute"}</span>
      </button>

      <button
        className={`control-btn ${!cameraEnabled ? "off" : ""}`}
        onClick={toggleCamera}
      >
        {cameraEnabled ? "📷" : "🚫"}
        <span>{cameraEnabled ? "Camera Off" : "Camera On"}</span>
      </button>

      <button
        className="control-btn skip-btn"
        onClick={skipChat}
        style={{ background: "#6366f1", borderColor: "#4f46e5", padding: "14px 28px" }}
      >
        ⏭️
        <span>Next</span>
      </button>

      <button
        className="control-btn stop-btn"
        onClick={stopChat}
        style={{ background: "#ef4444", borderColor: "#dc2626", padding: "14px 28px" }}
      >
        ⏹️
        <span>Stop</span>
      </button>

    </div>

  );

}