// src/pages/section_trash/components/TrashStatus.jsx
import React from "react";
import { FaTrashAlt } from "react-icons/fa";

const TrashStatus = ({
  notification,
  actionError,
  dataError,
  isDataLoading,
  items,
  searchQuery,
  filterType,
  clearActionError,
}) => {
  // Menentukan teks untuk Empty State
  const isFiltered = searchQuery || filterType !== "all";
  const emptyTitle = isFiltered ? "Tidak ada hasil" : "Tong sampah kosong";
  const emptySubtitle = isFiltered
    ? "Coba kata kunci atau filter lain"
    : "Item yang dihapus akan muncul di sini";

  return (
    <>
      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          } animate-slideIn`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex justify-between items-center">
          <p className="text-red-800 text-sm">{actionError}</p>
          <button
            onClick={clearActionError}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Data Error Banner */}
      {dataError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{dataError}</p>
        </div>
      )}

      {/* Loading State */}
      {isDataLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!isDataLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaTrashAlt className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">{emptyTitle}</p>
          <p className="text-sm mt-1">{emptySubtitle}</p>
        </div>
      )}
    </>
  );
};

export default TrashStatus;
