import { useState, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useUploadFile - Hook untuk mengelola upload file (single/multiple)
 *
 * Fitur:
 * - Batch upload (semua file dikirim sekaligus untuk progress bar yang akurat)
 * - Overall progress tracking (0-100%)
 * - Validation (size, type)
 * - Error handling per file
 * - Timeout dimatikan agar file besar tidak putus
 *
 * @param {Function} onSuccess - Callback setelah upload berhasil
 * @param {Object} options - Konfigurasi upload
 * @returns {Object} State dan actions untuk upload
 */
const useUploadFile = (onSuccess = null, options = {}) => {
  const {
    maxFileSize = Infinity, // PENTING: Diubah ke Infinity agar file berapapun ukurannya boleh masuk dari sisi FE
    allowedTypes = [], // Empty = allow all
    uploadPath = "/", // Default upload ke root
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Overall progress 0 sampai 100
  const [uploadErrors, setUploadErrors] = useState({});

  /**
   * Validate file sebelum upload
   */
  const validateFile = useCallback(
    (file) => {
      const errors = [];

      // Check file size
      if (maxFileSize !== Infinity && file.size > maxFileSize) {
        errors.push(
          `Ukuran file terlalu besar (max ${formatSize(maxFileSize)})`,
        );
      }

      // Check file type
      if (allowedTypes.length > 0) {
        const fileType = file.type || "";
        const extension = file.name.split(".").pop().toLowerCase();
        const isAllowed = allowedTypes.some((type) => {
          if (type.startsWith(".")) {
            return extension === type.substring(1).toLowerCase();
          }
          return fileType.startsWith(type);
        });

        if (!isAllowed) {
          errors.push(`Tipe file tidak diizinkan`);
        }
      }

      return errors;
    },
    [maxFileSize, allowedTypes],
  );

  /**
   * Upload files ke backend (Batch Upload)
   */
  const uploadFiles = useCallback(
    async (files, targetPath = uploadPath) => {
      if (!files || files.length === 0) {
        return { success: false, message: "Tidak ada file untuk diupload" };
      }

      setIsUploading(true);
      setProgress(0);
      setUploadErrors({});

      const results = {
        success: [],
        failed: [],
      };

      // 1. Validate semua files dulu di sisi frontend
      const validFiles = [];
      files.forEach((file) => {
        const errors = validateFile(file);
        if (errors.length > 0) {
          results.failed.push({ file: file.name, errors: errors });
          setUploadErrors((prev) => ({ ...prev, [file.name]: errors }));
        } else {
          validFiles.push(file);
        }
      });

      // Jika tidak ada file valid, return early
      if (validFiles.length === 0) {
        setIsUploading(false);
        return {
          success: false,
          message: "Tidak ada file yang valid",
          results,
        };
      }

      try {
        // 2. Prepare FormData untuk BATCH upload (semua file valid digabung)
        const formData = new FormData();
        validFiles.forEach((file) => {
          formData.append("files", file); // Key harus "files" sesuai multer.array('files')
        });
        // formData.append("uploadPath", targetPath); // Uncomment jika backend butuh

        // 3. Upload dengan progress tracking
        const response = await apiClient.post("/api/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 0, // SANGAT PENTING: Matikan timeout agar file besar (GB) tidak diputus oleh Axios
          onUploadProgress: (progressEvent) => {
            // Hitung persentase progress keseluruhan
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setProgress(percentCompleted);
            }
          },
        });

        // 4. Proses response dari backend (sesuaikan dengan format baru BE)
        if (response.data.data) {
          results.success = response.data.data.success || [];
          // Gabungkan file yang gagal validasi di FE dengan yang gagal diproses di BE
          results.failed = [
            ...results.failed,
            ...(response.data.data.failed || []),
          ];
        }

        // Call onSuccess callback jika ada file yang berhasil
        if (onSuccess && results.success.length > 0) {
          onSuccess(results);
        }

        return {
          success: results.success.length > 0,
          message: `${results.success.length} file berhasil, ${results.failed.length} file gagal`,
          results,
        };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Upload gagal total";

        console.error("❌ Upload Error:", error); // Log error agar tidak silent

        // Masukkan semua valid file ke failed karena request gagal di tengah jalan
        validFiles.forEach((file) => {
          results.failed.push({ file: file.name, errors: [errorMessage] });
        });

        return {
          success: false,
          message: errorMessage,
          results,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [uploadPath, validateFile, onSuccess],
  );

  /**
   * Clear upload state
   */
  const clearUpload = useCallback(() => {
    setProgress(0);
    setUploadErrors({});
  }, []);

  return {
    // State
    isUploading,
    progress, // <-- INI YANG AKAN DIPAKAI STATUSBANNERS (Angka 0-100)
    uploadErrors,

    // Actions
    uploadFiles,
    clearUpload,
    validateFile,
  };
};

// Helper function
const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default useUploadFile;