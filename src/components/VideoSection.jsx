import React, { useEffect } from "react";

export default function VideoSection({
  localVideoRef,
  remoteVideoRef,
  status,
  user,
  cameraEnabled
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
            <p>Searching for partner...</p>
          </div>
        )}

      </div>

      {/* Your camera (PiP) */}
      <div className="video-card self">

        <div className="user-tag">
          👋 {user?.username || "You"}
        </div>

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ opacity: cameraEnabled ? 1 : 0 }}
        />

        {!cameraEnabled && (
          <div className="search-overlay">
            <h1 style={{fontSize: "3rem", margin: 0}}>🚫</h1>
            <p>Camera Off</p>
          </div>
        )}

      </div>

    </div>

  );

}