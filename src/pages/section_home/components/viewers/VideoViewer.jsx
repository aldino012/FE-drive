// src/pages/section_home/components/viewers/VideoViewer.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaTimes,
} from "react-icons/fa";
import { getViewUrl } from "../../../../api/viewApi";

const VideoViewer = ({ file, onClose }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoUrl = getViewUrl(file.path || file.name);
  const fileName = file.name || "video.mp4";

  // ============ HELPERS ============
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // ============ VIDEO CONTROLS ============
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // PENTING: Tangkap promise play() agar tidak terjadi Uncaught AbortError
      videoRef.current.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.error("❌ [VideoViewer] Play error:", err);
        }
      });
    }
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  }, [isPlaying]);

  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // ============ PROGRESS BAR (SCRUBBER) ============
  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const handleProgressDrag = (e) => {
    if (e.buttons !== 1) return; // Hanya drag jika klik kiri tertahan
    handleProgressClick(e);
  };

  // ============ EVENT LISTENERS ============
  // Auto play manual (menggantikan atribut autoPlay agar error bisa ditangkap)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.error("❌ [VideoViewer] AutoPlay error:", err);
        }
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(controlsTimeoutRef.current);
  }, []);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
        onError={(e) => {
          console.error(
            "❌ [VideoViewer] Video gagal dimuat. Kemungkinan server mengembalikan error (400/404).",
            e,
          );
        }}
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 flex flex-col justify-between ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-white text-lg font-semibold truncate max-w-2xl drop-shadow-lg">
            {fileName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-red-500 hover:bg-white/10 rounded-full transition-colors"
            title="Tutup (ESC)"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Center Play Button (Optional, for better UX) */}
        {!isPlaying && !isBuffering && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all transform hover:scale-110"
          >
            <FaPlay className="w-10 h-10 ml-1" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="px-4 md:px-8 pb-6 pt-20">
          {/* Progress Bar Scrubber */}
          <div
            ref={progressBarRef}
            className="group relative h-1.5 bg-white/30 rounded-full cursor-pointer mb-4 hover:h-2.5 transition-all"
            onClick={handleProgressClick}
            onMouseMove={handleProgressDrag}
          >
            {/* Buffered/Loaded bar could go here */}
            <div
              className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? (
                  <FaPause className="w-6 h-6" />
                ) : (
                  <FaPlay className="w-6 h-6" />
                )}
              </button>

              {/* Skip -10s */}
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Mundur 10 detik (←)"
              >
                <FaBackward className="w-5 h-5" />
              </button>

              {/* Skip +10s */}
              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Maju 10 detik (→)"
              >
                <FaForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <FaVolumeMute className="w-5 h-5" />
                  ) : (
                    <FaVolumeUp className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover:w-24 transition-all duration-300 accent-red-600 cursor-pointer"
                />
              </div>

              {/* Time Display */}
              <span className="text-sm font-mono ml-2 hidden sm:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Side Controls */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <FaCompress className="w-5 h-5" />
              ) : (
                <FaExpand className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;