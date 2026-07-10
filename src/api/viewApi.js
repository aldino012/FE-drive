// src/api/viewApi.js
import axiosInstance from "./axios";

// GANTI localhost dengan IP Address Raspberry Pi Anda
const API_BASE_URL = "https://192.168.1.100:5000";

export const getViewInfo = async (filePath) => {
  let pathString = filePath;
  if (typeof filePath === "object" && filePath !== null) {
    pathString = filePath.path || filePath.name || "";
  }

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/view/info`, {
      params: { path: pathString },
    });
    return response.data;
  } catch (error) {
    console.error(
      `❌ [viewApi] getViewInfo error:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getViewUrl = (filePath) => {
  let pathString = filePath;
  if (typeof filePath === "object" && filePath !== null) {
    pathString = filePath.path || filePath.name || "";
  }

  if (!pathString) return "";

  const encodedPath = encodeURIComponent(pathString);
  const fullUrl = `${API_BASE_URL}/api/view?path=${encodedPath}`;

  console.log("🎬 [viewApi] Generated view URL:", fullUrl);
  return fullUrl;
};

export const getFileTextContent = async (filePath) => {
  let pathString = filePath;
  if (typeof filePath === "object" && filePath !== null) {
    pathString = filePath.path || filePath.name || "";
  }

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/view`, {
      params: { path: pathString },
      responseType: "text",
    });
    return response.data;
  } catch (error) {
    console.error(
      `❌ [viewApi] getFileTextContent error:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};
