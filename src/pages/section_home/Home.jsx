// src/pages/section_home/Home.jsx
import React, { useState, useRef } from "react";
import {
  FaTrash,
  FaFolderOpen,
  FaDownload,
  FaTimes,
  FaCheckSquare,
  FaLock,
} from "react-icons/fa";
import Aside from "../../components/Aside";
import Pagination from "../../components/Pagination";
import useDriveData from "../../hooks/home/useDriveData";
import useSearch from "../../hooks/home/useSearch";
import useStorage from "../../hooks/home/useStorage";
import useUploadFile from "../../hooks/home/useUploadFile";
import useUploadFolder from "../../hooks/home/useUploadFolder";
import useFileActions from "../../hooks/home/useFileActions";
import useFolderLock from "../../hooks/home/useFolderLock"; // <-- IMPORT BARU

// Local Components
import Header from "./components/Header";
import StatusBanners from "./components/StatusBanners";
import FileGrid from "./components/FileGrid";
import ContextMenu from "./components/ContextMenu";
import CreateFolderModal from "./components/modals/CreateFolderModal";
import RenameModal from "./components/modals/RenameModal";
import MoveModal from "./components/modals/MoveModal";
import DeleteModal from "./components/modals/DeleteModal";

// Lock Modals (BARU)
import LockFolderModal from "./components/modals/LockFolderModal";
import UnlockFolderModal from "./components/modals/UnlockFolderModal";
import ChangeLockPasswordModal from "./components/modals/ChangeLockPasswordModal";

// Viewers
import ImageViewer from "./components/viewers/ImageViewer";
import VideoViewer from "./components/viewers/VideoViewer";
import AudioViewer from "./components/viewers/AudioViewer";
import DocumentViewer from "./components/viewers/DocumentViewer";

