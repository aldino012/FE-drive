// src/pages/section_home/components/viewers/ImageViewer.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaDownload,
  FaPlus,
  FaMinus,
  FaUndo,
  FaExpand,
  FaCompress,
  FaSearchPlus,
  FaExclamationTriangle,
  FaEllipsisH,
} from "react-icons/fa";
import { getViewUrl } from "../../../../api/viewApi";

const ImageViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Touch state
  const [initialPinchDistance, setInitialPinchDistance] = useState(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState(1);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // PERBAIKAN: Pastikan path benar - gunakan file.path atau file.name
  const filePath = file.path || file.name || "";
  const imageUrl = getViewUrl(filePath);
  const fileName = file.name || "image.jpg";

  useEffect(() => {
    console.log("🔍 ImageViewer Debug:");
    console.log("  File object:", file);
    console.log("  File path:", file.path);
    console.log("  File name:", file.name);
    console.log("  Image URL:", imageUrl);
  }, [file, imageUrl]);

  // ============ RESPONSIVE: Detect screen size ============
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ============ LOCK BODY SCROLL ============
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ============ FULLSCREEN CHANGE LISTENER ============
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ============ CLOSE MOBILE MENU ON CLICK OUTSIDE ============
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileMenu]);

  // ============ KEYBOARD SHORTCUTS ============
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore jika user sedang mengetik di input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case "Escape":
          if (showMobileMenu) {
            setShowMobileMenu(false);
          } else {
            onClose();
          }
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
        case "0":
          handleReset();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showMobileMenu]);

  // ============ ZOOM HANDLERS ============
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setShowMobileMenu(false);
  };

  // ============ ROTATE HANDLER ============
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // ============ FULLSCREEN HANDLER ============
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
    setShowMobileMenu(false);
  };

  // ============ DOUBLE TAP TO ZOOM (Mobile) ============
  const lastTapRef = useRef(0);
  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      e.preventDefault();
      if (zoom > 1) {
        handleReset();
      } else {
        setZoom(2);
        // Center zoom on tap point (mobile only)
        if (isMobile && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x =
            (e.clientX || e.touches?.[0]?.clientX || rect.width / 2) -
            rect.width / 2;
          const y =
            (e.clientY || e.touches?.[0]?.clientY || rect.height / 2) -
            rect.height / 2;
          setPosition({ x: -x, y: -y });
        }
      }
    }
    lastTapRef.current = now;
  };

  // ============ MOUSE WHEEL ZOOM ============
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Hanya zoom jika cursor berada di area gambar
      if (e.target.closest("[data-image-area]")) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 5));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // ============ DRAG/PAN HANDLERS ============
  const handleMouseDown = (e) => {
    // Hanya left click
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ============ TOUCH HANDLERS (Mobile) ============
  const getDistance = (touch1, touch2) => {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY,
    );
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialPinchZoom(zoom);
    } else if (e.touches.length === 1) {
      // Single touch for drag
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && initialPinchDistance) {
        // Pinch zoom
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDistance / initialPinchDistance;
        const newZoom = initialPinchZoom * scaleFactor;
        setZoom(Math.min(Math.max(newZoom, 0.25), 5));
      } else if (e.touches.length === 1 && isDragging) {
        // Drag
        e.preventDefault();
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart, initialPinchDistance, initialPinchZoom],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setInitialPinchDistance(null);
  }, []);

  // ============ DOWNLOAD HANDLER ============
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: buka di tab baru
      window.open(imageUrl, "_blank");
    }
    setShowMobileMenu(false);
  };

  // ============ IMAGE ERROR HANDLER ============
  const handleImageError = () => {
    console.error("Failed to load image:", imageUrl);
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // ============ COMPUTED STYLES ============
  const imageTransform = `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`;
  const imageTransition = isDragging
    ? "none"
    : "transform 0.2s ease, opacity 0.3s";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* ============ HEADER / TOOLBAR ============ */}
      <div
        className={`flex items-center justify-between bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-sm border-b border-gray-800/50 ${
          isMobile ? "px-3 py-2 safe-top" : "px-6 py-4"
        }`}
      >
        {/* File Info - Responsive */}
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <h2
            className={`text-white font-semibold truncate ${
              isMobile ? "text-sm" : "text-lg"
            }`}
          >
            {fileName}
          </h2>
          {file.sizeFormatted && !isMobile && (
            <span className="text-gray-400 text-xs whitespace-nowrap">
              {file.sizeFormatted}
            </span>
          )}
        </div>

        {/* Action Buttons - Desktop */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-800/80 rounded-lg px-2 py-1">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <FaMinus className="w-4 h-4" />
              </button>
              <span className="text-white text-sm font-mono min-w-[50px] text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleRotate}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Rotate (R)"
              aria-label="Rotate"
            >
              <FaUndo className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset (0)"
              aria-label="Reset"
            >
              <FaSearchPlus className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen (F)"
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <FaCompress className="w-5 h-5" />
              ) : (
                <FaExpand className="w-5 h-5" />
              )}
            </button>

            <div className="w-px h-6 bg-gray-700 mx-1"></div>

            <button
              onClick={handleDownload}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Download"
              aria-label="Download"
            >
              <FaDownload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
              title="Close (ESC)"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Action Buttons - Mobile (Simplified) */}
        {isMobile && (
          <div className="flex items-center gap-1">
            {/* Zoom indicator & quick zoom */}
            <div className="flex items-center bg-gray-800/80 rounded-lg">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-300 hover:text-white active:bg-gray-700 rounded transition-colors"
                aria-label="Zoom Out"
              >
                <FaMinus className="w-3.5 h-3.5" />
              </button>
              <span className="text-white text-xs font-mono min-w-[40px] text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-300 hover:text-white active:bg-gray-700 rounded transition-colors"
                aria-label="Zoom In"
              >
                <FaPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* More options button */}
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-300 hover:text-white active:bg-gray-700 rounded-lg transition-colors"
                aria-label="More options"
              >
                <FaEllipsisH className="w-5 h-5" />
              </button>

              {/* Mobile dropdown menu */}
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-1 z-50 animate-fadeIn">
                  <button
                    onClick={handleRotate}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <FaUndo className="w-4 h-4" />
                    <span className="text-sm">Putar 90°</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <FaSearchPlus className="w-4 h-4" />
                    <span className="text-sm">Reset</span>
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    {isFullscreen ? (
                      <FaCompress className="w-4 h-4" />
                    ) : (
                      <FaExpand className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
                    </span>
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-700 mx-0.5"></div>

            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white active:bg-red-600 rounded-lg transition-colors"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ============ IMAGE CONTAINER ============ */}
      <div
        data-image-area
        className="flex-1 overflow-hidden flex items-center justify-center relative touch-none select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          handleTouchStart(e);
          handleDoubleTap(e);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isMobile ? handleDoubleTap : undefined}
        style={{
          cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "default",
        }}
      >
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-white border-t-transparent"></div>
              <p className="text-gray-400 text-sm">Memuat gambar...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <FaExclamationTriangle className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-red-500" />
            <p className="text-base sm:text-lg mb-2 text-white">
              Gagal memuat gambar
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-md px-4">
              File mungkin rusak, tidak tersedia, atau format tidak didukung
            </p>
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <FaDownload className="w-4 h-4" />
              Download File
            </button>
          </div>
        )}

        {/* Image */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt={fileName}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`max-w-none transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: imageTransform,
            transition: imageTransition,
          }}
          draggable={false}
        />
      </div>

      {/* ============ MOBILE FOOTER (Simplified) ============ */}
      {isMobile && (
        <div className="px-3 py-2.5 bg-gradient-to-t from-black/90 to-black/70 backdrop-blur-sm border-t border-gray-800/50 safe-bottom">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono text-gray-500">{rotation}°</span>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs">
                Geser & cubit untuk zoom
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============ DESKTOP FOOTER (Shortcuts) ============ */}
      {!isMobile && (
        <div className="px-6 py-3 bg-gradient-to-t from-black/90 to-black/70 backdrop-blur-sm border-t border-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">
                  Scroll
                </kbd>{" "}
                Zoom
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">
                  Drag
                </kbd>{" "}
                Pan
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">
                  R
                </kbd>{" "}
                Rotate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">
                  F
                </kbd>{" "}
                Fullscreen
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">
                  ESC
                </kbd>{" "}
                Close
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-mono">
                {Math.round(zoom * 100)}% | {rotation}°
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
