import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { connectSocket } from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";
import ControlBar from "../components/ControlBar";
import VideoSection from "../components/VideoSection";
import ChatPanel from "../components/ChatPanel";
import { AuthContext } from "../context/AuthContext";

export default function VideoChat() {

  const { user } = useContext(AuthContext);

 
  // ✅ guest creation
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!user && !storedUser) {
      console.log("👤 Creating guest user...");

      const guestUser = {
        userId: crypto.randomUUID(),
        username: "guest_" + Math.floor(Math.random() * 10000),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        isGuest: true,
        token: null,
      };

      localStorage.setItem("user", JSON.stringify(guestUser));
      window.location.reload();
    }
  }, [user]);

  const [socket, setSocket] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const reconnectTimeout = useRef(null);

  // ✅ CONNECT SOCKET PROPERLY
  useEffect(() => {
    if (!user) {
      console.log("⛔ No user yet");
      return;
    }

    console.log("👤 User:", user);

    const s = connectSocket(user);
    if (!s) return;

    // 🔥 WAIT FOR REAL CONNECTION
    const handleConnect = () => {
      console.log("🟢 Socket connected:", s.id);
      setSocket(s);
      setSocketReady(true);
    };

    const handleError = (err) => {
      console.error("❌ Socket error:", err);
    };

    s.on("connect", handleConnect);
    s.on("connect_error", handleError);

    return () => {
      s.off("connect", handleConnect);
      s.off("connect_error", handleError);
    };

  }, [user]);

  const reconnectToNewPartner = useCallback(() => {

    if (!socket) return;

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    resetState();
    setStatus("waiting");

    reconnectTimeout.current = setTimeout(() => {
      if (socket.roomId) return;
      socket.emit("find_match");
      reconnectTimeout.current = null;
    }, 600);

  }, [socket]);

  const {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    streamRef,
    createPeerConnection,
    initMedia,
    addIceCandidate,
    flushCandidateQueue,
    cleanupAll,
    mediaError
  } = useWebRTC(socket, reconnectToNewPartner);

  function resetState() {

    if (!socket) return;

    socket.roomId = null;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteVideoRef.current) {
      const video = remoteVideoRef.current;
      video.pause();
      video.srcObject = null;
      video.removeAttribute("src");
      video.load();
      video.style.opacity = 0;
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

    createPeerConnection();

    if (initiator && peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("create_offer", { roomId, offer });
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
    if (!socketReady || !socket) return;

    initMedia();

    socket.on("match_found", handleMatchFound);
    socket.on("offer_created", handleOffer);
    socket.on("answer_created", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("receive_message", handleMessage);
    socket.on("partner_left", handlePartnerLeft);
    socket.on("reset_chat", handleResetChat);

    return () => {
      cleanupAll();

      socket.off("match_found", handleMatchFound);
      socket.off("offer_created", handleOffer);
      socket.off("answer_created", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("receive_message", handleMessage);
      socket.off("partner_left", handlePartnerLeft);
      socket.off("reset_chat", handleResetChat);
    };

  }, [socketReady, socket]);

  function findMatch() {
    if (!socketReady || status !== "idle") return;
    setStatus("waiting");
    socket.emit("find_match");
  }

  function sendMessage() {
    if (!roomId || !message.trim()) return;
    socket.emit("send_message", { roomId, message });
    setMessage("");
  }

  function skipChat() {
    if (!roomId) {
      reconnectToNewPartner();
      return;
    }
    socket.emit("skip");
    reconnectToNewPartner();
  }

  function stopChat() {
    if (roomId) socket.emit("leave_room", { roomId });
    resetState();
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
    <div className="app-container">

      <h1 className="title">
        Video Chat {user && `— ${user.username}`}
      </h1>

      {!socketReady && (
        <div className="text-white text-center mt-10">
          🔌 Connecting to server...
        </div>
      )}

      {mediaError ? (
        <div className="error-card">
          <h2>⚠️ Required Media Access</h2>
          <p>{mediaError}</p>
        </div>
      ) : (
        <>
          <VideoSection
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            status={status}
            user={user}
            cameraEnabled={cameraEnabled}
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
            micEnabled={micEnabled}
            cameraEnabled={cameraEnabled}
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
        </>
      )}

    </div>
  );
}