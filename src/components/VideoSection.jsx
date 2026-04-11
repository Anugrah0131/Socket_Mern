import React, { useEffect } from "react";

export default function VideoSection({
  localVideoRef,
  remoteVideoRef,
  status,
  user
}) {

  console.log("VIDEO SECTION USER:", user);

  useEffect(() => {
    if (remoteVideoRef?.current) {
      remoteVideoRef.current.onloadedmetadata = () => {
        remoteVideoRef.current.play().catch(() => {});
      };
    }
  }, [remoteVideoRef]);

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
          👋 {user?.username || "You"}
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