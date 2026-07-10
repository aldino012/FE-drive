// src/pages/section_home/components/modals/MoveModal.jsx
import React, { useState, useEffect } from "react";
import {
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaHome,
  FaPlus,
  FaArrowLeft,
  FaSpinner,
  FaCheck,
} from "react-icons/fa";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import apiClient from "../../../../api/axios";

const MoveModal = ({
  isOpen,
  onClose,
  item,
  moveItem,
  isActionLoading,
  onSuccess,
  onError,
}) => {
  // State untuk browsing folder
  const [currentBrowsePath, setCurrentBrowsePath] = useState("/");
  const [folders, setFolders] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [error, setError] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen && item) {
      setCurrentBrowsePath("/");
      setSelectedPath(null);
      setError(null);
      setNewFolderName("");
      fetchFolders("/");
    }
  }, [isOpen, item]);

  // Fetch daftar folder di path tertentu
  const fetchFolders = async (path) => {
    setIsLoadingFolders(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/files", {
        params: { path },
      });
      // Filter hanya folder, dan exclude folder asal item (untuk mencegah pindah ke diri sendiri)
      const allFolders = response.data.folders || [];
      const filteredFolders = allFolders.filter((folderName) => {
        const folderPath =
          path === "/" ? `/${folderName}` : `${path}/${folderName}`;
        // Jangan tampilkan folder asal item (karena tidak bisa pindah ke folder yang sama)
        if (item?.path && folderPath === item.path) return false;
        return true;
      });
      setFolders(filteredFolders);
      setCurrentBrowsePath(path);
    } catch (err) {
      console.error("Gagal memuat folder:", err);
      setError("Gagal memuat daftar folder");
      setFolders([]);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Klik folder untuk masuk ke dalamnya
  const handleFolderClick = (folderName) => {
    const newPath =
      currentBrowsePath === "/"
        ? `/${folderName}`
        : `${currentBrowsePath}/${folderName}`;
    fetchFolders(newPath);
  };

  // Navigasi ke parent folder
  const handleGoUp = () => {
    if (currentBrowsePath === "/") return;
    const parts = currentBrowsePath.split("/").filter(Boolean);
    parts.pop();
    const parentPath = parts.length === 0 ? "/" : "/" + parts.join("/");
    fetchFolders(parentPath);
  };

  // Pilih folder saat ini sebagai tujuan
  const handleSelectCurrentFolder = () => {
    // Cek apakah tujuan sama dengan asal (tidak boleh)
    if (item?.path && currentBrowsePath === item.path) {
      setError("Tidak bisa memindahkan item ke folder asalnya sendiri");
      return;
    }
    setSelectedPath(currentBrowsePath);
  };

  // Buat folder baru di path saat ini
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    setError(null);
    try {
      const newPath =
        currentBrowsePath === "/"
          ? `/${newFolderName.trim()}`
          : `${currentBrowsePath}/${newFolderName.trim()}`;
      await apiClient.post("/api/folders", { path: newPath });
      setNewFolderName("");
      // Refresh daftar folder
      fetchFolders(currentBrowsePath);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Eksekusi pemindahan
  const handleMove = async () => {
    if (!selectedPath) {
      onError("Pilih folder tujuan terlebih dahulu");
      return;
    }

    const result = await moveItem(item, selectedPath);
    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      onError(result.error);
    }
  };

  const handleClose = () => {
    if (!isActionLoading) {
      onClose();
    }
  };

  // Generate breadcrumb
  const breadcrumbs =
    currentBrowsePath === "/"
      ? [{ label: "Root", path: "/" }]
      : [
          { label: "Root", path: "/" },
          ...currentBrowsePath
            .split("/")
            .filter(Boolean)
            .map((part, index, arr) => ({
              label: part,
              path: "/" + arr.slice(0, index + 1).join("/"),
            })),
        ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pindahkan Item"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isActionLoading}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleMove}
            disabled={!selectedPath || isActionLoading}
            isLoading={isActionLoading}
          >
            Pindahkan ke Sini
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Item yang akan dipindahkan */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Memindahkan:</strong> {item?.name}
          </p>
          <p className="text-xs text-blue-800 mt-1">
            <strong>Dari:</strong>{" "}
            <span className="font-mono">{item?.path}</span>
          </p>
          {selectedPath && (
            <p className="text-xs text-green-700 mt-1 font-semibold">
              <strong>✓ Tujuan:</strong>{" "}
              <span className="font-mono">{selectedPath}</span>
            </p>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && (
                <FaChevronRight className="text-gray-400 text-xs flex-shrink-0" />
              )}
              <button
                onClick={() => fetchFolders(crumb.path)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
              >
                {index === 0 ? (
                  <FaHome className="text-xs" />
                ) : (
                  <FaFolderOpen className="text-xs" />
                )}
                <span className="font-medium">{crumb.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Toolbar: Tombol Naik + Buat Folder Baru */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoUp}
            disabled={currentBrowsePath === "/" || isLoadingFolders}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kembali ke folder induk"
          >
            <FaArrowLeft className="text-xs" />
            <span>Naik</span>
          </button>

          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nama folder baru..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim()) {
                  handleCreateFolder();
                }
              }}
              disabled={isCreatingFolder}
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || isCreatingFolder}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Buat folder baru di lokasi ini"
            >
              {isCreatingFolder ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaPlus className="text-xs" />
              )}
              <span>Buat</span>
            </button>
          </div>
        </div>

        {/* Daftar Folder */}
        <div className="border border-gray-200 rounded-lg bg-white max-h-64 overflow-y-auto">
          {isLoadingFolders ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <FaSpinner className="animate-spin mr-2" />
              <span>Memuat folder...</span>
            </div>
          ) : error && folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => fetchFolders(currentBrowsePath)}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaFolder className="text-4xl mb-2" />
              <p className="text-sm">Tidak ada subfolder di sini</p>
              <p className="text-xs mt-1">
                Buat folder baru atau pilih folder ini sebagai tujuan
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {folders.map((folderName) => {
                const folderPath =
                  currentBrowsePath === "/"
                    ? `/${folderName}`
                    : `${currentBrowsePath}/${folderName}`;
                const isSelected = selectedPath === folderPath;
                return (
                  <li
                    key={folderName}
                    onClick={() => handleFolderClick(folderName)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                      isSelected ? "bg-blue-100" : ""
                    }`}
                  >
                    <FaFolder className="text-yellow-500 text-lg flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-800 font-medium truncate">
                      {folderName}
                    </span>
                    <FaChevronRight className="text-gray-400 text-xs" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Tombol Pilih Folder Ini */}
        <button
          onClick={handleSelectCurrentFolder}
          disabled={
            isActionLoading || (item?.path && currentBrowsePath === item.path)
          }
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            selectedPath === currentBrowsePath
              ? "bg-green-600 text-white shadow-md"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {selectedPath === currentBrowsePath ? (
            <>
              <FaCheck />
              <span>Folder Ini Dipilih ✓</span>
            </>
          ) : (
            <>
              <FaFolderOpen />
              <span>
                Pilih "
                {currentBrowsePath === "/"
                  ? "Root"
                  : currentBrowsePath.split("/").pop()}
                " sebagai Tujuan
              </span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default MoveModal;