const Home = () => {
  // ============ HOOKS ============
  const {
    currentPath,
    currentPage,
    items,
    totalPages,
    isLoading,
    navigateToFolder,
    changePage,
    refresh,
    generateBreadcrumbs,
  } = useDriveData();

  const {
    searchQuery,
    searchResults,
    isSearching,
    hasSearched,
    updateSearchQuery,
    clearSearch,
  } = useSearch();

  const { storageInfo } = useStorage();

  // === HOOK BARU: Folder Lock ===
  const {
    isFolderLocked,
    isInsideLockedFolder,
    lockFolder,
    unlockFolder,
    changePassword,
    refreshLockedFolders,
  } = useFolderLock();

  const {
    isUploading: isUploadingFile,
    progress: fileUploadProgress,
    uploadFiles,
    clearUpload: clearFileUpload,
  } = useUploadFile(
    (results) => {
      refresh();
      if (results.success.length > 0)
        showNotification(
          `✅ ${results.success.length} file berhasil diupload!`,
          "success",
        );
      clearFileUpload();
    },
    { uploadPath: currentPath },
  );

  const {
    isUploading: isUploadingFolder,
    totalFiles: totalFolderFiles,
    uploadedCount: uploadedFolderCount,
    uploadFolder,
    clearUpload: clearFolderUpload,
    getOverallProgress,
  } = useUploadFolder(
    (results) => {
      refresh();
      if (results.success.length > 0)
        showNotification(
          `✅ ${results.success.length} file berhasil diupload!`,
          "success",
        );
      clearFolderUpload();
    },
    { uploadPath: currentPath },
  );

  const {
    isLoading: isActionLoading,
    loadingAction,
    error: actionError,
    renameItem,
    moveItem,
    deleteItem,
    downloadItem,
    clearError: clearActionError,
  } = useFileActions((result) => {
    refresh();
    const messages = {
      rename: "✅ Nama berhasil diubah!",
      move: "✅ Item berhasil dipindahkan!",
      delete: "✅ Item berhasil dipindahkan ke Trash!",
      download: "✅ Download dimulai!",
    };
    if (messages[result.action])
      showNotification(messages[result.action], "success");
  });

  // ============ LOCAL STATE ============
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [itemToMove, setItemToMove] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // === STATE BARU UNTUK LOCK FOLDER MODALS ===
  const [itemToLock, setItemToLock] = useState(null);
  const [itemToUnlock, setItemToUnlock] = useState(null);
  const [itemToChangePassword, setItemToChangePassword] = useState(null);
  const [isLockActionLoading, setIsLockActionLoading] = useState(false);

  // === STATE UNTUK MULTI-SELECT ===
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [itemsToBulkDelete, setItemsToBulkDelete] = useState([]);
  const [itemsToBulkMove, setItemsToBulkMove] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // State untuk Viewers
  const [imageViewer, setImageViewer] = useState({ isOpen: false, file: null });
  const [videoViewer, setVideoViewer] = useState({ isOpen: false, file: null });
  const [audioViewer, setAudioViewer] = useState({ isOpen: false, file: null });
  const [documentViewer, setDocumentViewer] = useState({
    isOpen: false,
    file: null,
  });

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // ============ HANDLERS ============
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "info" }),
      3000,
    );
  };

  const handleCardContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, item });
  };

  const handleMoreButtonClick = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      setContextMenu({
        isOpen: true,
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 100,
        item,
      });
    } else {
      setContextMenu({
        isOpen: true,
        x: rect.right - 10,
        y: rect.bottom + 5,
        item,
      });
    }
  };

  const closeContextMenu = () =>
    setContextMenu({ isOpen: false, x: 0, y: 0, item: null });

  // === UPDATE: handleFolderClick dengan proteksi lock ===
  const handleFolderClick = (item) => {
    if (item.type !== "folder") return;

    // Cek apakah folder ini di-lock
    if (isFolderLocked(item.path)) {
      // Buka modal unlock
      setItemToUnlock(item);
      return;
    }

    // Cek apakah folder ini berada di dalam folder yang di-lock
    if (isInsideLockedFolder(item.path)) {
      showNotification(
        `🔒 Folder "${item.name}" berada di dalam folder yang dikunci. Buka kunci parent terlebih dahulu.`,
        "error",
      );
      return;
    }

    navigateToFolder(item.path);
  };

  // === UPDATE: handleViewFile dengan proteksi lock ===
  const handleViewFile = (item) => {
    closeContextMenu();

    // Cek apakah file berada di dalam folder yang di-lock
    if (isInsideLockedFolder(item.path)) {
      showNotification(
        `🔒 File ini berada di dalam folder yang dikunci. Tidak bisa diakses.`,
        "error",
      );
      return;
    }

    const fileName = item.name || "";
    const ext = fileName.split(".").pop().toLowerCase();

    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
      "webp",
      "bmp",
      "ico",
      "tiff",
      "tif",
    ];
    const videoExtensions = [
      "mp4",
      "webm",
      "ogg",
      "avi",
      "mkv",
      "mov",
      "wmv",
      "flv",
      "m4v",
    ];
    const audioExtensions = ["mp3", "wav", "flac", "aac", "m4a", "wma", "ogg"];
    const documentExtensions = [
      "pdf",
      "txt",
      "md",
      "json",
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "xml",
      "csv",
      "log",
      "sh",
      "py",
      "java",
      "c",
      "cpp",
      "doc",
      "docx",
    ];

    if (imageExtensions.includes(ext)) {
      setImageViewer({ isOpen: true, file: item });
    } else if (videoExtensions.includes(ext)) {
      setVideoViewer({ isOpen: true, file: item });
    } else if (audioExtensions.includes(ext)) {
      setAudioViewer({ isOpen: true, file: item });
    } else if (documentExtensions.includes(ext)) {
      setDocumentViewer({ isOpen: true, file: item });
    } else {
      showNotification(`⚠️ Preview untuk file .${ext} belum tersedia.`, "info");
    }
  };

  const handleBreadcrumbClick = (path) => navigateToFolder(path);

  const handleOpenCreateFolder = () => {
    setIsCreateModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleOpenFileUpload = () => {
    fileInputRef.current?.click();
    setMobileMenuOpen(false);
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setUploadStatus({
      type: "file",
      message: `Mengupload ${files.length} file...`,
    });
    await uploadFiles(files, currentPath);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenFolderUpload = () => {
    folderInputRef.current?.click();
    setMobileMenuOpen(false);
  };

  const handleFolderChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadStatus({
      type: "folder",
      message: `Mengupload folder (${files.length} file)...`,
    });
    await uploadFolder(files, currentPath);
    setUploadStatus(null);
    if (folderInputRef.current) folderInputRef.current.value = "";
  };

  const openRenameModal = (item) => {
    closeContextMenu();
    setItemToRename(item);
  };
  const openMoveModal = (item) => {
    closeContextMenu();
    setItemToMove(item);
  };
  const openDeleteModal = (item) => {
    closeContextMenu();

    // CEK 1: Apakah item adalah folder yang di-lock?
    if (item.type === "folder" && isFolderLocked(item.path)) {
      showNotification(
        `🔒 Folder "${item.name}" dikunci dan tidak bisa dihapus. Buka kunci terlebih dahulu.`,
        "error",
      );
      return;
    }

    // CEK 2: Apakah item berada di dalam folder yang di-lock?
    if (isInsideLockedFolder(item.path)) {
      showNotification(
        `🔒 "${item.name}" berada di dalam folder yang dikunci. Tidak bisa dihapus.`,
        "error",
      );
      return;
    }

    // Jika lolos semua pengecekan, buka modal delete
    setItemToDelete(item);
  };

  const handleDownload = async (item) => {
    closeContextMenu();

    // Cek apakah item berada di dalam folder yang di-lock
    if (isInsideLockedFolder(item.path)) {
      showNotification(
        `🔒 Item ini berada di dalam folder yang dikunci. Tidak bisa diunduh.`,
        "error",
      );
      return;
    }

    const result = await downloadItem(item);
    if (!result.success) showNotification(`❌ ${result.error}`, "error");
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    showNotification("👋 Logout berhasil!", "info");
  };

  // ============ LOCK FOLDER HANDLERS ============
  const openLockModal = (item) => {
    closeContextMenu();
    setItemToLock(item);
  };

  const openUnlockModal = (item) => {
    closeContextMenu();
    setItemToUnlock(item);
  };

  const openChangePasswordModal = (item) => {
    closeContextMenu();
    setItemToChangePassword(item);
  };

  const handleLockSuccess = () => {
    showNotification(
      `🔒 Folder "${itemToLock?.name}" berhasil dikunci!`,
      "success",
    );
    setItemToLock(null);
    refreshLockedFolders();
  };

  const handleUnlockSuccess = () => {
    showNotification(
      `🔓 Folder "${itemToUnlock?.name}" berhasil dibuka kuncinya!`,
      "success",
    );
    setItemToUnlock(null);
    refreshLockedFolders();
    // Refresh data agar isi folder yang baru di-unlock muncul
    refresh();
  };

  const handleChangePasswordSuccess = () => {
    showNotification(
      `🔑 Password folder "${itemToChangePassword?.name}" berhasil diubah!`,
      "success",
    );
    setItemToChangePassword(null);
  };

  const handleLockError = (message) => {
    showNotification(`❌ ${message}`, "error");
  };

  // ============ MULTI-SELECT HANDLERS ============
  const handleSelectItem = (item) => {
    // Cek apakah item berada di folder yang di-lock
    if (isInsideLockedFolder(item.path)) {
      showNotification(
        `🔒 "${item.name}" berada di dalam folder yang dikunci. Tidak bisa dipilih.`,
        "error",
      );
      return;
    }

    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.path === item.path);
      if (exists) {
        const newItems = prev.filter((i) => i.path !== item.path);
        if (newItems.length === 0) setIsSelectMode(false);
        return newItems;
      } else {
        setIsSelectMode(true);
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    const displayItems = hasSearched ? searchResults : items;
    // Filter item yang tidak berada di folder terkunci
    const selectableItems = displayItems.filter(
      (item) => !isInsideLockedFolder(item.path),
    );

    const allSelected = selectableItems.every((item) =>
      selectedItems.some((s) => s.path === item.path),
    );

    if (allSelected) {
      const pathsToDeselect = new Set(selectableItems.map((i) => i.path));
      setSelectedItems((prev) =>
        prev.filter((i) => !pathsToDeselect.has(i.path)),
      );
      setIsSelectMode(false);
    } else {
      const existingPaths = new Set(selectedItems.map((i) => i.path));
      const newItems = selectableItems.filter(
        (i) => !existingPaths.has(i.path),
      );
      setSelectedItems([...selectedItems, ...newItems]);
      setIsSelectMode(true);
    }
  };

  const handleExitSelectMode = () => {
    setSelectedItems([]);
    setIsSelectMode(false);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    setItemsToBulkDelete([...selectedItems]);
    setIsBulkDeleteModalOpen(true);
  };

  const handleBulkMove = () => {
    if (selectedItems.length === 0) return;
    setItemsToBulkMove([...selectedItems]);
    setIsBulkMoveModalOpen(true);
  };

  const handleBulkDownload = async () => {
    if (selectedItems.length === 0) return;
    showNotification(
      `⏳ Memulai download ${selectedItems.length} item...`,
      "info",
    );
    for (const item of selectedItems) {
      await downloadItem(item);
    }
    showNotification(
      `✅ Download ${selectedItems.length} item dimulai!`,
      "success",
    );
  };

  // ============ DISPLAY LOGIC ============
  const displayItems = hasSearched ? searchResults : items;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
      />

      {/* Overlay gelap saat sidebar mobile terbuka */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Aside
          onCreateFolder={handleOpenCreateFolder}
          onUploadFile={handleOpenFileUpload}
          onUploadFolder={handleOpenFolderUpload}
          onLogoutClick={handleLogout}
          storageUsed={storageInfo?.used || 0}
          storageTotal={storageInfo?.total || 500}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header
          searchQuery={searchQuery}
          updateSearchQuery={updateSearchQuery}
          clearSearch={clearSearch}
          isSearching={isSearching}
          hasSearched={hasSearched}
          breadcrumbs={generateBreadcrumbs().map((item) => ({
            label: item.label,
            onClick: () => handleBreadcrumbClick(item.path),
          }))}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
          <StatusBanners
            notification={notification}
            uploadStatus={uploadStatus}
            isUploadingFile={isUploadingFile}
            fileUploadProgress={fileUploadProgress}
            isUploadingFolder={isUploadingFolder}
            totalFolderFiles={totalFolderFiles}
            uploadedFolderCount={uploadedFolderCount}
            getOverallProgress={getOverallProgress}
            actionError={actionError}
            clearActionError={clearActionError}
          />

          {/* === BULK ACTION BAR === */}
          {isSelectMode && selectedItems.length > 0 && (
            <div className="mb-4 bg-blue-600 text-white rounded-lg shadow-lg p-3 flex flex-wrap items-center justify-between gap-3 animate-slideIn">
              <div className="flex items-center gap-3">
                <FaCheckSquare className="text-lg" />
                <span className="font-medium">
                  {selectedItems.length} item dipilih
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleBulkMove}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  title="Pindahkan item yang dipilih"
                >
                  <FaFolderOpen className="text-sm" />
                  <span className="hidden sm:inline">Pindah</span>
                </button>
                <button
                  onClick={handleBulkDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  title="Download item yang dipilih"
                >
                  <FaDownload className="text-sm" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
                  title="Hapus item yang dipilih"
                >
                  <FaTrash className="text-sm" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
                <button
                  onClick={handleExitSelectMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                  title="Batal pilih"
                >
                  <FaTimes className="text-sm" />
                  <span className="hidden sm:inline">Batal</span>
                </button>
              </div>
            </div>
          )}

          <FileGrid
            items={displayItems}
            isLoading={isLoading}
            hasSearched={hasSearched}
            onFolderClick={handleFolderClick}
            onViewFile={handleViewFile}
            onContextMenu={handleCardContextMenu}
            onMoreClick={handleMoreButtonClick}
            // Props multi-select
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            isSelectMode={isSelectMode}
            // === PROPS BARU UNTUK LOCK ===
            isFolderLocked={isFolderLocked}
          />
        </div>

        {!hasSearched && totalPages > 1 && (
          <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={changePage}
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        item={contextMenu.item}
        onClose={closeContextMenu}
        onViewFile={handleViewFile}
        onRename={openRenameModal}
        onMove={openMoveModal}
        onDownload={handleDownload}
        onDelete={openDeleteModal}
        isActionLoading={isActionLoading}
        loadingAction={loadingAction}
        // === PROPS BARU UNTUK LOCK ===
        isLocked={
          contextMenu.item?.type === "folder"
            ? isFolderLocked(contextMenu.item.path)
            : false
        }
        onLock={openLockModal}
        onUnlock={openUnlockModal}
        onChangePassword={openChangePasswordModal}
      />

      {/* Modals Standar */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentPath={currentPath}
        onSuccess={() => {
          refresh();
          showNotification("✅ Folder berhasil dibuat!", "success");
        }}
        onError={(message) => showNotification(`❌ ${message}`, "error")}
      />

      <RenameModal
        isOpen={!!itemToRename}
        onClose={() => setItemToRename(null)}
        item={itemToRename}
        renameItem={renameItem}
        isActionLoading={isActionLoading}
        onSuccess={() => {
          refresh();
          showNotification("✅ Nama berhasil diubah!", "success");
          setItemToRename(null);
        }}
        onError={(message) => showNotification(`❌ ${message}`, "error")}
      />

      <MoveModal
        isOpen={!!itemToMove}
        onClose={() => setItemToMove(null)}
        item={itemToMove}
        moveItem={moveItem}
        isActionLoading={isActionLoading}
        onSuccess={() => {
          refresh();
          showNotification("✅ Item berhasil dipindahkan!", "success");
          setItemToMove(null);
          handleExitSelectMode();
        }}
        onError={(message) => showNotification(`❌ ${message}`, "error")}
      />

      <DeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        item={itemToDelete}
        deleteItem={deleteItem}
        isActionLoading={isActionLoading}
        onSuccess={() => {
          refresh();
          showNotification("✅ Item berhasil dipindahkan ke Trash!", "success");
          setItemToDelete(null);
          handleExitSelectMode();
        }}
        onError={(message) => showNotification(`❌ ${message}`, "error")}
      />

      {/* === LOCK FOLDER MODALS (BARU) === */}
      <LockFolderModal
        isOpen={!!itemToLock}
        onClose={() => setItemToLock(null)}
        item={itemToLock}
        lockFolder={lockFolder}
        isActionLoading={isLockActionLoading}
        onSuccess={handleLockSuccess}
        onError={handleLockError}
      />

      <UnlockFolderModal
        isOpen={!!itemToUnlock}
        onClose={() => setItemToUnlock(null)}
        item={itemToUnlock}
        unlockFolder={unlockFolder}
        isActionLoading={isLockActionLoading}
        onSuccess={handleUnlockSuccess}
        onError={handleLockError}
      />

      <ChangeLockPasswordModal
        isOpen={!!itemToChangePassword}
        onClose={() => setItemToChangePassword(null)}
        item={itemToChangePassword}
        changePassword={changePassword}
        isActionLoading={isLockActionLoading}
        onSuccess={handleChangePasswordSuccess}
        onError={handleLockError}
      />

      {/* Bulk Delete Modal */}
      <DeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        item={{
          name: `${itemsToBulkDelete.length} item`,
          path: "multiple",
          type: "multiple",
          items: itemsToBulkDelete,
        }}
        deleteItem={async (itemData) => {
          let successCount = 0;
          let failCount = 0;
          for (const it of itemData.items || []) {
            const result = await deleteItem(it);
            if (result.success) successCount++;
            else failCount++;
          }
          return {
            success: successCount > 0,
            error: failCount > 0 ? `${failCount} item gagal dihapus` : null,
          };
        }}
        isActionLoading={isActionLoading}
        onSuccess={() => {
          refresh();
          showNotification(
            `✅ ${itemsToBulkDelete.length} item berhasil dipindahkan ke Trash!`,
            "success",
          );
          setIsBulkDeleteModalOpen(false);
          setItemsToBulkDelete([]);
          handleExitSelectMode();
        }}
        onError={(message) => showNotification(`❌ ${message}`, "error")}
      />

      {/* Bulk Move Modal */}
      <MoveModal
        isOpen={isBulkMoveModalOpen}
        onClose={() => setIsBulkMoveModalOpen(false)}
        item={{
          name: `${itemsToBulkMove.length} item`,
          path: "multiple",
          type: "multiple",
          items: itemsToBulkMove,
        }}
        moveItem={async (itemData, targetPath) => {
          let successCount = 0;
          let failCount = 0;
          for (const it of itemData.items || []) {
            const result = await moveItem(it, targetPath);
            if (result.success) successCount++;
            else failCount++;
          }
          return {
            success: successCount > 0,
            error: failCount > 0 ? `${failCount} item gagal dipindahkan` : null,
          };
        }}
        isActionLoading={isActionLoading}
        onSuccess={() => {
          refresh();
          showNotification(
            `✅ ${itemsToBulkMove.length} item berhasil dipindahkan!`,
            "success",
          );
          setIsBulkMoveModalOpen(false);
          setItemsToBulkMove([]);
          handleExitSelectMode();
        }}
        onError={(message) => showNotification(`❌ ${message}`, "error")}
      />

      {/* Viewers */}
      {imageViewer.isOpen && (
        <ImageViewer
          file={imageViewer.file}
          onClose={() => setImageViewer({ isOpen: false, file: null })}
        />
      )}
      {videoViewer.isOpen && (
        <VideoViewer
          file={videoViewer.file}
          onClose={() => setVideoViewer({ isOpen: false, file: null })}
        />
      )}
      {audioViewer.isOpen && (
        <AudioViewer
          file={audioViewer.file}
          onClose={() => setAudioViewer({ isOpen: false, file: null })}
        />
      )}
      {documentViewer.isOpen && (
        <DocumentViewer
          file={documentViewer.file}
          onClose={() => setDocumentViewer({ isOpen: false, file: null })}
        />
      )}
    </div>
  );
};

export default Home;
