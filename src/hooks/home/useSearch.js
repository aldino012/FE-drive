// src/hooks/home/useSearch.js
import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "../../api/axios";

/**
 * useSearch - Hook untuk mengelola pencarian file/folder dengan debounce
 *
 * Fitur:
 * - Debounce otomatis untuk menghindari terlalu banyak request
 * - Handle loading state
 * - Handle error state
 * - Clear search
 * - Customizable debounce delay
 *
 * @param {number} debounceDelay - Delay debounce dalam milliseconds (default: 500ms)
 * @returns {Object} State dan actions untuk search
 */
const useSearch = (debounceDelay = 500) => {
  // State untuk search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Ref untuk debounce timer
  const debounceTimerRef = useRef(null);

  /**
   * Execute search ke backend
   */
  const executeSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const response = await apiClient.get("/api/search", {
        params: {
          query: query.trim(),
        },
      });

      const data = response.data;

      if (data.success) {
        setSearchResults(data.data.results || []);
      } else {
        throw new Error(data.message || "Gagal melakukan pencarian");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat mencari";
      setSearchError(errorMessage);
      setSearchResults([]);
      console.error("Error searching:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Debounced search - akan dipanggil setiap kali searchQuery berubah
   */
  useEffect(() => {
    // Clear timer sebelumnya
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set timer baru
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(searchQuery);
    }, debounceDelay);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debounceDelay, executeSearch]);

  /**
   * Update search query (dipanggil dari onChange input)
   * @param {string|Event} value - Nilai query atau event dari input
   */
  const updateSearchQuery = useCallback((value) => {
    const queryValue =
      typeof value === "string" ? value : value?.target?.value || "";
    setSearchQuery(queryValue);
  }, []);

  /**
   * Clear search dan reset semua state
   */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setHasSearched(false);

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Force search sekarang juga (tanpa menunggu debounce)
   */
  const forceSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeSearch(searchQuery);
  }, [searchQuery, executeSearch]);

  return {
    // State
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    hasSearched,

    // Actions
    updateSearchQuery,
    clearSearch,
    forceSearch,
  };
};

export default useSearch;
