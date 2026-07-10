// src/api/axios.js
import axios from "axios";

// URL API Backend
// Prioritas: .env (VITE_API_URL) > Default fallback (IP static Pi)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://192.168.1.100:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // ⚠️ PENTING: 0 = TIDAK ADA BATAS WAKTU
  // Ini penting agar streaming video/audio besar tidak diputus paksa
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menangani error secara global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan log error 404 untuk endpoint yang memang belum ada
    if (error.response?.status === 404) {
      return Promise.reject(error);
    }

    // Log error dengan info yang lebih jelas
    if (error.code === "ECONNABORTED") {
      console.error("⏱️ API Timeout:", error.config?.url);
    } else if (error.code === "ERR_NETWORK") {
      console.error(
        "🌐 Network Error (backend tidak reachable):",
        API_BASE_URL,
      );
    } else {
      console.error("API Error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
