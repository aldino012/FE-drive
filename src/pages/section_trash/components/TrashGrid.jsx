// src/pages/section_trash/components/TrashGrid.jsx
import React from "react";
import Card from "../../../components/Card";
import { FaFolder, FaUndo, FaTrash } from "react-icons/fa";
import { getFileIcon } from "../utils/fileIcons";

const TrashGrid = ({
  items,
  isDataLoading,
  isActionLoading,
  openRestoreModal,
  openDeleteModal,
}) => {
  // Jika sedang loading atau item kosong, jangan render apa-apa
  // (Kondisi ini sudah ditangani oleh TrashStatus)
  if (isDataLoading || items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <Card
          key={item.trashName}
          padding="p-4"
          className="flex flex-col items-center text-center hover:border-red-400 relative group"
        >
          {/* Icon */}
          <div className="mb-3">
            {item.type === "folder" ? (
              <FaFolder className="w-12 h-12 text-gray-400" />
            ) : (
              getFileIcon(item.originalName)
            )}
          </div>

          {/* Name */}
          <p
            className="text-sm font-medium text-gray-900 truncate w-full mb-1"
            title={item.originalName}
          >
            {item.originalName}
          </p>

          {/* Meta info */}
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{item.sizeFormatted}</p>
            <p>{item.deletedAtFormatted}</p>
          </div>

          {/* Action Buttons (appear on hover) */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => openRestoreModal(item)}
              disabled={isActionLoading}
              className="p-1.5 rounded-full bg-white hover:bg-blue-50 shadow-sm transition-colors disabled:opacity-50"
              title="Kembalikan"
            >
              <FaUndo className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              onClick={() => openDeleteModal(item)}
              disabled={isActionLoading}
              className="p-1.5 rounded-full bg-white hover:bg-red-50 shadow-sm transition-colors disabled:opacity-50"
              title="Hapus permanen"
            >
              <FaTrash className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TrashGrid;
