import React from "react";
import SearchOverlay from "./SearchOverlay";

export default function VideoSection({
  localVideoRef,
  remoteVideoRef,
  status
}) {

  return (

    <div className="video-wrapper">

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="remote-video"
      />

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="local-video"
      />

      {status === "waiting" && <SearchOverlay />}

    </div>

  );

}