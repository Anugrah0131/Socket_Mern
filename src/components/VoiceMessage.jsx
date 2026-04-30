import React, { useState, useRef } from "react";

export default function VoiceMessage({ audioUrl, timestamp }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="voice-message-container">
      <button className="voice-play-btn" onClick={togglePlay}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <div className="voice-visualizer">
        <div className="voice-wave"></div>
        <div className="voice-wave"></div>
        <div className="voice-wave"></div>
        <div className="voice-wave"></div>
        <div className="voice-wave"></div>
      </div>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <span className="voice-time">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
}
