import React, { useState } from 'react';
import { Music, Play, Edit2, X } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { CHORD_POOLS, NOTES } from '../utils/chordDatabase';
import { useChordSelectionStore } from '../stores/chordSelectionStore';

const CHORD_QUALITIES = {
  basic: ['', 'm', 'dim', 'aug'],
  seventh: ['7', 'maj7', 'm7', 'm7b5', 'dim7', 'mM7'],
  extended: ['9', 'maj9', 'm9', '11', 'maj11', 'm11', '13', 'maj13', 'm13'],
  altered: ['7#5', '7b5', '7#9', '7b9', '7#11', '7b13', '7alt'],
  suspended: ['sus2', 'sus4', '7sus4'],
  added: ['add9', '6', '6/9'],
};

interface ChordCardProps {
  chord: string;
  index: number;
  mode: string;
  romanNumeral?: string;
  onChordChange: (index: number, newChord: string) => void;
}

export const ChordCard: React.FC<ChordCardProps> = ({
  chord,
  index,
  mode,
  romanNumeral,
  onChordChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { selectedChordIndex, setSelectedChordIndex } = useChordSelectionStore();
  
  // Parse current chord into root and quality
  const chordRoot = chord.match(/^[A-G][#b]?/)?.[0] || 'C';
  const chordQuality = chord.slice(chordRoot.length);
  
  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      await audioEngine.playChord(chord, 2);
    } catch (error) {
      console.error('Error playing chord:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setSelectedChordIndex(index);
    }
  };

  const handleRootChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoot = e.target.value;
    onChordChange(index, `${newRoot}${chordQuality}`);
  };

  const handleQualityChange = (quality: string) => {
    onChordChange(index, `${chordRoot}${quality}`);
  };

  const getQualityCategory = (quality: string): string => {
    for (const [category, qualities] of Object.entries(CHORD_QUALITIES)) {
      if (qualities.includes(quality)) return category;
    }
    return 'basic';
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all
        ${selectedChordIndex === index 
          ? 'bg-indigo-100 ring-2 ring-indigo-500' 
          : 'bg-indigo-50 hover:bg-indigo-100'}`}
      onClick={handleClick}
    >
      <div className="flex justify-between w-full mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          disabled={isPlaying}
          className={`p-1 ${isPlaying ? 'text-indigo-400' : 'text-indigo-600 hover:text-indigo-800'}`}
          title="Play chord"
        >
          <Play className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(!isEditing);
          }}
          className="p-1 text-indigo-600 hover:text-indigo-800"
          title={isEditing ? 'Close editor' : 'Edit chord'}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </div>

      {isEditing ? (
        <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={chordRoot}
            onChange={handleRootChange}
            className="w-full px-2 py-1 text-sm border border-indigo-300 rounded-md mb-2"
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(CHORD_QUALITIES).map(([category, qualities]) => (
              <div key={category} className="space-y-1">
                <div className="text-xs font-medium text-indigo-600 capitalize">
                  {category}
                </div>
                <div className="flex flex-wrap gap-1">
                  {qualities.map((quality) => (
                    <button
                      key={quality}
                      onClick={() => handleQualityChange(quality)}
                      className={`px-2 py-1 text-xs rounded-md ${
                        quality === chordQuality
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {quality || '♮'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">{chord}</div>
          {romanNumeral && (
            <div className="text-sm text-gray-500">{romanNumeral}</div>
          )}
        </div>
      )}
    </div>
  );
};