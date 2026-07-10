// src/hooks/trash/useTrashData.js
import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useTrashData - Hook untuk mengelola data item di trash
 *
 * Fitur:
 * - Fetch list trash items dari backend
 * - Handle loading & error states
 * - Auto refresh setelah action
 * - Format data untuk UI (tanggal, ukuran)
 * - Filter & search (client-side)
 *
 * @returns {Object} State dan actions untuk trash data
 */
const useTrashData = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'file' | 'folder'

  /**
   * Fetch trash items dari backend
   */
  const fetchTrashItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/api/trash");
      const data = response.data;

      if (data.success) {
        // Format data untuk UI
        const formattedItems = (data.data || []).map((item) => ({
          ...item,
          // Extract original name (remove timestamp prefix/suffix)
          originalName: item.trashName
            .replace(/^\d+_/, "")
            .replace(/_\d+$/, ""),
          // Format tanggal
          deletedAtFormatted: formatDate(item.deletedAt),
          // Format ukuran
          sizeFormatted: formatSize(item.size),
          // Type untuk filter
          type: item.isFolder ? "folder" : "file",
        }));

        setItems(formattedItems);
      } else {
        throw new Error(data.message || "Gagal memuat data trash");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat memuat data trash";
      setError(errorMessage);
      console.error("Error fetching trash items:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Auto fetch saat component mount
   */
  useEffect(() => {
    fetchTrashItems();
  }, [fetchTrashItems]);

  /**
   * Refresh data (manual trigger)
   */
  const refresh = useCallback(() => {
    fetchTrashItems();
  }, [fetchTrashItems]);

  /**
   * Filter items berdasarkan search query dan type
   */
  const filteredItems = items.filter((item) => {
    // Filter by type
    if (filterType !== "all" && item.type !== filterType) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return item.originalName.toLowerCase().includes(query);
    }

    return true;
  });

  /**
   * Get statistics
   */
  const stats = {
    total: items.length,
    files: items.filter((i) => i.type === "file").length,
    folders: items.filter((i) => i.type === "folder").length,
    totalSize: items.reduce((sum, i) => sum + i.size, 0),
    totalSizeFormatted: formatSize(items.reduce((sum, i) => sum + i.size, 0)),
  };

  /**
   * Update search query
   */
  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /**
   * Update filter type
   */
  const updateFilterType = useCallback((type) => {
    setFilterType(type);
  }, []);

  /**
   * Clear search and filter
   */
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterType("all");
  }, []);

  return {
    // State
    items: filteredItems,
    allItems: items,
    isLoading,
    error,
    searchQuery,
    filterType,
    stats,

    // Actions
    refresh,
    updateSearchQuery,
    updateFilterType,
    clearFilters,
  };
};

/**
 * Helper: Format tanggal ke format yang mudah dibaca
 */
const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Jika kurang dari 1 menit
  if (diffMins < 1) return "Baru saja";

  // Jika kurang dari 1 jam
  if (diffMins < 60) return `${diffMins} menit lalu`;

  // Jika kurang dari 24 jam
  if (diffHours < 24) return `${diffHours} jam lalu`;

  // Jika kurang dari 7 hari
  if (diffDays < 7) return `${diffDays} hari lalu`;

  // Format tanggal lengkap
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Helper: Format ukuran file
 */
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default useTrashData;
