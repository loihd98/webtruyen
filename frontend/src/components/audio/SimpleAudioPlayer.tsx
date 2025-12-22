"use client";

import React, { useState, useRef, useEffect } from "react";

interface SimpleAudioPlayerProps {
  src: string;
  title: string;
}

const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({
  src,
  title,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showRemainingTime, setShowRemainingTime] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error("Audio loading error");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLoop;
    }
  }, [isLoop]);

  // Close speed menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".speed-menu-container")) {
        setShowSpeedMenu(false);
      }
    };

    if (showSpeedMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSpeedMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.body) return; // Only work when not in input fields

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          skipBackward();
          break;
        case "ArrowRight":
          event.preventDefault();
          skipForward();
          break;
        case "ArrowUp":
          event.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case "ArrowDown":
          event.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case "l":
        case "L":
          event.preventDefault();
          toggleLoop();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
          {/* <span className="text-blue-500">🎧</span>
          <span className="flex-1">{title}</span> */}

        </h4>
      </div>

      {/* Progress bar - Always on separate row on mobile */}
      <div className="mb-3">
        <div className="mb-2 relative group">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeek}
            className="w-full h-3 sm:h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider hover:h-4 sm:hover:h-3 transition-all duration-200"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, #E5E7EB ${progressPercentage}%, #E5E7EB 100%)`,
            }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
          <span>{formatTime(currentTime)}</span>
          <button
            onClick={() => setShowRemainingTime(!showRemainingTime)}
            className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Click để chuyển đổi hiển thị thời gian"
          >
            {showRemainingTime
              ? `-${formatTime(duration - currentTime)}`
              : formatTime(duration)}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {/* Skip backward button */}
        <button
          onClick={skipBackward}
          disabled={isLoading}
          className="flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors"
          title="Tua lại 10s"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>

        {/* Main play/pause button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex-shrink-0 w-12 h-12 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          {isLoading ? (
            <div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4 ml-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Skip forward button */}
        <button
          onClick={skipForward}
          disabled={isLoading}
          className="flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors"
          title="Tua tới 10s"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
        </button>
      </div>

      {/* Secondary controls - Volume, Loop, Speed */}
      <div className="flex items-center justify-center gap-4 mb-3">
        {/* Volume control */}
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-600 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.906 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.906l3.477-2.816a1 1 0 011.617.816zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100
                }%, #D1D5DB ${volume * 100}%, #D1D5DB 100%)`,
            }}
          />
        </div>

        {/* Loop button */}
        <button
          onClick={toggleLoop}
          className={`flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${isLoop
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
            }`}
          title="Lặp lại"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Speed control */}
        <div className="relative speed-menu-container">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors text-xs font-medium"
            title="Tốc độ phát"
          >
            {playbackRate}x
          </button>

          {/* Speed menu */}
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`block w-full px-3 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${speed === playbackRate
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional info and controls */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 ">
        <div className="flex items-center gap-4">
          {/* <a
            href={src}
            download
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            📥 Tải xuống
          </a> */}
          {isPlaying && (
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div
                className="w-1 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          )}
          {isLoop && (
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
              🔄 Lặp lại
            </span>
          )}
          {playbackRate !== 1 && (
            <span className="text-orange-600 dark:text-orange-400">
              ⚡ {playbackRate}x
            </span>
          )}
        </div>

        <div className="text-right">
          <div className="group relative">
            <span className="cursor-help">⌨️ Phím tắt</span>
            <div className="invisible group-hover:visible absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap z-20">
              <div>Space: Phát/Dừng</div>
              <div>← →: Tua lại/tới 10s</div>
              <div>↑ ↓: Tăng/giảm âm lượng</div>
              <div>L: Bật/tắt lặp lại</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAudioPlayer;
