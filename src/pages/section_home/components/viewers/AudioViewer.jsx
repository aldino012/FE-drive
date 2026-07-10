// src/pages/section_home/components/viewers/AudioViewer.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaTimes,
  FaMusic,
} from "react-icons/fa";
import { getViewUrl } from "../../../../api/viewApi";

const AudioViewer = ({ file, onClose }) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  const audioUrl = getViewUrl(file.path || file.name);
  const fileName = file.name || "audio.mp3";

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
    }, 5000); // Hilang lebih lama untuk audio (5 detik)
  };

  // ============ AUDIO CONTROLS ============
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        if (err.name !== "AbortError") console.error("Play error:", err);
      });
    }
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  }, [isPlaying]);

  const skip = (seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  // ============ PROGRESS BAR ============
  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  const handleProgressDrag = (e) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  // ============ EVENT LISTENERS ============
  // Auto play manual
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        if (err.name !== "AbortError") console.error("AutoPlay error:", err);
      });
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
    };
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
          skip(-5); // Audio skip 5 detik
          break;
        case "arrowright":
          e.preventDefault();
          skip(5); // Audio skip 5 detik
          break;
        case "m":
          toggleMute();
          break;
        case "escape":
          onClose();
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

  useEffect(() => {
    return () => clearTimeout(controlsTimeoutRef.current);
  }, []);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col"
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onError={(e) => console.error("Audio failed to load", e)}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md z-10">
        <h2 className="text-white text-lg font-semibold truncate max-w-2xl drop-shadow-lg flex items-center gap-3">
          <FaMusic className="text-purple-400" />
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

      {/* Center Content (Album Art / Icon) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-gray-900 to-gray-900 pointer-events-none" />

        {/* Music Icon with Pulse Animation */}
        <div
          className={`relative z-10 p-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl transition-transform duration-500 ${isPlaying ? "scale-100 animate-pulse-slow" : "scale-90 opacity-80"}`}
        >
          <FaMusic className="w-24 h-24 text-white drop-shadow-lg" />
        </div>

        {/* Buffering Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        className={`px-4 md:px-8 pb-8 pt-4 bg-black/40 backdrop-blur-md transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="group relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-6 hover:h-2.5 transition-all"
          onClick={handleProgressClick}
          onMouseMove={handleProgressDrag}
        >
          <div
            className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-4 bg-white text-gray-900 hover:bg-gray-200 rounded-full transition-colors shadow-lg"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <FaPause className="w-6 h-6" />
              ) : (
                <FaPlay className="w-6 h-6 ml-1" />
              )}
            </button>

            {/* Skip -5s */}
            <button
              onClick={() => skip(-5)}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
              title="Mundur 5 detik (←)"
            >
              <FaBackward className="w-5 h-5" />
            </button>

            {/* Skip +5s */}
            <button
              onClick={() => skip(5)}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
              title="Maju 5 detik (→)"
            >
              <FaForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group ml-2">
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
                className="w-0 group-hover:w-24 transition-all duration-300 accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm font-mono ml-4 hidden sm:block text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioViewer;