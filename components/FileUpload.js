"use client";

import { useState } from "react";

const FileUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (files) => {
    setUploading(true);
    const uploadedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        // 파일 업로드 API 호출
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push({
            type: getFileType(file.name),
            url: result.url,
            alt: file.name,
            originalName: file.name,
            size: file.size,
          });
        }
      } catch (error) {
        console.error("업로드 실패:", error);
      }

      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);
    setUploadProgress(0);

    if (onUploadComplete) {
      onUploadComplete(uploadedFiles);
    }
  };

  const getFileType = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension))
      return "image";
    if (["mp4", "webm", "ogg", "mov"].includes(extension)) return "video";
    if (["mp3", "m4a", "wav", "ogg"].includes(extension)) return "audio";
    return "unknown";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  return (
    <div
      style={{
        border: "2px dashed rgba(232, 176, 89, 0.5)",
        borderRadius: "12px",
        padding: "40px",
        textAlign: "center",
        backgroundColor: "rgba(232, 176, 89, 0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput").click()}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(Array.from(e.target.files))}
      />

      {uploading ? (
        <div>
          <div
            style={{ color: "#E8B059", fontSize: "18px", marginBottom: "10px" }}
          >
            업로드 중... {Math.round(uploadProgress)}%
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                backgroundColor: "#E8B059",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📁</div>
          <div
            style={{ color: "#E8B059", fontSize: "18px", marginBottom: "10px" }}
          >
            파일을 여기에 드래그하거나 클릭하여 업로드
          </div>
          <div style={{ color: "#ccc", fontSize: "14px" }}>
            이미지, 비디오, 오디오 파일 지원
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
