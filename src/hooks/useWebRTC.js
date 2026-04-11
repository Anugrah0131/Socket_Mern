import { useRef, useState } from "react";

export default function useWebRTC(socket, reconnectToNewPartner) {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null);
  const candidateQueue = useRef([]);
  const [mediaError, setMediaError] = useState(null);

  function createPeerConnection() {

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, streamRef.current);
    });

    peerConnectionRef.current.onconnectionstatechange = () => {

      const state = peerConnectionRef.current.connectionState;

      if (state === "failed") {
        reconnectToNewPartner();
      }

    };

    peerConnectionRef.current.oniceconnectionstatechange = () => {

      const iceState = peerConnectionRef.current.iceConnectionState;

      if (iceState === "failed") {
        reconnectToNewPartner();
      }

    };

    peerConnectionRef.current.onicecandidate = (event) => {

      if (event.candidate && socket.roomId) {

        socket.emit("ice_candidate", {
          roomId: socket.roomId,
          candidate: event.candidate,
        });

      }

    };

    peerConnectionRef.current.ontrack = (event) => {

      if (remoteVideoRef.current) {

        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.style.opacity = 1;
        
        // Ensure play is explicitly called when track arrives
        remoteVideoRef.current.play().catch(err => console.error("Remote video play error:", err));

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
      createPeerConnection();

    } catch (err) {
      
      console.error("Media access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMediaError("Permission Denied: Please allow camera and microphone access to find a match.");
      } else if (err.name === 'NotFoundError') {
        setMediaError("Hardware Error: No camera or microphone was found.");
      } else {
        setMediaError("Error accessing media devices. Please refresh.");
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
    candidateQueue.current = [];
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