// src/hooks/home/useStorage.js
import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useStorage - Hook untuk mengelola informasi penyimpanan drive
 * Dengan graceful fallback jika endpoint belum tersedia
 */
const useStorage = (refreshInterval = 60000) => {
  const [storageInfo, setStorageInfo] = useState({
    total: 500,
    used: 0,
    available: 500,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch storage info dari backend
   */
  const fetchStorageInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/api/storage");
      const data = response.data;

      if (data.success) {
        setStorageInfo({
          total: data.data.total || 500,
          used: data.data.used || 0,
          available: data.data.available || 500,
        });
      } else {
        throw new Error(data.message || "Gagal memuat informasi penyimpanan");
      }
    } catch (err) {
      // Jika endpoint belum ada (404), gunakan default value tanpa error
      if (err.response?.status === 404) {
        console.warn(
          "Endpoint /api/storage belum tersedia, menggunakan default values",
        );
        // Tetap gunakan default state yang sudah di-set
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat memuat info penyimpanan";
        setError(errorMessage);
        console.error("Error fetching storage info:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Auto refresh dengan interval
   */
  useEffect(() => {
    fetchStorageInfo();

    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchStorageInfo();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [fetchStorageInfo, refreshInterval]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    fetchStorageInfo();
  }, [fetchStorageInfo]);

  /**
   * Hitung persentase penyimpanan
   */
  const getStoragePercentage = useCallback(() => {
    if (storageInfo.total === 0) return 0;
    return (storageInfo.used / storageInfo.total) * 100;
  }, [storageInfo]);

  /**
   * Format ukuran file
   */
  const formatSize = useCallback((bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }, []);

  return {
    storageInfo,
    isLoading,
    error,
    refresh,
    getStoragePercentage,
    formatSize,
  };
};

export default useStorage;