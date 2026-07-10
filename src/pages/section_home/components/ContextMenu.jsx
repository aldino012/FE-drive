// src/pages/section_home/components/ContextMenu.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  FaEdit,
  FaFolderOpen,
  FaDownload,
  FaTrash,
  FaEye,
  FaLock,
  FaLockOpen,
  FaKey,
} from "react-icons/fa";

const ContextMenu = ({
  isOpen,
  position,
  item,
  onClose,
  onViewFile,
  onRename,
  onMove,
  onDownload,
  onDelete,
  // === PROPS BARU UNTUK LOCK FOLDER ===
  isLocked = false, // Status lock folder saat ini
  onLock, // Callback untuk buka modal lock
  onUnlock, // Callback untuk buka modal unlock
  onChangePassword, // Callback untuk buka modal change password
  isActionLoading,
  loadingAction,
}) => {
  const contextMenuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });

  // Menyesuaikan posisi menu agar tidak terpotong layar
  useEffect(() => {
    if (isOpen && contextMenuRef.current) {
      const menu = contextMenuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      if (x + menuRect.width > windowWidth - 10) {
        x = windowWidth - menuRect.width - 10;
      }

      if (y + menuRect.height > windowHeight - 10) {
        y = windowHeight - menuRect.height - 10;
      }

      if (x < 10) x = 10;
      if (y < 10) y = 10;

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);

  // Tutup menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("contextmenu", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", onClose);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  // Cek apakah item adalah folder (lock hanya untuk folder)
  const isFolder = item.type === "folder";

  // === LOGIKA BARU: Cek apakah item adalah folder yang di-lock ===
  // Folder yang di-lock TIDAK BISA di-rename, move, download, atau delete
  const isLockedFolder = isFolder && isLocked;

  return (
    <>
      {/* Overlay transparan untuk mencegah interaksi lain */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Context Menu */}
      <div
        ref={contextMenuRef}
        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px] max-w-[280px] w-auto animate-fadeIn"
        style={{
          top: adjustedPosition.y,
          left: adjustedPosition.x,
        }}
      >
        {/* Header: Nama item */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
          {isLockedFolder && (
            <FaLock className="w-3 h-3 text-orange-500 flex-shrink-0" />
          )}
          <p
            className="text-xs text-gray-500 truncate max-w-[250px]"
            title={item.name}
          >
            {item.name}
          </p>
        </div>

        {/* Info Banner untuk Folder Terkunci */}
        {isLockedFolder && (
          <div className="mx-3 mb-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700 flex items-center gap-1.5">
              <FaLock className="w-3 h-3 flex-shrink-0" />
              <span>Folder ini dikunci. Buka kunci untuk mengakses.</span>
            </p>
          </div>
        )}

        {/* Tombol Lihat / Preview (hanya untuk file) */}
        {item.type !== "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewFile(item);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          >
            <FaEye className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">Lihat / Preview</span>
          </button>
        )}

        {/* === AKSI MODIFIKASI (HANYA MUNCUL JIKA FOLDER TIDAK DI-LOCK) === */}
        {!isLockedFolder && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(item);
              }}
              disabled={isActionLoading && loadingAction === "rename"}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 touch-manipulation"
            >
              <FaEdit className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Ubah Nama</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(item);
              }}
              disabled={isActionLoading && loadingAction === "move"}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 touch-manipulation"
            >
              <FaFolderOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Pindahkan</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(item);
              }}
              disabled={isActionLoading && loadingAction === "download"}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 touch-manipulation"
            >
              <FaDownload className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Unduh</span>
            </button>
          </>
        )}

        {/* === BAGIAN LOCK FOLDER (Hanya untuk folder) === */}
        {isFolder && (
          <>
            <div className="border-t border-gray-200 my-1"></div>

            {/* Jika folder BELUM di-lock → tampilkan "Kunci Folder" */}
            {!isLocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLock(item);
                }}
                disabled={isActionLoading}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 active:bg-orange-100 transition-colors disabled:opacity-50 touch-manipulation"
              >
                <FaLock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Kunci Folder</span>
              </button>
            )}

            {/* Jika folder SUDAH di-lock → tampilkan "Buka Kunci" dan "Ubah Password" */}
            {isLocked && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlock(item);
                  }}
                  disabled={isActionLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-50 active:bg-green-100 transition-colors disabled:opacity-50 touch-manipulation"
                >
                  <FaLockOpen className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Buka Kunci</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangePassword(item);
                  }}
                  disabled={isActionLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 active:bg-purple-100 transition-colors disabled:opacity-50 touch-manipulation"
                >
                  <FaKey className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Ubah Password</span>
                </button>
              </>
            )}
          </>
        )}

        {/* === TOMBOL HAPUS (HANYA MUNCUL JIKA FOLDER TIDAK DI-LOCK) === */}
        {!isLockedFolder && (
          <>
            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              disabled={isActionLoading && loadingAction === "delete"}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 touch-manipulation"
            >
              <FaTrash className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-600">Hapus</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ContextMenu;