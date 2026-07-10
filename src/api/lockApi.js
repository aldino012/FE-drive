// src/api/lockApi.js
import apiClient from "./axios";

/**
 * Lock sebuah folder dengan password
 * @param {string} folderPath - Path folder (contoh: "/Documents")
 * @param {string} password - Password untuk unlock
 * @returns {Promise<Object>} Response dari server
 */
export const lockFolder = async (folderPath, password) => {
  try {
    const response = await apiClient.post("/api/locks", {
      path: folderPath,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ [lockApi] lockFolder error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Unlock sebuah folder dengan password
 * Support: Password biasa ATAU Master Password
 * @param {string} folderPath - Path folder
 * @param {string} password - Password untuk verifikasi
 * @returns {Promise<Object>} Response dari server
 */
export const unlockFolder = async (folderPath, password) => {
  try {
    const response = await apiClient.delete("/api/locks", {
      data: {
        path: folderPath,
        password,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ [lockApi] unlockFolder error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Ubah password folder yang sudah di-lock
 * Support: oldPassword bisa berupa password biasa ATAU Master Password
 * @param {string} folderPath - Path folder
 * @param {string} oldPassword - Password lama (atau Master Password)
 * @param {string} newPassword - Password baru
 * @returns {Promise<Object>} Response dari server
 */
export const changeLockPassword = async (
  folderPath,
  oldPassword,
  newPassword,
) => {
  try {
    const response = await apiClient.put("/api/locks/password", {
      path: folderPath,
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error(
      "❌ [lockApi] changeLockPassword error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Cek apakah sebuah folder di-lock
 * @param {string} folderPath - Path folder
 * @returns {Promise<boolean>} True jika folder di-lock
 */
export const checkFolderLock = async (folderPath) => {
  try {
    const response = await apiClient.get("/api/locks/check", {
      params: { path: folderPath },
    });
    return response.data?.data?.isLocked || false;
  } catch (error) {
    console.error(
      "❌ [lockApi] checkFolderLock error:",
      error.response?.data || error.message,
    );
    return false;
  }
};

/**
 * Dapatkan semua folder yang di-lock
 * @returns {Promise<Array>} Array object { path, createdAt, lockedBy }
 */
export const getAllLockedFolders = async () => {
  try {
    const response = await apiClient.get("/api/locks");
    return response.data?.data || [];
  } catch (error) {
    console.error(
      "❌ [lockApi] getAllLockedFolders error:",
      error.response?.data || error.message,
    );
    return [];
  }
};

/**
 * Verifikasi password folder (tanpa unlock)
 * Support: Password biasa ATAU Master Password
 * @param {string} folderPath - Path folder
 * @param {string} password - Password yang akan diverifikasi
 * @returns {Promise<boolean>} True jika password benar
 */
export const verifyLockPassword = async (folderPath, password) => {
  try {
    const response = await apiClient.post("/api/locks/verify", {
      path: folderPath,
      password,
    });
    return response.data?.success || false;
  } catch (error) {
    console.error(
      "❌ [lockApi] verifyLockPassword error:",
      error.response?.data || error.message,
    );
    return false;
  }
};
