
import React, { useState, useEffect } from "react";
import { getSocket } from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";

import VideoSection from "../components/VideoSection";
import ChatPanel from "../components/ChatPanel";

export default function VideoChat() {

  const socket = getSocket();

  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    streamRef,
    candidateQueue,
    createPeerConnection,
    initMedia
  } = useWebRTC(socket, reconnectToNewPartner);

  // ---------------------------
  // Reset App State
  // ---------------------------

  function resetState() {

    candidateQueue.current = [];

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.style.opacity = 0;
    }

    setStatus("idle");
    setRoomId("");
    setMessages([]);
    setMessage("");

  }

  // ---------------------------
  // Reconnect Logic
  // ---------------------------

  function reconnectToNewPartner() {

    resetState();

    createPeerConnection();

    setStatus("waiting");

    socket.emit("find_match");

  }

  // ---------------------------
  // Socket Event Handlers
  // ---------------------------

  const handleMatchFound = async ({ roomId, initiator }) => {

    socket.roomId = roomId;

    setRoomId(roomId);

    setStatus("chatting");

    if (initiator && peerConnectionRef.current) {

      const offer = await peerConnectionRef.current.createOffer();

      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("create_offer", {
        roomId: socket.roomId,
        offer
      });

    }

  };

  const handleOffer = async (data) => {

    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    while (candidateQueue.current.length) {

      const candidate = candidateQueue.current.shift();

      await peerConnectionRef.current.addIceCandidate(candidate);

    }

    const answer = await peerConnectionRef.current.createAnswer();

    await peerConnectionRef.current.setLocalDescription(answer);

    socket.emit("create_answer", {
      roomId: data.roomId,
      answer
    });

  };

  const handleAnswer = async (data) => {

    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    while (candidateQueue.current.length) {

      const candidate = candidateQueue.current.shift();

      await peerConnectionRef.current.addIceCandidate(candidate);

    }

  };

  const handleIceCandidate = async (data) => {

    if (!peerConnectionRef.current) return;

    const candidate = new RTCIceCandidate(data.candidate);

    if (peerConnectionRef.current.remoteDescription) {

      await peerConnectionRef.current.addIceCandidate(candidate);

    } else {

      candidateQueue.current.push(candidate);

    }

  };

  const handleMessage = (data) => {

    setMessages((prev) => [...prev, data]);

  };

  const handlePartnerLeft = () => {

    resetState();

    createPeerConnection();

    setStatus("waiting");

    socket.emit("find_match");

  };

  const handleResetChat = () => {

    resetState();

    createPeerConnection();

    setStatus("waiting");

    socket.emit("find_match");

  };

  // ---------------------------
  // useEffect
  // ---------------------------

  useEffect(() => {

    initMedia();

    socket.on("match_found", handleMatchFound);
    socket.on("offer_created", handleOffer);
    socket.on("answer_created", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("receive_message", handleMessage);
    socket.on("partner_left", handlePartnerLeft);
    socket.on("reset_chat", handleResetChat);

    // cleanup listeners

    return () => {

      socket.off("match_found", handleMatchFound);
      socket.off("offer_created", handleOffer);
      socket.off("answer_created", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("receive_message", handleMessage);
      socket.off("partner_left", handlePartnerLeft);
      socket.off("reset_chat", handleResetChat);

    };

  }, []);

  // ---------------------------
  // UI Actions
  // ---------------------------

  function findMatch() {

    if (status !== "idle") return;

    setStatus("waiting");

    socket.emit("find_match");

  }

  function sendMessage() {

    if (!roomId || !message.trim()) return;

    socket.emit("send_message", {
      roomId,
      message
    });

    setMessage("");

  }

  function skipChat() {

    if (!roomId) return;

    socket.emit("skip");

  }

  // ---------------------------
  // UI
  // ---------------------------

  return (

    <div className="app">

      <h1 className="title">Random Video Chat</h1>

      <VideoSection
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        status={status}
      />

      {status === "idle" && (

        <button
          className="main-btn"
          onClick={findMatch}
        >
          Start Chat
        </button>

      )}

      {status === "chatting" && (

        <ChatPanel
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          skipChat={skipChat}
        />

      )}

    </div>

  );

}