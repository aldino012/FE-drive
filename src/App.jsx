// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/section_home/Home";
import Trash from "./pages/section_trash/Trash";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          {/* Default route - redirect ke /drive */}
          <Route path="/" element={<Navigate to="/drive" replace />} />

          {/* Halaman utama drive */}
          <Route path="/drive" element={<Home />} />

          {/* Halaman tong sampah */}
          <Route path="/trash" element={<Trash />} />

          {/* Halaman favorite (untuk nanti) */}
          <Route path="/favorite" element={<Home activeMenu="favorite" />} />

          {/* Halaman recent (untuk nanti) */}
          <Route path="/recent" element={<Home activeMenu="recent" />} />

          {/* 404 - Fallback ke drive */}
          <Route path="*" element={<Navigate to="/drive" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
