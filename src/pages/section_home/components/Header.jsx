// src/pages/section_home/components/Header.jsx
import React from "react";
import SearchBar from "../../../components/SearchBar";
import Breadcrumb from "../../../components/Breadcrumb";

const Header = ({
  searchQuery,
  updateSearchQuery,
  clearSearch,
  isSearching,
  hasSearched,
  breadcrumbs,
  onMenuToggle,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center gap-3">
        {/* Tombol hamburger hanya di mobile */}
        <button
          className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none flex-shrink-0 p-1"
          onClick={onMenuToggle}
          aria-label="Buka menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* PENTING: Wrapper dengan fixed height untuk mencegah layout shift */}
        <div className="flex-1 max-w-2xl min-h-[40px]">
          <SearchBar
            value={searchQuery}
            onChange={updateSearchQuery}
            onClear={clearSearch}
            isLoading={isSearching}
            placeholder="Cari file atau folder..."
          />
        </div>
      </div>

      {/* Breadcrumb - selalu render tapi hidden saat searching */}
      <div
        className={`overflow-x-auto whitespace-nowrap pb-1 touch-pan-x mt-4 transition-all duration-200 ${
          hasSearched ? "opacity-0 h-0 overflow-hidden mt-0" : "opacity-100"
        }`}
      >
        <Breadcrumb items={breadcrumbs} />
      </div>
    </div>
  );
};

export default Header;