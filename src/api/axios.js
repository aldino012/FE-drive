// src/api/axios.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.8:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // ⚠️ PENTING: Ubah ke 0 (atau angka sangat besar seperti 600000 untuk 10 menit).
  // 0 berarti TIDAK ADA BATAS WAKTU, sehingga streaming video/audio tidak akan diputus paksa.
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

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default apiClient;
