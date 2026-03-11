import React from "react"; 
import SearchOverlay from "./SearchOverlay";

export default function VideoSection({ localVideoRef, remoteVideoRef, status }) {
  return (
    <div className="video-grid">
      <div className="video-container partner">
        <div className="user-tag">👤 Stranger</div>
        {status === "chatting" && <div className="safety-badge">🛡️ Safety Shield</div>}
        
        <video 
           ref={remoteVideoRef} 
           autoPlay 
           playsInline 
           style={{ opacity: status === "chatting" ? 1 : 0, transition: '0.5s' }}
        />

        {(status === "waiting" || status === "idle") && (
          <SearchOverlay />
        )}
      </div>

      <div className="video-container self">
        <div className="user-tag">👋 You</div>
        <video ref={localVideoRef} autoPlay muted playsInline />
      </div>
    </div>
  );
}