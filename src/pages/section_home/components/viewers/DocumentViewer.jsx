// src/pages/section_home/components/viewers/DocumentViewer.jsx
import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaDownload,
  FaFileAlt,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getViewUrl, getFileTextContent } from "../../../../api/viewApi";

const DocumentViewer = ({ file, onClose }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileName = file.name || "document";
  const ext = fileName.split(".").pop().toLowerCase();

  // Dapatkan URL dasar dari viewApi
  const baseUrl = getViewUrl(file.path || file.name);

  // Untuk PDF, tambahkan parameter khusus agar PDF viewer browser aktif
  const fileUrl =
    ext === "pdf"
      ? `${baseUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`
      : baseUrl;

  // Daftar ekstensi yang bisa dibaca sebagai teks biasa
  const textExtensions = [
    "txt",
    "md",
    "json",
    "js",
    "jsx",
    "ts",
    "tsx",
    "html",
    "css",
    "xml",
    "csv",
    "log",
    "sh",
    "py",
    "java",
    "c",
    "cpp",
  ];

  const isPdf = ext === "pdf";
  const isText = textExtensions.includes(ext);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setContent("");

      try {
        if (isText) {
          const textData = await getFileTextContent(file.path || file.name);
          setContent(textData);
        }
      } catch (err) {
        console.error("Gagal memuat dokumen:", err);
        setError("Gagal memuat konten file. Silakan download untuk melihat.");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [file.path, file.name, isText]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDownload = () => {
    // Ganti endpoint /view? menjadi /download? untuk memaksa download
    const downloadUrl = baseUrl.replace("/view?", "/download?");
    window.open(downloadUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <FaFileAlt className="text-blue-400 text-xl flex-shrink-0" />
          <h2 className="text-lg font-semibold truncate" title={fileName}>
            {fileName}
          </h2>
          <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 uppercase">
            {ext}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-colors flex items-center gap-2 text-sm"
            title="Download File"
          >
            <FaDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors"
            title="Tutup (ESC)"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
            <FaSpinner className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p>Memuat dokumen...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-red-400 z-10 p-4 text-center">
            <FaExclamationTriangle className="w-16 h-16 mb-4" />
            <p className="text-lg mb-4">{error}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <FaDownload /> Download File
            </button>
          </div>
        )}

        {/* PDF Viewer - Menggunakan <object> tag yang lebih reliabel */}
        {isPdf && !isLoading && !error && (
          <object
            data={fileUrl}
            type="application/pdf"
            className="w-full h-full"
            aria-label={fileName}
          >
            {/* Fallback jika browser tidak bisa menampilkan PDF */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
              <FaFileAlt className="w-20 h-20 mb-4 text-red-500" />
              <p className="text-xl mb-2">PDF tidak dapat ditampilkan</p>
              <p className="text-gray-400 mb-6">
                Browser Anda mungkin tidak mendukung preview PDF inline.
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <FaDownload /> Download untuk Membuka
              </button>
            </div>
          </object>
        )}

        {/* Text Viewer */}
        {isText && !isLoading && !error && (
          <div className="w-full h-full overflow-auto bg-gray-50 text-gray-800 p-4 sm:p-8">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm sm:text-base leading-relaxed">
              {content || "File kosong."}
            </pre>
          </div>
        )}

        {/* Unsupported Format Fallback */}
        {!isPdf && !isText && !isLoading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-300 p-4 text-center">
            <FaFileAlt className="w-16 h-16 mb-4 text-gray-600" />
            <p className="text-lg mb-2">
              Preview tidak tersedia untuk format .{ext}
            </p>
            <p className="text-sm mb-6 text-gray-500">
              Silakan download file untuk membukanya di aplikasi eksternal.
            </p>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FaDownload /> Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
