// src/components/Pagination.jsx
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * Pagination Component - Navigasi halaman untuk list file/folder
 *
 * @param {Object} props
 * @param {number} props.currentPage - Halaman yang sedang aktif (dimulai dari 1)
 * @param {number} props.totalPages - Total keseluruhan halaman
 * @param {Function} props.onPageChange - Handler ketika halaman di-klik
 * @param {number} props.maxPageNumbers - Jumlah maksimal angka halaman yang ditampilkan (default: 5)
 * @param {string} props.className - Custom className tambahan
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxPageNumbers = 5,
  className = "",
}) => {
  // Jika total halaman 1 atau kurang, jangan render pagination
  if (totalPages <= 1) return null;

  // Generate array halaman (bisa berisi angka atau string '...' untuk ellipsis)
  const generatePages = () => {
    const pages = [];

    if (totalPages <= maxPageNumbers) {
      // Jika total halaman lebih kecil dari max, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Selalu tampilkan halaman pertama
      pages.push(1);

      // Hitung range halaman di tengah
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust jika di dekat halaman awal
      if (currentPage <= 3) {
        start = 2;
        end = Math.min(4, totalPages - 1);
      }
      // Adjust jika di dekat halaman akhir
      else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
        end = totalPages - 1;
      }

      // Tambahkan ellipsis di awal jika perlu
      if (start > 2) pages.push("start-ellipsis");

      // Tambahkan halaman tengah
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Tambahkan ellipsis di akhir jika perlu
      if (end < totalPages - 1) pages.push("end-ellipsis");

      // Selalu tampilkan halaman terakhir
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  const baseButtonClass = `
    flex items-center justify-center 
    min-w-[36px] h-9 px-2 
    text-sm font-medium rounded-lg 
    transition-all duration-200
  `;

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Tombol Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          ${baseButtonClass}
          ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }
        `}
        aria-label="Previous page"
      >
        <FaChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Daftar Halaman */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          // Render Ellipsis
          if (typeof page === "string") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center min-w-[36px] h-9 text-sm text-gray-400"
              >
                ...
              </span>
            );
          }

          // Render Angka Halaman
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isActive}
              className={`
                ${baseButtonClass}
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm cursor-default"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Tombol Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          ${baseButtonClass}
          ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }
        `}
        aria-label="Next page"
      >
        <FaChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
};

export default Pagination;
