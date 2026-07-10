// src/pages/section_home/components/modals/DeleteModal.jsx
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const DeleteModal = ({
  isOpen,
  onClose,
  item,
  deleteItem,
  isActionLoading,
  onSuccess,
  onError,
}) => {
  const handleClose = () => {
    if (!isActionLoading) {
      onClose();
    }
  };

  const handleDelete = async () => {
    const result = await deleteItem(item);

    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      onError(result.error);
    }
  };

  // Cek apakah ini bulk delete (multiple items)
  const isBulkDelete = item?.type === "multiple" && item?.items?.length > 0;
  const itemCount = isBulkDelete ? item.items.length : 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isBulkDelete ? "Hapus Beberapa Item" : "Hapus Item"}
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
            variant="danger"
            onClick={handleDelete}
            disabled={isActionLoading}
            isLoading={isActionLoading}
          >
            {isBulkDelete ? `Hapus ${itemCount} Item` : "Ya, Hapus"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            {isBulkDelete ? (
              <>
                <p className="text-sm text-gray-800 font-medium">
                  Anda akan memindahkan <strong>{itemCount} item</strong> ke
                  tempat sampah.
                </p>
                <div className="mt-3 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <ul className="space-y-1">
                    {item.items.map((it, idx) => (
                      <li
                        key={it.path || idx}
                        className="text-xs text-gray-700 flex items-center gap-2 truncate"
                      >
                        <span className="font-medium">
                          {it.type === "folder" ? "📁" : "📄"}
                        </span>
                        <span className="truncate">{it.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-800">
                  Apakah Anda yakin ingin memindahkan item berikut ke tempat
                  sampah?
                </p>
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                    {item?.path}
                  </p>
                </div>
              </>
            )}
            <p className="text-xs text-gray-500 mt-3">
              💡 Item yang dihapus dapat dipulihkan dari tempat sampah.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;