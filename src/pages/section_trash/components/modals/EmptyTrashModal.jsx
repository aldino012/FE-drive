// src/pages/section_trash/components/modals/EmptyTrashModal.jsx
import React from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

const EmptyTrashModal = ({
  isOpen,
  setEmptyModal,
  stats,
  isActionLoading,
  loadingAction,
  handleEmptyTrash,
}) => {
  // Handler untuk menutup modal (mencegah penutupan saat loading)
  const handleClose = () => {
    if (!isActionLoading) {
      setEmptyModal({ isOpen: false });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Kosongkan Tong Sampah"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setEmptyModal({ isOpen: false })}
            disabled={isActionLoading}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleEmptyTrash}
            disabled={isActionLoading}
            isLoading={isActionLoading && loadingAction === "empty"}
            leftIcon={<FaTrashAlt className="w-4 h-4" />}
          >
            Kosongkan Semua
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Peringatan */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <FaExclamationTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              Apakah Anda yakin ingin mengosongkan seluruh tong sampah?
            </p>
            <p className="text-xs text-red-700 mt-1">
              Semua {stats.total} item ({stats.totalSizeFormatted}) akan dihapus
              permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        {/* Ringkasan Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Ringkasan:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              • Total items: <strong>{stats.total}</strong>
            </p>
            <p>
              • File: <strong>{stats.files}</strong>
            </p>
            <p>
              • Folder: <strong>{stats.folders}</strong>
            </p>
            <p>
              • Total ukuran: <strong>{stats.totalSizeFormatted}</strong>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmptyTrashModal;
