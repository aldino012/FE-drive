// src/hooks/home/useDriveData.js
import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useDriveData - Hook untuk mengelola data file/folder di halaman utama
 * Adaptasi untuk format response backend: { folders: string[], files: string[] }
 */
const useDriveData = (initialPath = "/") => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Client-side pagination (karena backend belum support pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  /**
   * Transform data backend ke format yang dibutuhkan UI
   */
  const transformData = useCallback((folders, files, basePath) => {
    const folderItems = folders.map((name, index) => ({
      id: `folder-${index}-${name}`,
      name: name,
      type: "folder",
      path: basePath === "/" ? `/${name}` : `${basePath}/${name}`,
    }));

    const fileItems = files.map((name, index) => ({
      id: `file-${index}-${name}`,
      name: name,
      type: "file",
      path: basePath === "/" ? `/${name}` : `${basePath}/${name}`,
    }));

    // Sort: folders dulu, lalu files, keduanya alphabetically
    return [
      ...folderItems.sort((a, b) => a.name.localeCompare(b.name)),
      ...fileItems.sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, []);

  /**
   * Fetch data dari backend
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/api/files", {
        params: { path: currentPath },
      });

      const data = response.data;

      if (data.success) {
        const transformedItems = transformData(
          data.folders || [],
          data.files || [],
          data.currentPath || currentPath,
        );
        setItems(transformedItems);
        setCurrentPage(1); // Reset ke halaman 1 setiap fetch
      } else {
        throw new Error(data.message || "Gagal memuat data");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      console.error("Error fetching drive data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, transformData]);

  /**
   * Auto fetch ketika currentPath berubah
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Navigate ke folder tertentu
   */
  const navigateToFolder = useCallback((folderPath) => {
    setCurrentPath(folderPath);
  }, []);

  /**
   * Navigate ke parent folder
   */
  const navigateToParent = useCallback(() => {
    if (currentPath === "/") return;
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    navigateToFolder(parentPath);
  }, [currentPath, navigateToFolder]);

  /**
   * Client-side pagination: hitung total pages
   */
  const totalPages = Math.ceil(items.length / itemsPerPage);

  /**
   * Get items untuk halaman saat ini
   */
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /**
   * Change page
   */
  const changePage = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Generate breadcrumb items
   */
  const generateBreadcrumbs = useCallback(() => {
    const breadcrumbs = [{ label: "My Drive", path: "/" }];

    if (currentPath === "/") return breadcrumbs;

    const pathParts = currentPath.split("/").filter(Boolean);
    let currentFullPath = "";

    pathParts.forEach((part) => {
      currentFullPath += `/${part}`;
      breadcrumbs.push({
        label: part,
        path: currentFullPath,
      });
    });

    return breadcrumbs;
  }, [currentPath]);

  return {
    // State
    currentPath,
    currentPage,
    items: paginatedItems, // Sudah di-paginate
    totalItems: items.length,
    totalPages,
    isLoading,
    error,

    // Actions
    navigateToFolder,
    navigateToParent,
    changePage,
    refresh,
    fetchData,

    // Utilities
    generateBreadcrumbs,
  };
};

export default useDriveData;
