const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// JSON extract
const extractScriptText = (jsonData) => {
  if (jsonData.response && Array.isArray(jsonData.response)) {
    return jsonData.response;
  }
  throw new Error("Invalid JSON format");
};

// Keyword Extract for each scene
const extractKeywordsForScenes = async (scenes) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a Creative Media Planner. Analyze each scene from the script and extract relevant keywords.

Script scenes:
${JSON.stringify(scenes, null, 2)}

For *each* scene, do the following:

1. Extract 5–8 crisp keywords from scene_phrase (locations, objects, actions, moods, lighting, time of day, etc.).  
2. Based on the scene_type, recommend:
   – **Media Type** (Image, Video, Icon, Animation)  
   – **Style/Composition** (e.g. "wide establishing shot at sunrise," "clean icon set, line‑art style," "3–5s looping product demo")  
   – **Stock Search Query** for Pexels (or similar) to fetch that asset.  

Output **as JSON**, with one entry per scene, using this exact structure:

[
  {
    "scene_order": 1,
    "scene_type": "intro",
    "scene_phrase": "Introduction example",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "mediaSuggestions": [
      {
        "type": "Video",
        "style": "Style description",
        "searchQuery": "search query string"
      },
      {
        "type": "Image", 
        "style": "Style description",
        "searchQuery": "search query string"
      }
    ]
  }
]

Return ONLY valid JSON without any other text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log("Raw Gemini Response:", text);

    // Extract the JSON part from the response and parse it
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Could not extract JSON from Gemini response");
    }
  } catch (error) {
    console.error("Error during keyword extraction:", error);
    throw new Error("Failed to extract keywords from Gemini");
  }
};

// Fetch photos from Pexels
const fetchFromPexels = async (searchQuery) => {
  try {
    const response = await axios.get(`https://api.pexels.com/v1/search`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: { query: searchQuery, per_page: 3 },
    });

    return response.data.photos.map((photo) => ({
      url: photo.src.medium,
      photographer: photo.photographer,
      source: "Pexels",
      type: "image"
    }));
  } catch (error) {
    console.error(`Error fetching from Pexels: ${searchQuery}`, error.message);
    return [];
  }
};

// Fetch videos from Pexels
const fetchVideosFromPexels = async (searchQuery) => {
  try {
    const response = await axios.get(`https://api.pexels.com/videos/search`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: { query: searchQuery, per_page: 3 },
    });

    return response.data.videos.map((video) => ({
      url: video.video_files[0].link,
      image: video.image,
      photographer: video.user.name,
      source: "Pexels",
      type: "video"
    }));
  } catch (error) {
    console.error(`Error fetching videos from Pexels: ${searchQuery}`, error.message);
    return [];
  }
};

// Fetch media for each scene
const fetchMediaForScenes = async (scenes) => {
  const scenesWithMedia = [];

  for (const scene of scenes) {
    const sceneMedia = [];
    
    // Process each media suggestion
    for (const suggestion of scene.mediaSuggestions) {
      if (suggestion.type.toLowerCase() === "video") {
        const videos = await fetchVideosFromPexels(suggestion.searchQuery);
        sceneMedia.push(...videos);
      } else if (suggestion.type.toLowerCase() === "image") {
        const images = await fetchFromPexels(suggestion.searchQuery);
        sceneMedia.push(...images);
      }
    }
    
    scenesWithMedia.push({
      ...scene,
      media: sceneMedia
    });
  }

  return scenesWithMedia;
};

export async function POST(request) {
  const fileData = await request.formData();
  const data = fileData.get('script');
  
  if (!data) return new Response(JSON.stringify({ 
    message: "No file uploaded",
  }), {status: 500});
  
  let fileDataU8 = [];
  const reader = data.stream().getReader();
  
  while(true) {
    const {done, value} = await reader.read();
    if(done) break;
    fileDataU8.push(...value);
  }
  
  const textData = Buffer.from(fileDataU8).toString();
      
  try {
    const jsonData = JSON.parse(textData);
    const scenes = extractScriptText(jsonData);
    const scenesWithKeywords = await extractKeywordsForScenes(scenes);
    const scenesWithMedia = await fetchMediaForScenes(scenesWithKeywords);
        
    return new Response(JSON.stringify({ 
      message: "File uploaded successfully!", 
      scenes: scenesWithMedia
    }));

  } catch (error) {
    console.error("Processing Error:", error.message);
    return new Response(JSON.stringify({ 
      message: "Error extracting keywords or fetching media: " + error.message,
    }), {status: 500});
  }
}