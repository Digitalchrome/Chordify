import React from 'react';
import { Play, Pause, Music } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  tempo: number;
  onPlay: () => void;
  onTempoChange: (tempo: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  tempo,
  onPlay,
  onTempoChange,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <button
        onClick={onPlay}
        className={`flex items-center gap-2 px-4 py-2 ${
          isPlaying 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white rounded-md transition-colors`}
      >
        {isPlaying ? (
          <>
            <Pause size={20} /> Stop
          </>
        ) : (
          <>
            <Play size={20} /> Play
          </>
        )}
      </button>

      <div className="flex items-center gap-2">
        <Music size={20} className="text-indigo-600" />
        <input
          type="range"
          min="60"
          max="200"
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className="w-32 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600 min-w-[4rem]">
          {tempo} BPM
        </span>
      </div>
    </div>
  );
};