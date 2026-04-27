import { useRef, useState } from "react";

export default function useWebRTC(socket, reconnectToNewPartner) {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null);
  const candidateQueue = useRef([]);
  const reconnectGuard = useRef(false);

  const [mediaError, setMediaError] = useState(null);

  function createPeerConnection() {

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // 🔥 UPDATED ICE CONFIG (REAL-WORLD READY)
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },

        // TURN (public fallback — replace in production)
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],

      // 🔥 OPTIONAL DEBUG MODE
      // iceTransportPolicy: "relay"
    });

    const pc = peerConnectionRef.current;

    if (!streamRef.current) return;

    // attach local tracks
    streamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, streamRef.current);
    });

    // 🔥 BETTER CONNECTION HANDLING
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("Connection state:", state);

      if ((state === "failed" || state === "disconnected") && !reconnectGuard.current) {
        reconnectGuard.current = true;

        setTimeout(() => {
          reconnectGuard.current = false;
          reconnectToNewPartner();
        }, 1000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      console.log("ICE state:", iceState);

      if ((iceState === "failed" || iceState === "disconnected") && !reconnectGuard.current) {
        reconnectGuard.current = true;

        setTimeout(() => {
          reconnectGuard.current = false;
          reconnectToNewPartner();
        }, 1000);
      }
    };

    // send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.roomId) {
        socket.emit("ice_candidate", {
          roomId: socket.roomId,
          candidate: event.candidate,
        });
      }
    };

    // 🔥 IMPROVED ontrack
    pc.ontrack = (event) => {
      const video = remoteVideoRef.current;
      const stream = event.streams[0];

      if (!video || !stream) return;

      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      video.style.opacity = 1;

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Remote video play error:", err);
          }
        });
      }
    };
  }

  async function initMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMediaError(null);

    } catch (err) {
      console.error("Media access error:", err);

      if (err.name === "NotAllowedError") {
        setMediaError("Permission denied. Allow camera & mic.");
      } else if (err.name === "NotFoundError") {
        setMediaError("No camera/mic found.");
      } else {
        setMediaError("Failed to access media devices.");
      }
    }
  }

  async function addIceCandidate(candidate) {
    if (!peerConnectionRef.current) return;

    try {
      if (peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } else {
        candidateQueue.current.push(candidate);
      }
    } catch (err) {
      console.error("ICE candidate error:", err);
    }
  }

  async function flushCandidateQueue() {
    for (const candidate of candidateQueue.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (err) {
        console.error("Queued ICE error:", err);
      }
    }
    candidateQueue.current = [];
  }

  function stopMediaTracks() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }

  function cleanupAll() {
    stopMediaTracks();

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const video = remoteVideoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
      video.removeAttribute("src");
      video.load();
    }

    candidateQueue.current = [];
    reconnectGuard.current = false;
  }

  return {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    streamRef,
    candidateQueue,
    createPeerConnection,
    initMedia,
    addIceCandidate,
    flushCandidateQueue,
    stopMediaTracks,
    cleanupAll,
    mediaError
  };
}