// src/hooks/trash/useTrashActions.js
import { useState, useCallback } from "react";
import apiClient from "../../api/axios";

/**
 * useTrashActions - Hook untuk mengelola aksi pada trash items
 *
 * Fitur:
 * - Restore item ke folder tertentu
 * - Delete permanent 1 item
 * - Empty trash (kosongkan semua)
 * - Loading & error state per action
 * - Callback onSuccess untuk refresh data
 *
 * @param {Function} onSuccess - Callback setelah aksi berhasil (opsional)
 * @returns {Object} State dan actions
 */
const useTrashActions = (onSuccess = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // 'restore' | 'delete' | 'empty'
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
   * RESTORE: Mengembalikan item dari trash ke folder tertentu
   * @param {Object} item - { trashName: string, originalName: string }
   * @param {string} restoreDestination - Path folder tujuan (contoh: '/Documents')
   */
  const restoreItem = useCallback(
    async (item, restoreDestination) => {
      if (!restoreDestination || restoreDestination.trim() === "") {
        return { success: false, error: "Folder tujuan tidak boleh kosong" };
      }

      return executeAction("restore", () =>
        apiClient.post("/api/trash/restore", {
          trashName: item.trashName,
          restoreDestination: restoreDestination,
        }),
      );
    },
    [executeAction],
  );

  /**
   * DELETE PERMANENT: Menghapus 1 item secara permanen dari trash
   * @param {Object} item - { trashName: string }
   */
  const deletePermanent = useCallback(
    async (item) => {
      return executeAction("delete", () =>
        apiClient.delete("/api/trash/permanent", {
          data: { trashName: item.trashName },
        }),
      );
    },
    [executeAction],
  );

  /**
   * EMPTY TRASH: Mengosongkan SEMUA isi trash
   * Tidak perlu parameter
   */
  const emptyTrash = useCallback(async () => {
    return executeAction("empty", () => apiClient.delete("/api/trash/empty"));
  }, [executeAction]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    loadingAction, // 'restore' | 'delete' | 'empty' | null
    error,

    // Actions
    restoreItem,
    deletePermanent,
    emptyTrash,
    clearError,
  };
};

export default useTrashActions;