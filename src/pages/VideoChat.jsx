import React, { useState, useEffect, useCallback } from "react";
import { getSocket } from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";
import ControlBar from "../components/ControlBar";
import VideoSection from "../components/VideoSection";
import ChatPanel from "../components/ChatPanel";

export default function VideoChat() {

  const socket = getSocket();

  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ define first (IMPORTANT)
  const reconnectToNewPartner = useCallback(() => {

    resetState();
    createPeerConnection();
    setStatus("waiting");
    socket.emit("find_match");

  }, []);

  const {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    streamRef,
    createPeerConnection,
    initMedia,
    addIceCandidate,
    flushCandidateQueue
  } = useWebRTC(socket, reconnectToNewPartner);

  function resetState() {

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

  const handleMatchFound = async ({ roomId, initiator }) => {

    socket.roomId = roomId;
    setRoomId(roomId);
    setStatus("chatting");

    if (initiator && peerConnectionRef.current) {

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("create_offer", {
        roomId,
        offer
      });

    }

  };

  const handleOffer = async (data) => {

    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    await flushCandidateQueue();

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

    await flushCandidateQueue();

  };

  const handleIceCandidate = async (data) => {

    const candidate = new RTCIceCandidate(data.candidate);
    await addIceCandidate(candidate);

  };

  const handleMessage = (data) => {
    setMessages((prev) => [...prev, data]);
  };

  const handlePartnerLeft = () => reconnectToNewPartner();
  const handleResetChat = () => reconnectToNewPartner();

  useEffect(() => {

    initMedia(); // ✅ ONLY ONCE HERE

    socket.on("match_found", handleMatchFound);
    socket.on("offer_created", handleOffer);
    socket.on("answer_created", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("receive_message", handleMessage);
    socket.on("partner_left", handlePartnerLeft);
    socket.on("reset_chat", handleResetChat);

    socket.on("user_profile", (data) => {
      console.log("PROFILE RECEIVED:", data);
      setUser(data);
    });

    return () => {

      socket.off("match_found", handleMatchFound);
      socket.off("offer_created", handleOffer);
      socket.off("answer_created", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("receive_message", handleMessage);
      socket.off("partner_left", handlePartnerLeft);
      socket.off("reset_chat", handleResetChat);
      socket.off("user_profile");

    };

  }, []);

  function findMatch() {

    if (status !== "idle") return;

    setStatus("waiting");
    socket.emit("find_match");

  }

  function sendMessage() {

    if (!roomId || !message.trim()) return;

    socket.emit("send_message", { roomId, message });
    setMessage("");

  }

  function skipChat() {

    if (!roomId) return;
    socket.emit("skip");

  }

  function stopChat() {

    if (roomId) {
      socket.emit("leave_room", { roomId });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setStatus("idle");
    setRoomId("");
    setMessages([]);
    setMessage("");

  }

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  function toggleMic() {

    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setMicEnabled(prev => !prev);

  }

  function toggleCamera() {

    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });

    setCameraEnabled(prev => !prev);

  }

  return (

    <div className="app">

      <h1 className="title">
        Video Chat {user && `— ${user.username}`}
      </h1>

      <VideoSection
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        status={status}
        user={user}
      />

      {status === "idle" && (
        <button className="main-btn" onClick={findMatch}>
          Start Chat
        </button>
      )}

      <ControlBar
        status={status}
        findMatch={findMatch}
        skipChat={skipChat}
        stopChat={stopChat}
        toggleMic={toggleMic}
        toggleCamera={toggleCamera}
      />

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