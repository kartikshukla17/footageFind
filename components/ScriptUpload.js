"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";

const ScriptUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [media, setMedia] = useState([]); 
  const [message, setMessage] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/json": [".json"] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setMessage("");
      setKeywords([]);
      setMedia([]);
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
      setKeywords(response.data.keywords || []);
      setMedia(response.data.media || []); 

    } catch (error) {
      console.log(error)
      setMessage("Upload failed. Try again.");
      setKeywords([]);
      setMedia([]);
    }

    setUploading(false);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg text-center">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-6 cursor-pointer"
      >
        <input {...getInputProps()} />
        {file ? (
          <p className="text-green-600">{file.name}</p>
        ) : (
          <p>Drag & drop your JSON file here or click to upload</p>
        )}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Script"}
      </button>
      
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}

      {keywords.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Extracted Keywords:</h2>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="bg-green-200 px-2 py-1 rounded-md">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {media.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Media Results:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {media.map((item, index) => (
              <div key={index} className="relative group">
                {item.url.endsWith(".mp4") || item.url.endsWith(".mov") ? ( // Check if it's a video
                  <video
                    controls
                    className="w-full h-48 object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                    src={item.url} type="video/mp4" 
                  >
                    {/* <source src={item.url} type="video/mp4" /> */}
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={item.url}
                    alt={item.photographer || "Media"}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                    unoptimized // Optional: Remove if images are not loading
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.source === "Pexels" ? `By ${item.photographer} (${item.source})` : item.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptUpload;