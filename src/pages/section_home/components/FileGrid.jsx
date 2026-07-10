// src/pages/section_home/components/FileGrid.jsx
import React from "react";
import { FaFolder, FaEllipsisV, FaEye, FaCheck, FaLock } from "react-icons/fa";
import Card from "../../../components/Card";
import { getFileIcon } from "../utils/fileIcons";
import { formatFileSize } from "../utils/formatters";

const FileGrid = ({
  items,
  isLoading,
  hasSearched,
  onFolderClick,
  onViewFile,
  onContextMenu,
  onMoreClick,
  // === PROPS UNTUK MULTI-SELECT ===
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  isSelectMode = false,
  // === PROPS BARU UNTUK LOCK FOLDER ===
  isFolderLocked = () => false, // Fungsi untuk cek status lock folder
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Empty State
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
        <FaFolder className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" />
        <p className="text-base sm:text-lg font-medium text-center">
          {hasSearched ? "Tidak ada hasil pencarian" : "Folder kosong"}
        </p>
        <p className="text-sm mt-1 text-center">
          {hasSearched
            ? "Coba kata kunci lain"
            : "Buat folder atau upload file baru"}
        </p>
      </div>
    );
  }

  // 3. Handler untuk klik pada card
  const handleCardClick = (item) => {
    if (isSelectMode) {
      // Dalam mode select, klik card = toggle select
      onSelectItem(item);
    } else if (item.type === "folder") {
      onFolderClick(item);
    } else {
      onViewFile(item);
    }
  };

  // 4. Handler untuk checkbox
  const handleCheckboxClick = (e, item) => {
    e.stopPropagation();
    onSelectItem(item);
  };

  // Helper: Cek apakah item sudah dipilih
  const isSelected = (item) => {
    return selectedItems.some((selected) => selected.path === item.path);
  };

  // Helper: Cek apakah semua item di halaman ini sudah dipilih
  const allSelected =
    items.length > 0 && items.every((item) => isSelected(item));

  // 5. Files/Folders Grid
  return (
    <div>
      {/* Select All Checkbox - hanya muncul saat ada items */}
      {items.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div
              onClick={() => onSelectAll()}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                allSelected
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300 group-hover:border-blue-400"
              }`}
            >
              {allSelected && <FaCheck className="text-white text-xs" />}
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900">
              {allSelected ? "Batal pilih semua" : "Pilih semua"}
            </span>
          </label>

          {selectedItems.length > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedItems.length} item dipilih
            </span>
          )}
        </div>
      )}

      {/* Grid Items */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {items.map((item) => {
          const selected = isSelected(item);
          const isLocked = item.type === "folder" && isFolderLocked(item.path);

          return (
            <div
              key={item.id || item.path}
              className="relative group"
              onContextMenu={(e) => onContextMenu(e, item)}
            >
              <Card
                onClick={() => handleCardClick(item)}
                padding="p-2.5 sm:p-3 md:p-4"
                className={`flex flex-col items-center text-center relative touch-manipulation cursor-pointer transition-all ${
                  selected
                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                    : isLocked
                      ? "border-orange-300 bg-orange-50 hover:border-orange-400 hover:shadow-md"
                      : "hover:border-blue-400 hover:shadow-md"
                }`}
              >
                {/* CHECKBOX - Pojok kiri atas */}
                <div
                  onClick={(e) => handleCheckboxClick(e, item)}
                  className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300 hover:border-blue-400"
                  } ${
                    // Selalu visible di select mode, hover di desktop saat normal
                    isSelectMode || selected
                      ? "opacity-100"
                      : "lg:opacity-0 lg:group-hover:opacity-100"
                  }`}
                >
                  {selected && <FaCheck className="text-white text-xs" />}
                </div>

                {/* LOCK INDICATOR - Pojok kanan bawah (hanya untuk folder yang di-lock) */}
                {isLocked && (
                  <div
                    className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-20 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-md"
                    title="Folder ini dikunci"
                  >
                    <FaLock className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* View Button - pojok kiri atas (hanya untuk file, geser kanan saat checkbox muncul) */}
                {item.type !== "folder" && !isSelectMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewFile(item);
                    }}
                    className="absolute top-1.5 left-8 p-2 rounded-full bg-blue-100 hover:bg-blue-200 active:bg-blue-300 lg:bg-white lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 shadow-sm sm:top-2 sm:left-9 z-10"
                    title="Lihat / Preview"
                    aria-label="Lihat file"
                  >
                    <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </button>
                )}

                {/* More Button - pojok kanan atas */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreClick(e, item);
                  }}
                  className="absolute top-1.5 right-1.5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 lg:bg-white lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 shadow-sm sm:top-2 sm:right-2 z-10"
                  title="Opsi lainnya"
                  aria-label="Menu opsi"
                >
                  <FaEllipsisV className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                </button>

                {/* Icon */}
                <div className="mb-2 sm:mb-3 mt-1 relative">
                  {item.type === "folder" ? (
                    <FaFolder
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${
                        selected
                          ? "text-blue-600"
                          : isLocked
                            ? "text-orange-500"
                            : "text-blue-500"
                      }`}
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                      {getFileIcon(item.name)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <p
                  className={`text-xs sm:text-sm font-medium truncate w-full max-w-[100px] sm:max-w-[120px] md:max-w-[150px] ${
                    selected
                      ? "text-blue-900"
                      : isLocked
                        ? "text-orange-900"
                        : "text-gray-900"
                  }`}
                  title={item.name}
                >
                  {item.name}
                </p>

                {/* Meta info */}
                {item.type === "file" && item.size && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    {formatFileSize(item.size)}
                  </p>
                )}

                {/* Badge "Terkunci" untuk folder yang di-lock */}
                {isLocked && (
                  <div className="mt-1 px-2 py-0.5 bg-orange-100 border border-orange-300 rounded-full">
                    <span className="text-[10px] sm:text-xs font-medium text-orange-700 flex items-center gap-1">
                      <FaLock className="w-2 h-2" />
                      Terkunci
                    </span>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileGrid;