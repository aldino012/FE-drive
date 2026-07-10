// src/pages/section_trash/components/modals/RestoreModal.jsx
import React from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import { FaUndo } from "react-icons/fa";

const RestoreModal = ({
  isOpen,
  restoreModal,
  setRestoreModal,
  isActionLoading,
  loadingAction,
  handleRestore,
}) => {
  // Handler untuk menutup modal (mencegah penutupan saat loading)
  const handleClose = () => {
    if (!isActionLoading) {
      setRestoreModal({ isOpen: false, item: null, destination: "/" });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Kembalikan Item"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              setRestoreModal({ isOpen: false, item: null, destination: "/" })
            }
            disabled={isActionLoading}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleRestore}
            disabled={!restoreModal.destination.trim() || isActionLoading}
            isLoading={isActionLoading && loadingAction === "restore"}
            leftIcon={<FaUndo className="w-4 h-4" />}
          >
            Kembalikan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Detail Item */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900 font-medium mb-1">
            Item yang akan dikembalikan:
          </p>
          <p className="text-sm text-blue-800">
            <strong>{restoreModal.item?.originalName}</strong>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Tipe: {restoreModal.item?.type === "folder" ? "Folder" : "File"}
          </p>
        </div>

        {/* Input Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kembalikan ke folder:
          </label>
          <input
            type="text"
            value={restoreModal.destination}
            onChange={(e) =>
              setRestoreModal({
                ...restoreModal,
                destination: e.target.value,
              })
            }
            placeholder="Contoh: /Documents atau /Images"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            disabled={isActionLoading}
            autoFocus
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                restoreModal.destination.trim() &&
                !isActionLoading
              ) {
                handleRestore();
              }
            }}
          />
        </div>

        {/* Tip */}
        <p className="text-xs text-gray-500">
          💡 Tip: Gunakan path absolut seperti{" "}
          <code className="bg-gray-100 px-1 rounded">/Documents</code> atau{" "}
          <code className="bg-gray-100 px-1 rounded">/</code> untuk root
        </p>
      </div>
    </Modal>
  );
};

export default RestoreModal;
