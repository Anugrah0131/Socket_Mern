import React, { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket } from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";
import ControlBar from "../components/ControlBar";
import VideoSection from "../components/VideoSection";
import ChatPanel from "../components/ChatPanel";
import HeaderBar from "../components/HeaderBar";
import RightPanelDrawer from "../components/RightPanelDrawer";
import { useAuth } from "../context/AuthContext";

export default function VideoChat() {

  const { user } = useAuth();

  useEffect(() => {
    document.title = "Glide | Live Video Chat";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Instantly connect with random people via video chat on Glide.");
    }
  }, []);

 


  const [socket, setSocket] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  
  // Drawer State
  const [activeDrawer, setActiveDrawer] = useState(null); // null, 'chat', 'participants'

  const reconnectTimeout = useRef(null);
  const currentRoomIdRef = useRef(null);

  // ✅ FORCE FRESH STATE ON MOUNT
  useEffect(() => {
    setStatus("idle");
    setRoomId("");
    setMessages([]);
    setMessage("");
    setPartner(null);
    currentRoomIdRef.current = null;
  }, []);

  // ✅ HANDLE REFRESH / TAB CLOSE
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && currentRoomIdRef.current) {
        socket.emit("leave_room", { roomId: currentRoomIdRef.current });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [socket]);

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

  const resetState = useCallback(() => {
    if (!socket) return;

    currentRoomIdRef.current = null;

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
    setPartner(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const reconnectToNewPartner = useCallback(() => {

    if (!socket) return;

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    resetState();
    setStatus("waiting");

    reconnectTimeout.current = setTimeout(() => {
      if (currentRoomIdRef.current) return;
      socket.emit("find_match");
      reconnectTimeout.current = null;
    }, 600);

  }, [socket, resetState]);

  const {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    createPeerConnection,
    initMedia,
    addIceCandidate,
    flushCandidateQueue,
    cleanupAll,
    mediaError,
  } = useWebRTC(socket, reconnectToNewPartner);

  const handleMatchFound = async ({ roomId, initiator, partner }) => {
    console.log("MATCH FOUND PARTNER:", partner);
    setPartner(partner);

    currentRoomIdRef.current = roomId;
    setRoomId(roomId);
    setStatus("chatting");

    createPeerConnection(roomId);

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

  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleMessage = (data) => {
    setMessages((prev) => [...prev, { ...data, isSelf: data.senderId === socket.id }]);
    
    // Auto-emit delivered status
    if (data.senderId !== socket.id && currentRoomIdRef.current) {
      socket.emit("message_delivered", { roomId: currentRoomIdRef.current, msgId: data.id });
    }
  };

  const handleStatusUpdate = ({ msgId, status }) => {
    setMessages((prev) => prev.map(m => m.id === msgId ? { ...m, status } : m));
  };

  const handlePartnerTyping = () => {
    setIsPartnerTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 3000);
  };

  const handlePartnerStopTyping = () => {
    setIsPartnerTyping(false);
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
    socket.on("partner_typing", handlePartnerTyping);
    socket.on("partner_stop_typing", handlePartnerStopTyping);
    socket.on("update_message_status", handleStatusUpdate);
    socket.on("partner_left", handlePartnerLeft);
    socket.on("reset_chat", handleResetChat);

    return () => {
      cleanupAll();
      socket.off("match_found", handleMatchFound);
      socket.off("offer_created", handleOffer);
      socket.off("answer_created", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("receive_message", handleMessage);
      socket.off("partner_typing", handlePartnerTyping);
      socket.off("partner_stop_typing", handlePartnerStopTyping);
      socket.off("update_message_status", handleStatusUpdate);
      socket.off("partner_left", handlePartnerLeft);
      socket.off("reset_chat", handleResetChat);
      socket.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketReady, socket]);

  function findMatch() {
    if (!socketReady || status !== "idle") return;
    resetState();
    setStatus("waiting");
    socket.emit("find_match");
  }

  const localTypingTimeoutRef = useRef(null);
  const onTyping = () => {
    if (!roomId) return;
    if (!localTypingTimeoutRef.current) {
      socket.emit("typing", { roomId });
    }
    if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
    localTypingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId });
      localTypingTimeoutRef.current = null;
    }, 2000);
  };

  function sendMessage() {
    if (!roomId || !message.trim()) return;
    socket.emit("send_message", { roomId, message });
    socket.emit("stop_typing", { roomId });
    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
      localTypingTimeoutRef.current = null;
    }
    setMessage("");
  }

  function sendVoiceMessage(audioUrl) {
    if (!roomId || !audioUrl) return;
    socket.emit("send_message", { roomId, message: "Voice Message", type: "audio", audioUrl });
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
    <div className="immersive-layout">
      <HeaderBar user={user} partner={partner} status={status} />

      <main className="immersive-main">
        <div className={`video-area-wrapper ${activeDrawer ? "drawer-open" : ""}`}>
          <VideoSection 
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            status={status}
            user={user}
            partner={partner}
            cameraEnabled={cameraEnabled}
          />
          
          <ControlBar 
            status={status}
            findMatch={findMatch}
            skipChat={skipChat}
            stopChat={stopChat}
            toggleMic={toggleMic}
            toggleCamera={toggleCamera}
            micEnabled={micEnabled}
            cameraEnabled={cameraEnabled}
            activeDrawer={activeDrawer}
            toggleChat={() => setActiveDrawer(prev => prev === 'chat' ? null : 'chat')}
          />
        </div>

        <RightPanelDrawer 
          isOpen={!!activeDrawer} 
          onClose={() => setActiveDrawer(null)}
          title={activeDrawer === 'chat' ? "Live Chat" : "Participants"}
        >
          {activeDrawer === 'chat' && (
            <ChatPanel 
              messages={messages}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              isPartnerTyping={isPartnerTyping}
              partnerUsername={partner?.username || "Stranger"}
              onTyping={onTyping}
              sendVoiceMessage={sendVoiceMessage}
            />
          )}
        </RightPanelDrawer>
      </main>

      {mediaError && (
        <div className="error-overlay glass-dark flex-center">
          <div className="error-card glass premium-shadow">
            <h2>⚠️ Required Media Access</h2>
            <p>{mediaError}</p>
            <button onClick={() => window.location.reload()} className="action-pill start">
              Retry Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}