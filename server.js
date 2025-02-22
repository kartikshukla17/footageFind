const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract text from JSON
const extractScriptText = (jsonData) => {
  if (jsonData.response && Array.isArray(jsonData.response)) {
    return jsonData.response.map((scene) => scene.scene_phrase).join(" ");
  }
  throw new Error("Invalid JSON format");
};

// Enhanced Keyword Extraction
const extractKeywords = async (scriptText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Extract a flat, well-organized list of relevant keywords from the following text for API calls.
  Provide a plain, comma-separated list of keywords related to locations, actions, objects, moods, and time/weather.
  Avoid adding any labels or categories—just the keywords. Here is the text: ${scriptText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log("Raw Gemini Response:", text);

    // Extract keywords from the plain text response as an array
    return text
      .replace(/\n|\r/g, "")
      .replace(/[^a-zA-Z0-9, ]/g, "")
      .split(",")
      .map((kw) => kw.trim())
      .filter((kw) => kw);
  } catch (error) {
    console.error("Error during keyword extraction:", error);
    throw new Error("Failed to extract keywords from Gemini");
  }
};

// 🌟 Pexels API Call
const fetchFromPexels = async (keyword) => {
  try {
    const response = await axios.get(`https://api.pexels.com/v1/search`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: { query: keyword, per_page: 5 },
    });

    console.log(`Pexels API Response for ${keyword}:`, response.data);

    return response.data.photos.map((photo) => ({
      url: photo.src.medium,
      photographer: photo.photographer,
      source: "Pexels",
    }));
  } catch (error) {
    console.error(`Error fetching from Pexels: ${keyword}`, error.message);
    return [];
  }
};

// 🌟 Pexels Video API Call
const fetchVideosFromPexels = async (keyword) => {
  try {
    const response = await axios.get(`https://api.pexels.com/videos/search`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: { query: keyword, per_page: 5 }, // Fetch 5 videos per keyword
    });

    console.log(`Pexels Video API Response for ${keyword}:`, response.data);

    return response.data.videos.map((video) => ({
      url: video.video_files[0].link, // Use the first video file link
      image: video.image, // Thumbnail image for the video
      photographer: video.user.name,
      source: "Pexels",
    }));
  } catch (error) {
    console.error(`Error fetching videos from Pexels: ${keyword}`, error.message);
    return [];
  }
};

// 🌟 Media Fetching for All Keywords (Photos + Videos)
const fetchMediaForKeywords = async (keywords) => {
  const mediaResults = [];

  for (const keyword of keywords) {
    // Fetch photos for the keyword
    const pexelsPhotos = await fetchFromPexels(keyword);
    mediaResults.push(...pexelsPhotos);

    // Fetch videos for the keyword
    const pexelsVideos = await fetchVideosFromPexels(keyword);
    mediaResults.push(...pexelsVideos);
  }

  return mediaResults;
};

// File upload and processing route
app.post("/upload", upload.single("script"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = req.file.path;

  fs.readFile(filePath, "utf8", async (err, data) => {
    if (err) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ message: "Error reading file" });
    }

    try {
      const jsonData = JSON.parse(data);
      const scriptText = extractScriptText(jsonData);
      const keywords = await extractKeywords(scriptText);

      // Fetch media (photos + videos) using the extracted keywords
      const mediaResults = await fetchMediaForKeywords(keywords);

      res.json({ 
        message: "File uploaded successfully!", 
        keywords, 
        media: mediaResults 
      });

    } catch (error) {
      console.error("Processing Error:", error.message);
      res.status(500).json({ message: "Error extracting keywords or fetching media" });
    } finally {
      fs.unlinkSync(filePath);
    }
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));