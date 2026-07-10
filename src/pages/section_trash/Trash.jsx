// src/pages/section_trash/Trash.jsx
import React, { useState } from "react";
import Aside from "../../components/Aside";
import useTrashData from "../../hooks/trash/useTrashData";
import useTrashActions from "../../hooks/trash/useTrashActions";

// Import Komponen (akan kita buat di langkah selanjutnya)
import TrashHeader from "./components/TrashHeader";
import TrashStatus from "./components/TrashStatus";
import TrashGrid from "./components/TrashGrid";

// Import Modals (akan kita buat di langkah selanjutnya)
import RestoreModal from "./components/modals/RestoreModal";
import DeleteModal from "./components/modals/DeleteModal";
import EmptyTrashModal from "./components/modals/EmptyTrashModal";

const Trash = () => {
  // ============ HOOKS ============
  const {
    items,
    allItems,
    isLoading: isDataLoading,
    error: dataError,
    searchQuery,
    filterType,
    stats,
    updateSearchQuery,
    updateFilterType,
    clearFilters,
    refresh,
  } = useTrashData();

  const {
    isLoading: isActionLoading,
    loadingAction,
    error: actionError,
    restoreItem,
    deletePermanent,
    emptyTrash,
    clearError: clearActionError,
  } = useTrashActions((result) => {
    refresh();
    const messages = {
      restore: "✅ Item berhasil dikembalikan!",
      delete: "✅ Item berhasil dihapus permanen!",
      empty: "✅ Tong sampah berhasil dikosongkan!",
    };
    if (messages[result.action]) {
      showNotification(messages[result.action], "success");
    }
  });

  // ============ LOCAL STATE ============
  const [activeMenu, setActiveMenu] = useState("trash");

  const [restoreModal, setRestoreModal] = useState({
    isOpen: false,
    item: null,
    destination: "/",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
  });

  const [emptyModal, setEmptyModal] = useState({
    isOpen: false,
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // ============ NOTIFICATION HELPER ============
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
    }, 3000);
  };

  // ============ ACTION HANDLERS ============
  const openRestoreModal = (item) => {
    setRestoreModal({ isOpen: true, item, destination: "/" });
  };

  const handleRestore = async () => {
    if (!restoreModal.destination.trim()) {
      showNotification("❌ Folder tujuan tidak boleh kosong", "error");
      return;
    }
    const result = await restoreItem(
      restoreModal.item,
      restoreModal.destination,
    );
    if (result.success) {
      setRestoreModal({ isOpen: false, item: null, destination: "/" });
    } else {
      showNotification(`❌ ${result.error}`, "error");
    }
  };

  const openDeleteModal = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleDeletePermanent = async () => {
    const result = await deletePermanent(deleteModal.item);
    if (result.success) {
      setDeleteModal({ isOpen: false, item: null });
    } else {
      showNotification(`❌ ${result.error}`, "error");
    }
  };

  const openEmptyModal = () => setEmptyModal({ isOpen: true });

  const handleEmptyTrash = async () => {
    const result = await emptyTrash();
    if (result.success) {
      setEmptyModal({ isOpen: false });
    } else {
      showNotification(`❌ ${result.error}`, "error");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Aside
        activeMenu={activeMenu}
        onMenuClick={setActiveMenu}
        onCreateFolder={() =>
          showNotification("⚠️ Fitur tidak tersedia di Trash", "info")
        }
        onUploadFile={() =>
          showNotification("⚠️ Fitur tidak tersedia di Trash", "info")
        }
        onUploadFolder={() =>
          showNotification("⚠️ Fitur tidak tersedia di Trash", "info")
        }
        onLogoutClick={() => showNotification("👋 Logout berhasil!", "info")}
        storageUsed={0}
        storageTotal={500}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TrashHeader
          stats={stats}
          searchQuery={searchQuery}
          filterType={filterType}
          isActionLoading={isActionLoading}
          loadingAction={loadingAction}
          updateSearchQuery={updateSearchQuery}
          updateFilterType={updateFilterType}
          clearFilters={clearFilters}
          openEmptyModal={openEmptyModal}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Status (Notifications, Errors, Loading, Empty) */}
          <TrashStatus
            notification={notification}
            actionError={actionError}
            dataError={dataError}
            isDataLoading={isDataLoading}
            items={items}
            searchQuery={searchQuery}
            filterType={filterType}
            clearActionError={clearActionError}
          />

          {/* Trash Items Grid */}
          <TrashGrid
            items={items}
            isDataLoading={isDataLoading}
            isActionLoading={isActionLoading}
            openRestoreModal={openRestoreModal}
            openDeleteModal={openDeleteModal}
          />
        </div>
      </div>

      {/* Modals */}
      <RestoreModal
        isOpen={restoreModal.isOpen}
        restoreModal={restoreModal}
        setRestoreModal={setRestoreModal}
        isActionLoading={isActionLoading}
        loadingAction={loadingAction}
        handleRestore={handleRestore}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        isActionLoading={isActionLoading}
        loadingAction={loadingAction}
        handleDeletePermanent={handleDeletePermanent}
      />

      <EmptyTrashModal
        isOpen={emptyModal.isOpen}
        setEmptyModal={setEmptyModal}
        stats={stats}
        isActionLoading={isActionLoading}
        loadingAction={loadingAction}
        handleEmptyTrash={handleEmptyTrash}
      />
    </div>
  );
};

export default Trash;
