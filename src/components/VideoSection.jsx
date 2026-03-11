import React from "react";

export default function VideoSection({ localVideoRef, remoteVideoRef, status }) {

  return (

    <div className="video-grid">

      {/* Partner video */}
      <div className="video-card partner">

        <div className="user-tag">
          👤 Stranger
        </div>

        {status === "chatting" && (
          <div className="status-indicator">
            ● Connected
          </div>
        )}

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
        />

        {(status === "waiting" || status === "idle") && (
          <div className="search-overlay">
            <div className="loader"></div>
            <p>Finding someone online...</p>
          </div>
        )}

      </div>


      {/* Your camera */}
      <div className="video-card self">

        <div className="user-tag">
          👋 You
        </div>

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
        />

      </div>

    </div>

  );

}