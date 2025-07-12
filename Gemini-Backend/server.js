const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Gemini + ElevenLabs API backend is running 🚀");
});

// 🎤 Predefined voice speaking
app.post("/speak", async (req, res) => {
  const { text, language } = req.body;

  const voiceMap = {
    english: "yco9hkSzXpAeaJXfPNpa",  // Sunny Singh (your existing ID)
    hindi: "yco9hkSzXpAeaJXfPNpa",  // 🔁 Replace with actual Hindi voice ID
    kannada: "yco9hkSzXpAeaJXfPNpa" // 🔁 Replace with actual Kannada voice ID
  };

  const voiceId = voiceMap[language?.toLowerCase()] || voiceMap.english;
  const elevenApiKey = process.env.ELEVENLABS_API_KEY;

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
        },
      },
      {
        headers: {
          "xi-api-key": elevenApiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": response.data.length,
    });

    res.send(response.data);
  } catch (error) {
    console.error("🔴 ElevenLabs TTS Error:", error.message);
    res.status(500).json({ error: "Failed to convert text to speech." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("API Key:", process.env.ELEVENLABS_API_KEY);

