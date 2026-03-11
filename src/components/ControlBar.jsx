import React from "react";

export default function ControlBar({
  skipChat,
  stopChat,
  toggleMic,
  toggleCamera
}) {

  return (

    <div className="control-bar">

      <button
        className="control-btn"
        onClick={toggleMic}
      >
        🎤
        <span>Mic</span>
      </button>

      <button
        className="control-btn"
        onClick={toggleCamera}
      >
        📷
        <span>Camera</span>
      </button>

      <button
        className="skip-btn"
        onClick={skipChat}
      >
        Skip
      </button>

      <button
        className="stop-btn"
        onClick={stopChat}
      >
        Stop
      </button>

    </div>

  );

}