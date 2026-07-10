// src/hooks/home/useUploadFolder.js
import { useState, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useUploadFolder - Hook untuk mengelola upload folder dengan struktur
 *
 * Fitur:
 * - Upload entire folder dengan struktur subfolder
 * - Preserve folder hierarchy
 * - Progress tracking
 * - Error handling per file
 * - Handle large folders
 *
 * @param {Function} onSuccess - Callback setelah upload berhasil
 * @param {Object} options - Konfigurasi upload
 * @returns {Object} State dan actions untuk upload
 */
const useUploadFolder = (onSuccess = null, options = {}) => {
  const {
    maxFileSize = 100 * 1024 * 1024, // 100MB default per file
    uploadPath = "/", // Default upload destination
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);

  /**
   * Extract files from folder input dengan struktur path
   */
  const extractFilesFromFolder = useCallback((files) => {
    const fileList = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // webkitRelativePath berisi path relatif dari folder root
      // Contoh: "Documents/Work/report.pdf"
      const relativePath = file.webkitRelativePath || file.name;

      fileList.push({
        file: file,
        relativePath: relativePath,
        name: file.name,
        size: file.size,
      });
    }

    return fileList;
  }, []);

  /**
   * Upload folder ke backend
   */
  const uploadFolder = useCallback(
    async (files, targetPath = uploadPath) => {
      if (!files || files.length === 0) {
        return { success: false, message: "Tidak ada file untuk diupload" };
      }

      setIsUploading(true);
      setUploadProgress({});
      setUploadErrors({});
      setUploadedCount(0);

      // Extract files dengan relative path
      const fileList = extractFilesFromFolder(files);
      setTotalFiles(fileList.length);

      const results = {
        success: [],
        failed: [],
        totalFiles: fileList.length,
      };

      // Upload files satu per satu
      for (let i = 0; i < fileList.length; i++) {
        const { file, relativePath } = fileList[i];

        try {
          // Update progress
          setUploadProgress((prev) => ({
            ...prev,
            [relativePath]: 0,
          }));

          // Prepare FormData dengan relative path
          const formData = new FormData();
          formData.append("files", file);
          formData.append("uploadPath", targetPath);
          formData.append("relativePath", relativePath); // Kirim relative path untuk preserve structure

          // Upload dengan progress tracking
          const response = await apiClient.post("/api/files/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress((prev) => ({
                ...prev,
                [relativePath]: percentCompleted,
              }));
            },
          });

          if (response.data.success) {
            results.success.push({
              file: relativePath,
              data: response.data.data,
            });
            setUploadedCount((prev) => prev + 1);
          } else {
            throw new Error(response.data.message || "Upload gagal");
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || "Upload gagal";
          results.failed.push({
            file: relativePath,
            errors: [errorMessage],
          });
          setUploadErrors((prev) => ({
            ...prev,
            [relativePath]: [errorMessage],
          }));
        }
      }

      setIsUploading(false);

      // Call onSuccess callback jika ada file yang berhasil
      if (results.success.length > 0 && onSuccess) {
        onSuccess(results);
      }

      return {
        success: results.success.length > 0,
        message: `${results.success.length}/${results.totalFiles} file berhasil diupload`,
        results,
      };
    },
    [uploadPath, extractFilesFromFolder, onSuccess],
  );

  /**
   * Get overall progress percentage
   */
  const getOverallProgress = useCallback(() => {
    if (totalFiles === 0) return 0;
    return Math.round((uploadedCount / totalFiles) * 100);
  }, [totalFiles, uploadedCount]);

  /**
   * Clear upload state
   */
  const clearUpload = useCallback(() => {
    setUploadProgress({});
    setUploadErrors({});
    setTotalFiles(0);
    setUploadedCount(0);
  }, []);

  return {
    // State
    isUploading,
    uploadProgress,
    uploadErrors,
    totalFiles,
    uploadedCount,

    // Actions
    uploadFolder,
    clearUpload,
    getOverallProgress,
  };
};

export default useUploadFolder;
