import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import basuri from "../assets/basuri.mp3";
import predefinedAnswers from "../data/predefinedAnswers";

const Krishna = () => {
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const musicRef = useRef(null);
  const preQuestions = Object.keys(predefinedAnswers);

  const speak = async (text, answerToShow) => {
    if (isMuted) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/speak",
        { text, language },
        { responseType: "blob" }
      );

      const audioUrl = URL.createObjectURL(res.data);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);

      audio.onplay = () => {
        setMessages((prev) => [...prev, { sender: "bot", text: answerToShow }]);
      };

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

      audio.play().catch((err) => {
        console.warn("Audio play interrupted", err);
      });
    } catch (err) {
      console.error("🎤 ElevenLabs playback error:", err.message);
    }
  };

  const sendMessage = async (question) => {
    const answer = predefinedAnswers[question]?.[language]?.replace("[name]", username);
    if (!answer) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    speak(answer, answer);
  };

  const filteredQuestions = preQuestions.filter((q) =>
    q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStart = () => {
    if (username.trim() && language) setSubmitted(true);
  };

  const handleSearch = () => {
    const matchedQuestion = Object.keys(predefinedAnswers).find((q) =>
      q.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchedQuestion) {
      sendMessage(matchedQuestion);
      setSearchTerm("");
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "🙏 Sorry, I couldn't find an answer related to your query.",
        },
      ]);
    }
  };

  const chatRef = useRef(null);

  return (
    <div className="min-h-screen w-screen bg-[#282a2c] overflow-y-auto flex items-center justify-center flex-col px-4">
      <h1 className="text-5xl font-bold text-center text-white mb-8">
        Talk with{" "}
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Krishna
        </span>
      </h1>

      <div className="max-w-xl w-full bg-[#1b1c1d] shadow-lg rounded-xl p-6" id="chat-container" ref={chatRef}>
        {!submitted ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-[#303030] text-white"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 rounded bg-[#303030] text-white"
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
            <button
              onClick={handleStart}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  if (isSpeaking) {
                    speechSynthesis.cancel();
                    setIsSpeaking(false);
                  } else {
                    const lastBotMsg = messages
                      .slice()
                      .reverse()
                      .find((m) => m.sender === "bot");
                    if (lastBotMsg) speak(lastBotMsg.text, lastBotMsg.text);
                  }
                }}
                className="text-sm bg-[#676767] px-3 py-1 rounded text-white"
              >
                {isSpeaking ? "Stop Voice" : "Play Again"}
              </button>

              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="text-sm bg-[#676767] px-3 py-1 rounded text-white"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
            </div>

            <div className="h-72 overflow-y-auto border p-3 rounded bg-[#303030] hide-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 px-3 py-2 rounded-lg flex gap-2 items-start text-white ${
                    msg.sender === "user"
                      ? "bg-[#1b1c1d] self-end ml-auto flex-row-reverse"
                      : "bg-[#1b1c1d] self-start"
                  } max-w-[75%] w-fit`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={
                        msg.sender === "user"
                          ? `https://api.dicebear.com/7.x/personas/svg?seed=${username}`
                          : "https://im.indiatimes.in/content/2022/Nov/315101838_528001238885898_8342592681661373176_n_636e1e2ad5b4e.jpg"
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <strong className="block text-sm text-gray-300 mb-1">
                      {msg.sender === "user" ? username : "Krishna"}
                    </strong>
                    <span className="text-sm whitespace-pre-wrap">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                placeholder="Type a keyword or question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-grow p-3 rounded-lg bg-[#303030] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Send
              </button>
            </div>
          </>
        )}

        <audio ref={musicRef} loop>
          <source src={basuri} type="audio/mpeg" />
        </audio>
      </div>
    </div>
  );
};

export default Krishna;
