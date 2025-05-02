"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";

const ScriptUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [message, setMessage] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/json": [".json"] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setMessage("");
      setScenes([]);
    },
  });

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("script", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await axios.post("/api", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
      setScenes(response.data.scenes || []);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed. Try again.");
      setScenes([]);
    }

    setUploading(false);
  };

  return (
    <div 
      className="p-8 bg-white shadow-2xl rounded-2xl max-w-4xl mx-auto mt-10 border border-gray-600"
    >
      <h1 className="text-2xl font-bold text-center mb-6">Script Media Generator</h1>
      
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-blue-400 p-6 cursor-pointer text-center rounded-lg hover:bg-blue-50 transition-all"
      >
        <input {...getInputProps()} />
        {file ? (
          <p className="text-green-600 font-medium">{file.name}</p>
        ) : (
          <p className="text-gray-600 font-medium">Drag & drop your JSON file here or click to upload</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload Script"}
      </button>

      {message && <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>}

      {scenes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scene Analysis Results:</h2>
          
          {scenes.map((scene, index) => (
            <div key={index} className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-800">
                    Scene {scene.scene_order}: {scene.scene_type}
                  </h3>
                  <p className="text-gray-700 my-2 text-lg italic">"{scene.scene_phrase}"</p>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-md font-semibold text-gray-700">Keywords:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {scene.keywords.map((keyword, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-md shadow-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700">Media Suggestions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {scene.mediaSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg shadow">
                      <div className="font-medium text-blue-700">{suggestion.type}</div>
                      <div className="text-sm text-gray-900 mt-1">{suggestion.style}</div>
                      <div className="text-sm font-mono bg-gray-600 p-2 mt-1 rounded">
                        {suggestion.searchQuery}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {scene.media && scene.media.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-md font-semibold text-gray-700">Found Media:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {scene.media.map((item, idx) => (
                      <div key={idx} className="relative group">
                        {item.type === "video" ? (
                          <video
                            controls
                            className="w-full h-48 object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                            src={item.url}
                          />
                        ) : (
                          <Image
                            src={item.url}
                            alt={item.photographer || "Media"}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                            unoptimized
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.photographer ? `By ${item.photographer}` : ''} ({item.source})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptUpload;