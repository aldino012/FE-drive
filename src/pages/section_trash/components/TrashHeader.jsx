// src/pages/section_trash/components/TrashHeader.jsx
import React from "react";
import SearchBar from "../../../components/SearchBar";
import Button from "../../../components/Button";
import { FaTrashAlt, FaTrash, FaFilter } from "react-icons/fa";

const TrashHeader = ({
  stats,
  searchQuery,
  filterType,
  isActionLoading,
  loadingAction,
  updateSearchQuery,
  updateFilterType,
  clearFilters,
  openEmptyModal,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Title & Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaTrashAlt className="text-red-500" />
            Tong Sampah
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {stats.total} item • {stats.totalSizeFormatted}
          </p>
        </div>

        {/* Empty Trash Button */}
        {stats.total > 0 && (
          <Button
            variant="danger"
            onClick={openEmptyModal}
            disabled={isActionLoading && loadingAction === "empty"}
            isLoading={isActionLoading && loadingAction === "empty"}
            leftIcon={<FaTrash className="w-4 h-4" />}
          >
            Kosongkan Trash
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            onClear={clearFilters}
            placeholder="Cari di tong sampah..."
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => updateFilterType(e.target.value)}
            className="px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">Semua</option>
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </select>
          <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default TrashHeader;
