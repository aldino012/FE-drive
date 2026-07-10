import React, { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const RenameModal = ({
  isOpen,
  onClose,
  item,
  renameItem,
  isActionLoading,
  onSuccess,
  onError,
}) => {
  const [newName, setNewName] = useState("");

  // Reset newName saat modal dibuka atau item berubah
  useEffect(() => {
    if (isOpen && item) {
      setNewName(item.name);
    } else {
      setNewName("");
    }
  }, [isOpen, item]);

  const handleClose = () => {
    if (!isActionLoading) {
      onClose();
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) return;

    const result = await renameItem(item, newName);

    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      onError(result.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ubah Nama"
      size="md"
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
            onClick={handleRename}
            disabled={!newName.trim() || isActionLoading}
            isLoading={isActionLoading}
          >
            Simpan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Baru
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Masukkan nama baru"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isActionLoading}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim() && !isActionLoading) {
                handleRename();
              }
            }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Nama lama: <span className="font-semibold">{item?.name}</span>
        </p>
      </div>
    </Modal>
  );
};

export default RenameModal;
