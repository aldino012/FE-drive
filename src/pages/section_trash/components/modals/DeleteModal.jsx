// src/pages/section_trash/components/modals/DeleteModal.jsx
import React from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";

const DeleteModal = ({
  isOpen,
  deleteModal,
  setDeleteModal,
  isActionLoading,
  loadingAction,
  handleDeletePermanent,
}) => {
  // Handler untuk menutup modal (mencegah penutupan saat loading)
  const handleClose = () => {
    if (!isActionLoading) {
      setDeleteModal({ isOpen: false, item: null });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Hapus Permanen"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, item: null })}
            disabled={isActionLoading}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletePermanent}
            disabled={isActionLoading}
            isLoading={isActionLoading && loadingAction === "delete"}
            leftIcon={<FaTrash className="w-4 h-4" />}
          >
            Hapus Permanen
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
              Apakah Anda yakin ingin menghapus item ini secara permanen?
            </p>
            <p className="text-xs text-red-700 mt-1">
              Tindakan ini tidak dapat dibatalkan. Item akan dihapus selamanya
              dari sistem.
            </p>
          </div>
        </div>

        {/* Detail Item */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            <strong>Nama:</strong> {deleteModal.item?.originalName}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Tipe:</strong>{" "}
            {deleteModal.item?.type === "folder" ? "Folder" : "File"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Ukuran:</strong> {deleteModal.item?.sizeFormatted}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Dihapus:</strong> {deleteModal.item?.deletedAtFormatted}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
