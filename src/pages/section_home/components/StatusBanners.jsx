import React from "react";

const StatusBanners = ({
  notification,
  uploadStatus,
  isUploadingFile, // <-- PROPS BARU
  fileUploadProgress, // <-- PROPS BARU
  isUploadingFolder,
  totalFolderFiles,
  uploadedFolderCount,
  getOverallProgress,
  actionError,
  clearActionError,
}) => {
  return (
    <>
      {/* Notification - responsif, tidak menempel di kanan penuh */}
      {notification.show && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          } animate-slideIn`}
        >
          <p className="text-xs sm:text-sm font-medium">
            {notification.message}
          </p>
        </div>
      )}

      {/* Upload Progress (File) - BARU */}
      {isUploadingFile && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="animate-pulse">🚀</span> Progress Upload File
            </p>
            <p className="text-xs sm:text-sm font-semibold text-blue-600">
              {fileUploadProgress}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${fileUploadProgress}%` }}
            ></div>
          </div>
          {uploadStatus && (
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
              {uploadStatus.message}
            </p>
          )}
        </div>
      )}

      {/* Upload Status Banner (Fallback - Hanya muncul jika tidak ada progress bar aktif) */}
      {uploadStatus && !isUploadingFile && !isUploadingFolder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 flex items-center gap-2 sm:gap-3">
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600 flex-shrink-0"></div>
          <p className="text-blue-800 text-xs sm:text-sm font-medium">
            {uploadStatus.message}
          </p>
        </div>
      )}

      {/* Upload Progress (Folder) */}
      {isUploadingFolder && totalFolderFiles > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              📁 Progress Upload Folder
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {uploadedFolderCount} / {totalFolderFiles} file
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
            {getOverallProgress()}% selesai
          </p>
        </div>
      )}

      {/* Action Error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p className="text-red-800 text-xs sm:text-sm">{actionError}</p>
          <button
            onClick={clearActionError}
            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium self-end sm:self-auto"
          >
            Tutup
          </button>
        </div>
      )}
    </>
  );
};

export default StatusBanners;
