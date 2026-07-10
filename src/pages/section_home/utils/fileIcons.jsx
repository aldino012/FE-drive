import React from "react";
import {
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";

export const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const iconClass = "w-8 h-8";

  switch (ext) {
    case "pdf":
      return <FaFilePdf className={`${iconClass} text-red-500`} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return <FaFileImage className={`${iconClass} text-green-500`} />;
    case "mp4":
    case "avi":
    case "mkv":
    case "mov":
    case "webm":
      return <FaFileVideo className={`${iconClass} text-purple-500`} />;
    case "mp3":
    case "wav":
    case "flac":
    case "ogg":
      return <FaFileAudio className={`${iconClass} text-yellow-500`} />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <FaFileArchive className={`${iconClass} text-orange-500`} />;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "py":
    case "java":
    case "json":
      return <FaFileCode className={`${iconClass} text-blue-500`} />;
    case "doc":
    case "docx":
    case "txt":
    case "md":
    case "rtf":
      return <FaFileAlt className={`${iconClass} text-blue-600`} />;
    default:
      return <FaFile className={`${iconClass} text-gray-500`} />;
  }
};
