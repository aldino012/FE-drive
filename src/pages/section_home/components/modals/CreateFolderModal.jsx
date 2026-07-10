import React, { useState } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import apiClient from "../../../../api/axios"; // Pastikan path ini sesuai dengan struktur project Anda

const CreateFolderModal = ({
  isOpen,
  onClose,
  currentPath,
  onSuccess,
  onError,
}) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    if (!isCreating) {
      setNewFolderName("");
      onClose();
    }
  };

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    setIsCreating(true);

    try {
      const folderPath =
        currentPath === "/"
          ? `/${newFolderName.trim()}`
          : `${currentPath}/${newFolderName.trim()}`;

      const response = await apiClient.post("/api/folders/create", {
        folderPath: folderPath,
      });

      if (response.data.success) {
        setNewFolderName("");
        onSuccess(); // Panggil callback sukses dari parent
        handleClose();
      } else {
        throw new Error(response.data.message || "Gagal membuat folder");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat folder";
      onError(errorMessage); // Panggil callback error dari parent
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Buat Folder Baru"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isCreating}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!newFolderName.trim() || isCreating}
            isLoading={isCreating}
          >
            Buat
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Folder
          </label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Masukkan nama folder"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isCreating}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && newFolderName.trim() && !isCreating) {
                handleCreate();
              }
            }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Folder akan dibuat di:{" "}
          <span className="font-mono font-semibold">
            {currentPath === "/" ? "/" : currentPath + "/"}
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default CreateFolderModal;
