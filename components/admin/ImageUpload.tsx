"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  aspectRatio?: "square" | "landscape" | "portrait";
}

export default function ImageUpload({
  value,
  onChange,
  folder = "evol-admin",
  label = "Image",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const aspectRatioClass = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get upload signature from backend
      const signatureResponse = await fetch("/api/admin/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok) {
        throw new Error(signatureData.error || "Failed to get upload signature");
      }

      // Upload directly to Cloudinary with progress tracking
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signatureData.signature);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("api_key", signatureData.apiKey);
      formData.append("folder", signatureData.folder);

      // Use XMLHttpRequest for upload progress
      const uploadData = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`
        );
        xhr.send(formData);
      });

      onChange(uploadData.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      <label className="block font-sans text-sm text-evol-dark-grey mb-2">
        {label}
      </label>
      {value ? (
        <div className={`relative ${aspectRatioClass} w-full max-w-xs bg-evol-light-grey border border-evol-grey`}>
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-evol-red text-white rounded-full hover:bg-evol-dark-grey transition-colors"
          >
            <X className="w-4 h-4 shrink-0" />
          </button>
        </div>
      ) : (
        <label className={`relative ${aspectRatioClass} w-full max-w-xs bg-evol-light-grey border-2 border-dashed border-evol-grey flex flex-col items-center justify-center cursor-pointer hover:border-evol-red transition-colors`}>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-2">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#EEEEEE"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#9F0B10"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - uploadProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-sans font-bold text-evol-dark-grey">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-evol-metallic">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-evol-metallic" />
              <p className="text-sm text-evol-metallic">Click to upload</p>
              <p className="text-xs text-evol-metallic mt-1">JPG, PNG, WEBP</p>
            </>
          )}
        </label>
      )}
    </div>
  );
}
