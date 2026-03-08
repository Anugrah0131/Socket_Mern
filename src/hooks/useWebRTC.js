import { useRef } from "react";

export default function useWebRTC(socket, reconnectToNewPartner) {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null);
  const candidateQueue = useRef([]);

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
      }

    };

  }

  async function initMedia() {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    createPeerConnection();
  }

  return {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    streamRef,
    candidateQueue,
    createPeerConnection,
    initMedia,
  };
}