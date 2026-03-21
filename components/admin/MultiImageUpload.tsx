"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, GripVertical } from "lucide-react";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
}

export default function MultiImageUpload({
  value,
  onChange,
  folder = "evol-products",
  label = "Images",
  maxImages = 6,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

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

        // Upload directly to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signatureData.signature);
        formData.append("timestamp", signatureData.timestamp);
        formData.append("api_key", signatureData.apiKey);
        formData.append("folder", signatureData.folder);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const uploadData = await uploadResponse.json();

        if (uploadData.secure_url) {
          uploadedUrls.push(uploadData.secure_url);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }

      setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
    }

    if (uploadedUrls.length > 0) {
      onChange([...value, ...uploadedUrls]);
    }

    setIsUploading(false);
    setUploadProgress(0);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newUrls = [...value];
    const draggedUrl = newUrls[draggedIndex];
    newUrls.splice(draggedIndex, 1);
    newUrls.splice(index, 0, draggedUrl);
    onChange(newUrls);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      <label className="block font-sans text-sm text-evol-dark-grey mb-2">
        {label} ({value.length}/{maxImages})
      </label>

      <div className="grid grid-cols-3 gap-3">
        {/* Existing Images */}
        {value.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square bg-evol-light-grey border border-evol-grey group cursor-move ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            <Image
              src={url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute top-1 left-1 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-evol-metallic" />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-evol-red text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-evol-dark-grey"
            >
              <X className="w-3 h-3 shrink-0" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-evol-red text-white text-xs font-sans">
                Main
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {value.length < maxImages && (
          <label className="relative aspect-square bg-evol-light-grey border-2 border-dashed border-evol-grey flex flex-col items-center justify-center cursor-pointer hover:border-evol-red transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-6 h-6 text-evol-red animate-spin mb-1" />
                <span className="text-xs text-evol-metallic">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 mb-1 text-evol-metallic" />
                <p className="text-xs text-evol-metallic">Add</p>
              </>
            )}
          </label>
        )}
      </div>

      <p className="mt-2 text-xs text-evol-metallic">
        Drag to reorder. First image is the main product image.
      </p>
    </div>
  );
}
