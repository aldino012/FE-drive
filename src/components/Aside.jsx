// src/components/Aside.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaPlus,
  FaFolder,
  FaFolderPlus,
  FaFileUpload,
  FaUpload,
  FaStar,
  FaClock,
  FaTrash,
  FaSignOutAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaHdd,
} from "react-icons/fa";
import Button from "./Button";
import apiClient from "../api/axios";

const Aside = ({
  onCreateFolder = () => {},
  onUploadFile = () => {},
  onUploadFolder = () => {},
  onLogoutClick = () => {},
  onStorageFormatSuccess = () => {}, // Callback setelah format berhasil
  storageUsed = 0,
  storageTotal = 500,
  onClose,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();

  // State untuk Format Storage Modal
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [formatConfirmText, setFormatConfirmText] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatError, setFormatError] = useState(null);

  const menuItems = [
    { id: "drive", label: "My Drive", icon: FaFolder, path: "/drive" },
    { id: "favorite", label: "Favorite", icon: FaStar, path: "/favorite" },
    { id: "recent", label: "Recent", icon: FaClock, path: "/recent" },
    { id: "trash", label: "Trash", icon: FaTrash, path: "/trash" },
  ];

  const createOptions = [
    {
      id: "folder",
      label: "Buat Folder",
      icon: FaFolderPlus,
      onClick: () => {
        setIsMenuOpen(false);
        onCreateFolder();
      },
      color: "text-blue-600",
    },
    {
      id: "file",
      label: "Upload File",
      icon: FaFileUpload,
      onClick: () => {
        setIsMenuOpen(false);
        onUploadFile();
      },
      color: "text-green-600",
    },
    {
      id: "folder-upload",
      label: "Upload Folder",
      icon: FaUpload,
      onClick: () => {
        setIsMenuOpen(false);
        onUploadFolder();
      },
      color: "text-purple-600",
    },
  ];

  const storagePercentage =
    storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;

  const getActiveMenu = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find((item) => item.path === currentPath);
    return activeItem?.id || "drive";
  };

  const activeMenu = getActiveMenu();

  const handleCreateClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOptionClick = (option) => {
    option.onClick();
  };

  // ============ FORMAT STORAGE HANDLERS ============
  const handleOpenFormatModal = () => {
    setIsFormatModalOpen(true);
    setFormatConfirmText("");
    setFormatError(null);
  };

  const handleCloseFormatModal = () => {
    if (!isFormatting) {
      setIsFormatModalOpen(false);
      setFormatConfirmText("");
      setFormatError(null);
    }
  };

  const handleFormatStorage = async () => {
    // Validasi konfirmasi
    if (formatConfirmText.trim().toUpperCase() !== "FORMAT") {
      setFormatError('Ketik "FORMAT" untuk konfirmasi');
      return;
    }

    setIsFormatting(true);
    setFormatError(null);

    try {
      const response = await apiClient.delete("/api/storage/format");

      if (response.data.success) {
        // Tutup modal
        setIsFormatModalOpen(false);
        setFormatConfirmText("");

        // Notifikasi sukses (bisa diganti dengan sistem notifikasi global Anda)
        alert(
          "✅ " +
            (response.data.message || "Penyimpanan berhasil dikosongkan!"),
        );

        // Panggil callback untuk refresh data
        onStorageFormatSuccess();
      } else {
        setFormatError(
          response.data.message || "Gagal mengosongkan penyimpanan",
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat mengosongkan penyimpanan";
      setFormatError(errorMessage);
      console.error("Format storage error:", err);
    } finally {
      setIsFormatting(false);
    }
  };

  // ============ EFFECTS ============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        if (isFormatModalOpen && !isFormatting) {
          handleCloseFormatModal();
        }
      }
    };

    if (isMenuOpen || isFormatModalOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, isFormatModalOpen, isFormatting]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col p-4 relative">
      {/* Tombol close hanya di mobile */}
      {onClose && (
        <button
          className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700 z-50 p-1"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      )}

      {/* Header / Create Button */}
      <div className="mb-6 relative">
        <Button
          ref={buttonRef}
          onClick={handleCreateClick}
          leftIcon={<FaPlus className="w-4 h-4" />}
          fullWidth
          size="md"
        >
          Baru
        </Button>

        {isMenuOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn"
          >
            {createOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${option.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 font-medium"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Storage & Logout */}
      <div className="mt-auto pt-4 border-t border-gray-200 space-y-4">
        {/* Storage Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <FaHdd className="text-xs" />
              Penyimpanan
            </h3>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                storagePercentage >= 90
                  ? "bg-red-600"
                  : storagePercentage >= 70
                    ? "bg-yellow-500"
                    : "bg-blue-600"
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-600 mb-2">
            <span className="font-semibold text-gray-800">
              {storageUsed} GB
            </span>{" "}
            dari {storageTotal} GB terpakai
          </p>

          {/* Tombol Kosongkan Penyimpanan */}
          <button
            onClick={handleOpenFormatModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors duration-200"
            title="Hapus semua file dan folder secara permanen"
          >
            <FaTrash className="w-3 h-3" />
            <span>Kosongkan Penyimpanan</span>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-600 hover:bg-red-50 font-medium transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* ============ FORMAT STORAGE MODAL ============ */}
      {isFormatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Kosongkan Penyimpanan
                </h3>
                <p className="text-xs text-red-100">
                  Aksi ini tidak dapat dibatalkan!
                </p>
              </div>
              <button
                onClick={handleCloseFormatModal}
                disabled={isFormatting}
                className="ml-auto text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50"
                aria-label="Tutup"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning Box */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ PERINGATAN KERAS!
                </p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>
                    Semua file dan folder akan dihapus <strong>PERMANEN</strong>
                  </li>
                  <li>
                    Data yang dihapus <strong>TIDAK BISA</strong> dipulihkan
                  </li>
                  <li>Folder Trash juga akan dikosongkan</li>
                  <li>Pastikan Anda sudah mem-backup data penting</li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ketik{" "}
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600">
                    FORMAT
                  </span>{" "}
                  untuk konfirmasi:
                </label>
                <input
                  type="text"
                  value={formatConfirmText}
                  onChange={(e) => {
                    setFormatConfirmText(e.target.value);
                    setFormatError(null);
                  }}
                  placeholder="Ketik FORMAT di sini..."
                  disabled={isFormatting}
                  autoFocus
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      formatConfirmText.trim().toUpperCase() === "FORMAT" &&
                      !isFormatting
                    ) {
                      handleFormatStorage();
                    }
                  }}
                />
                {formatError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <FaExclamationTriangle className="w-3 h-3" />
                    {formatError}
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Jika Anda hanya ingin menghapus
                  beberapa file, gunakan fitur hapus biasa di halaman My Drive.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCloseFormatModal}
                disabled={isFormatting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleFormatStorage}
                disabled={
                  formatConfirmText.trim().toUpperCase() !== "FORMAT" ||
                  isFormatting
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isFormatting ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Mengosongkan...</span>
                  </>
                ) : (
                  <>
                    <FaTrash className="w-4 h-4" />
                    <span>Ya, Kosongkan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Aside;