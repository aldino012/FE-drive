// src/hooks/home/useFileActions.js
import { useState, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useFileActions - Hook universal untuk semua aksi file/folder
 */
const useFileActions = (onSuccess = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Helper: Execute API call dengan error handling
   */
  const executeAction = useCallback(
    async (actionName, apiCall) => {
      setIsLoading(true);
      setLoadingAction(actionName);
      setError(null);

      try {
        const response = await apiCall();

        if (response.data?.success) {
          if (onSuccess) onSuccess({ action: actionName, data: response.data });
          return { success: true, data: response.data };
        } else {
          throw new Error(
            response.data?.message || `Gagal melakukan ${actionName}`,
          );
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          `Gagal melakukan ${actionName}`;
        setError(errorMessage);
        console.error(`Error ${actionName}:`, errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [onSuccess],
  );

  /**
   * RENAME: Mengubah nama file atau folder
   */
  const renameItem = useCallback(
    async (item, newName) => {
      if (!newName || newName.trim() === "") {
        return { success: false, error: "Nama tidak boleh kosong" };
      }

      if (newName.trim() === item.name) {
        return { success: true, skipped: true };
      }

      const pathParts = item.path.split("/");
      pathParts[pathParts.length - 1] = newName.trim();
      const newPath = pathParts.join("/");

      const endpoint =
        item.type === "folder" ? "/api/folders/rename" : "/api/files/rename";

      return executeAction("rename", () =>
        apiClient.put(endpoint, {
          oldPath: item.path,
          newPath: newPath,
        }),
      );
    },
    [executeAction],
  );

  /**
   * MOVE: Memindahkan file/folder ke folder tujuan
   */
  const moveItem = useCallback(
    async (item, targetDirectory) => {
      if (!targetDirectory) {
        return { success: false, error: "Folder tujuan tidak valid" };
      }

      const currentDir =
        item.path.substring(0, item.path.lastIndexOf("/")) || "/";
      if (currentDir === targetDirectory) {
        return {
          success: true,
          skipped: true,
          message: "Item sudah ada di folder tujuan",
        };
      }

      const endpoint =
        item.type === "folder" ? "/api/folders/move" : "/api/files/move";

      return executeAction("move", () =>
        apiClient.put(endpoint, {
          sourcePath: item.path,
          targetDirectory: targetDirectory,
        }),
      );
    },
    [executeAction],
  );

  /**
   * DELETE: Menghapus file/folder (pindah ke trash)
   */
  const deleteItem = useCallback(
    async (item) => {
      const endpoint =
        item.type === "folder" ? "/api/folders/delete" : "/api/files/delete";
      const bodyKey = item.type === "folder" ? "folderPath" : "filePath";

      return executeAction("delete", () =>
        apiClient.delete(endpoint, {
          data: { [bodyKey]: item.path },
        }),
      );
    },
    [executeAction],
  );

  /**
   * DOWNLOAD: Download file atau folder
   * FIX: Gunakan direct link download tanpa axios untuk preserve binary data
   */
  const downloadItem = useCallback(
    async (item) => {
      setIsLoading(true);
      setLoadingAction("download");
      setError(null);

      try {
        let url;
        if (item.type === "folder") {
          url = `/api/folders/download?path=${encodeURIComponent(item.path)}`;
        } else {
          url = `/api/files/download?path=${encodeURIComponent(item.path)}`;
        }

        // SOLUTION 1: Direct download via anchor tag (PALING RELIABLE)
        // Ini bypass axios dan biarkan browser handle download langsung
        const baseUrl = apiClient.defaults.baseURL || "";
        const fullUrl = `${baseUrl}${url}`;

        const link = document.createElement("a");
        link.href = fullUrl;
        link.download = item.name + (item.type === "folder" ? ".zip" : "");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (onSuccess) onSuccess({ action: "download", data: { item } });
        return { success: true };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Gagal mengunduh file";
        setError(errorMessage);
        console.error("Error download:", errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [onSuccess],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    loadingAction,
    error,
    renameItem,
    moveItem,
    deleteItem,
    downloadItem,
    clearError,
  };
};

export default useFileActions;
