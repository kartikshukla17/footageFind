"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";

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
      console.log(error);
      setMessage("Upload failed. Try again.");
      setKeywords([]);
      setMedia([]);
    }

    setUploading(false);
  };

  return (
    <motion.div 
      className="p-8 bg-white shadow-2xl rounded-2xl max-w-xl mx-auto mt-10 border border-gray-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
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

      {keywords.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Extracted Keywords:</h2>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-md shadow-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {media.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">Media Results:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {media.map((item, index) => (
              <div key={index} className="relative group">
                {item.url.endsWith(".mp4") || item.url.endsWith(".mov") ? (
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
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.source === "Pexels" ? `By ${item.photographer} (${item.source})` : item.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ScriptUpload;