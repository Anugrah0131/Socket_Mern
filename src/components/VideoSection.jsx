import React from "react";

export default function VideoSection({
  localVideoRef,
  remoteVideoRef,
  status,
  partner,
  cameraEnabled
}) {
  return (
    <section className="immersive-video-container">
      
      {/* Remote/Partner Video Area (Main Spotlight) */}
      <div className={`video-spotlight ${status === "chatting" ? "active" : ""}`}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="remote-video-feed"
        />

        {/* Info Overlays */}
        <div className="video-overlay top-left">
          <div className="user-badge glass-dark smooth-transition">
            <span className="badge-name">
              {status === "chatting" 
                ? partner?.username || "Stranger" 
                : status === "waiting" 
                  ? "Connecting..." 
                  : "Ready to Glide"}
            </span>
          </div>
        </div>

        {status === "chatting" && (
          <div className="video-overlay top-right">
            <div className="live-pill glass-dark">
              <span className="pulse-dot"></span>
              LIVE
            </div>
          </div>
        )}

        {/* Matchmaking / Idle States */}
        {status === "waiting" && (
          <div className="matching-overlay flex-center flex-column">
            <div className="premium-loader-v2">
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
              <div className="loader-ring"></div>
            </div>
            <h2 className="matching-title">Finding your next match...</h2>
            <p className="matching-subtitle">Sit tight, we're connecting you to someone new.</p>
          </div>
        )}

        {status === "idle" && (
          <div className="idle-overlay flex-center flex-column">
            <div className="idle-visual glass-dark">
              <div className="logo-glow">G</div>
            </div>
            <h1 className="idle-title">Start a Conversation</h1>
            <p className="idle-subtitle">Click the lightning button below to connect with someone instantly.</p>
          </div>
        )}
      </div>

      {/* Local Video Area (PiP) */}
      <div className={`local-pip glass-dark premium-shadow ${!cameraEnabled ? "muted" : ""}`}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="local-video-feed"
        />
        {!cameraEnabled && (
          <div className="pip-placeholder flex-center">
            <span className="placeholder-icon">🚫</span>
          </div>
        )}
        <div className="pip-label">You</div>
      </div>

    </section>
  );
}