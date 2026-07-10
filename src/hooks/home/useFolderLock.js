// src/hooks/home/useFolderLock.js
import { useState, useEffect, useCallback } from "react";
import {
  getAllLockedFolders,
  lockFolder as apiLockFolder,
  unlockFolder as apiUnlockFolder,
  changeLockPassword as apiChangeLockPassword,
  checkFolderLock,
} from "../../api/lockApi";

/**
 * useFolderLock - Hook untuk mengelola status lock folder
 *
 * Fitur:
 * - Auto-load daftar folder yang di-lock saat mount
 * - Fungsi lock/unlock/change password
 * - Cek status lock sebuah folder
 * - Refresh daftar folder terkunci
 *
 * @returns {Object} State dan actions untuk folder lock
 */
const useFolderLock = () => {
  // State: Set path folder yang di-lock (untuk quick lookup)
  const [lockedFolders, setLockedFolders] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load semua folder yang di-lock dari server
   */
  const refreshLockedFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const folders = await getAllLockedFolders();
      const folderPaths = new Set(folders.map((f) => f.path));
      setLockedFolders(folderPaths);
    } catch (err) {
      console.error("Gagal memuat daftar folder terkunci:", err);
      setError("Gagal memuat status folder terkunci");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saat pertama kali mount
  useEffect(() => {
    refreshLockedFolders();
  }, [refreshLockedFolders]);

  /**
   * Cek apakah sebuah folder di-lock
   * @param {string} folderPath - Path folder
   * @returns {boolean} True jika folder di-lock
   */
  const isFolderLocked = useCallback(
    (folderPath) => {
      return lockedFolders.has(folderPath);
    },
    [lockedFolders],
  );

  /**
   * Cek apakah sebuah path berada di dalam folder yang di-lock
   * (Untuk proteksi child folder/file)
   * @param {string} itemPath - Path item yang akan dicek
   * @returns {boolean} True jika berada di dalam folder terkunci
   */
  const isInsideLockedFolder = useCallback(
    (itemPath) => {
      if (!itemPath) return false;

      // Cek setiap parent folder
      const parts = itemPath.split("/").filter(Boolean);
      let currentPath = "";

      for (const part of parts) {
        currentPath += "/" + part;
        if (lockedFolders.has(currentPath)) {
          return true;
        }
      }

      return false;
    },
    [lockedFolders],
  );

  /**
   * Lock sebuah folder
   * @param {string} folderPath - Path folder
   * @param {string} password - Password
   * @returns {Promise<Object>} Result object
   */
  const lockFolder = useCallback(async (folderPath, password) => {
    try {
      const result = await apiLockFolder(folderPath, password);

      if (result.success) {
        // Tambahkan ke set lokal
        setLockedFolders((prev) => new Set([...prev, folderPath]));
      }

      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Gagal mengunci folder";
      return { success: false, message: errorMessage };
    }
  }, []);

  /**
   * Unlock sebuah folder
   * @param {string} folderPath - Path folder
   * @param {string} password - Password (atau Master Password)
   * @returns {Promise<Object>} Result object
   */
  const unlockFolder = useCallback(async (folderPath, password) => {
    try {
      const result = await apiUnlockFolder(folderPath, password);

      if (result.success) {
        // Hapus dari set lokal
        setLockedFolders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(folderPath);
          return newSet;
        });
      }

      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Gagal membuka kunci folder";
      return { success: false, message: errorMessage };
    }
  }, []);

  /**
   * Ubah password folder yang sudah di-lock
   * @param {string} folderPath - Path folder
   * @param {string} oldPassword - Password lama (atau Master Password)
   * @param {string} newPassword - Password baru
   * @returns {Promise<Object>} Result object
   */
  const changePassword = useCallback(
    async (folderPath, oldPassword, newPassword) => {
      try {
        const result = await apiChangeLockPassword(
          folderPath,
          oldPassword,
          newPassword,
        );
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal mengubah password";
        return { success: false, message: errorMessage };
      }
    },
    [],
  );

  /**
   * Cek status lock sebuah folder dari server (force refresh)
   * @param {string} folderPath - Path folder
   * @returns {Promise<boolean>} True jika folder di-lock
   */
  const checkLockStatus = useCallback(async (folderPath) => {
    try {
      const isLocked = await checkFolderLock(folderPath);

      // Update set lokal
      setLockedFolders((prev) => {
        const newSet = new Set(prev);
        if (isLocked) {
          newSet.add(folderPath);
        } else {
          newSet.delete(folderPath);
        }
        return newSet;
      });

      return isLocked;
    } catch (err) {
      console.error("Gagal mengecek status lock:", err);
      return false;
    }
  }, []);

  return {
    // State
    lockedFolders,
    isLoading,
    error,

    // Actions
    isFolderLocked,
    isInsideLockedFolder,
    lockFolder,
    unlockFolder,
    changePassword,
    checkLockStatus,
    refreshLockedFolders,
  };
};

export default useFolderLock;
