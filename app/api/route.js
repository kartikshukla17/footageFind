
const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// JSON extract
const extractScriptText = (jsonData) => {
  if (jsonData.response && Array.isArray(jsonData.response)) {
    return jsonData.response.map((scene) => scene.scene_phrase).join(" ");
  }
  throw new Error("Invalid JSON format");
};

// Keyword Extract
const extractKeywords = async (scriptText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Extract a flat, well-organized list of relevant keywords from the following text for API calls.
  Provide a plain, comma-separated list of keywords related to locations, actions, objects, moods, and time/weather.
  Avoid adding any labels or categories—just the keywords. Here is the text: ${scriptText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log("Raw Gemini Response:", text);

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

// for Photos
const fetchFromPexels = async (keyword) => {
  try {
    const response = await axios.get(`https://api.pexels.com/v1/search`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: { query: keyword, per_page: 5 },
    });

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

// for videos
const fetchVideosFromPexels = async (keyword) => {
  try {
    const response = await axios.get(`https://api.pexels.com/videos/search`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: { query: keyword, per_page: 5 },
    });

    return response.data.videos.map((video) => ({
      url: video.video_files[0].link,
      image: video.image,
      photographer: video.user.name,
      source: "Pexels",
    }));
  } catch (error) {
    console.error(`Error fetching videos from Pexels: ${keyword}`, error.message);
    return [];
  }
};

// to show the fetched
const fetchMediaForKeywords = async (keywords) => {
  const mediaResults = [];

  for (const keyword of keywords) {
    const pexelsPhotos = await fetchFromPexels(keyword);
    mediaResults.push(...pexelsPhotos);

    const pexelsVideos = await fetchVideosFromPexels(keyword);
    mediaResults.push(...pexelsVideos);
  }

  return mediaResults;
};

export async function POST(request){
    const fileData=await request.formData();
    const data=fileData.get('script');
   if (!data) return new Response(JSON.stringify({ 
    message: "No file uploaded",
  }),{status:500});
    let fileDataU8=[];
     const reader =data.stream().getReader();
    while(true){
        const {done ,value}=await reader.read();
        if(done) break;
        fileDataU8.push(...value);
    }
        const textData = Buffer.from(fileDataU8).toString();
        
       try {
         const jsonData = JSON.parse(textData);
         const scriptText = extractScriptText(jsonData);
         const keywords = await extractKeywords(scriptText);
   
         const mediaResults = await fetchMediaForKeywords(keywords);
            
         return new Response(JSON.stringify({ 
           message: "File uploaded successfully!", 
           keywords, 
           media: mediaResults 
         }));
   
       } catch (error) {
         console.error("Processing Error:", error.message);
         return new Response(JSON.stringify({ 
            message: "Error extracting keywords or fetching media",
          }),{status:500});
       }
     
}