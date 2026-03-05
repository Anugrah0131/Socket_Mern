import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

let socket;

function App() {
  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const localVideoRef = useRef(null); // ✅ FIXED
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    socket = io("http://localhost:3000");

    async function init() {
      // ✅ Get media first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        console.error("media device error:", err);
        alert("Could not access camera/microphone. Please allow access and refresh.");
        return;
      }

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // ✅ Create peer connection
      createPeerConnection(stream);
    }

    function createPeerConnection() {
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
          },
        ],

      });

      // Add tracks to peer connection
      if (!streamRef.current) {
        console.error("No local stream available");
        return;
      }

      streamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, streamRef.current);
      });

      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log(
          "Connection State:",
          peerConnectionRef.current.connectionState
        );
      };
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log(
          "ICE Connection State:",
          peerConnectionRef.current.iceConnectionState
        );
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;

        if (state === "disconnected" || state === "failed") {
          resetState();
          createPeerConnection();
          setStatus("waiting");
          socket.emit("find_match");
        }
      };


      // ICE candidaten
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socket.roomId) {
          socket.emit("ice_candidate", {
            roomId: socket.roomId,
            candidate: event.candidate,
          });
        }
      };

      // Remote stream
      peerConnectionRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
    }

    init();

    socket.on("match_found", async ({ roomId, initiator }) => {
      socket.roomId = roomId;
      setRoomId(roomId);
      setStatus("chatting");

      if (initiator) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        socket.emit("create_offer", {
          roomId: socket.roomId,
          offer,
        });
      }
    });

    socket.on("offer_created", async (data) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("create_answer", {
        roomId: data.roomId,
        answer,
      });
    });

    socket.on("answer_created", async (data) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    });

    socket.on("ice_candidate", async (data) => {
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      socket.emit("typing", { roomId: socket.roomId });
    });

    socket.on("partner_left", () => {
      resetState();
      createPeerConnection();
      // show searching animation
      setStatus("waiting");

      // automatically find new match
      socket.emit("find_match");

    });

    socket.on("reset_chat", () => {
      resetState();
      createPeerConnection();

      setStatus("waiting");
      socket.emit("find_match");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

 
  // Fade in remote video when it starts playing
  function resetState() {
    // Only close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear remote video only
  peerConnectionRef.current.ontrack = (event) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
      remoteVideoRef.current.style.opacity = 1;
    }
  };
   

    setStatus("idle");
    setRoomId("");
    setMessages([]);
    setMessage("");
  }

  function findMatch() {
    if (status !== "idle") return;
    setStatus("waiting");
    socket.emit("find_match");
  }

  function sendMessage() {
    if (!roomId || !message.trim()) return;

    socket.emit("send_message", {
      roomId,
      message,
    });

    setMessage("");
  }

  function skipChat() {
    if (!roomId) return;
    socket.emit("skip"); // ✅ FIXED EVENT NAME
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Random Chat</h1>

      <div className="video-container">
        <video ref={remoteVideoRef} autoPlay playsInline />
        <video ref={localVideoRef} autoPlay muted playsInline className="local" />
      </div>

      {status === "idle" && <button onClick={findMatch}>Find Match</button>}

      {status === "waiting" && (
        <div className="searching">
          Connecting...
        </div>
      )}

      {status === "chatting" && (
        <>
          <div>
            {messages.map((msg, i) => (
              <div key={i}>
                <b>{msg.sender}:</b> {msg.message}
              </div>
            ))}
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={skipChat}>Skip</button>
        </>
      )}


    </div>
  );
}

export default App;
