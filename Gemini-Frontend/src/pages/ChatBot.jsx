import React, { useState, useRef } from "react";
import axios from "axios";
import basuri from "../assets/basuri.mp3";
import predefinedAnswers from "../data/predefinedAnswers";


function ChatBot() {
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const musicRef = useRef(null);

  const preQuestions = Object.keys(predefinedAnswers);

  const speak = async (text) => {
    if (isMuted) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/speak",
        { text },
        { responseType: "blob" }
      );

      const audioUrl = URL.createObjectURL(res.data);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      if (musicRef.current) {
        musicRef.current.currentTime = 0;
        musicRef.current.volume = 0.03;
        musicRef.current.play();
      }

      audio.onended = () => {
        setIsSpeaking(false);
        if (musicRef.current) {
          musicRef.current.pause();
          musicRef.current.currentTime = 0;
        }
      };

      audio.play();
    } catch (err) {
      console.error("🎤 ElevenLabs playback error:", err.message);
    }
  };

  const sendMessage = async (question) => {
    const answer = predefinedAnswers[question][language].replace("[name]", username);

    if (!answer) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setMessages((prev) => [...prev, { sender: "bot", text: answer }]);

    speak(answer);
  };

  const handleStart = () => {
    if (username.trim() && language) {
      setSubmitted(true);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Talk with Krishna 🦚</h1>

      {!submitted ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            {/* <option value="kn">Kannada</option> */}
          </select>
          <button onClick={handleStart} style={styles.button}>Start Chat</button>
        </div>
      ) : (
        <>

          <div style={styles.audioControls}>
            <button
              onClick={() => {
                if (isSpeaking) {
                  speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else {
                  const lastBotMsg = messages.slice().reverse().find((m) => m.sender === "bot");
                  if (lastBotMsg) speak(lastBotMsg.text);
                }
              }}
              style={styles.audioButton}
            >
              {isSpeaking ? "🔇 Stop Voice" : "🔊 Play Again"}
            </button>

            <button
              onClick={() => setIsMuted((prev) => !prev)}
              style={styles.audioButton}
            >
              {isMuted ? "🔕 Unmute" : "🔔 Mute"}
            </button>
          </div>

          <div style={styles.suggestionContainer}>
            <h3>💭 Suggested Questions</h3>
            <div style={styles.suggestionList}>
              {preQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={styles.suggestionButton}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.chatBox}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" ? "#DCF8C6" : "#E6E6E6",
                }}
              >
                <strong>{msg.sender === "user" ? username : "Krishna"}:</strong> {msg.text}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🎶 Basuri audio */}
      <audio ref={musicRef} loop>
        <source src={basuri} type="audio/mpeg" />
      </audio>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 20,
    fontFamily: "sans-serif",
    border: "1px solid #ccc",
    borderRadius: 10,
  },
  suggestionContainer: {
    marginBottom: 20,
  },
  suggestionList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionButton: {
    padding: "8px 12px",
    backgroundColor: "#f0e6ff",
    border: "1px solid #ccc",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 14,
  },
  audioControls: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 10,
  },
  audioButton: {
    padding: "6px 12px",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
    cursor: "pointer",
    background: "#f8f8f8",
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    height: 300,
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  message: {
    padding: 10,
    margin: "5px 0",
    borderRadius: 10,
    maxWidth: "80%",
  },
  input: {
    display: "block",
    width: "100%",
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    cursor: "pointer",
    width: "100%",
  },
};

export default ChatBot;