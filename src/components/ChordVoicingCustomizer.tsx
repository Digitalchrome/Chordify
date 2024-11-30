import React, { useState, useEffect, useRef } from 'react';
import { Note, Chord } from 'tonal';
import * as Tone from 'tone';
import { useVoicingStore } from '../stores/voicingStore';
import { generateVoicings } from '../utils/voicingGenerator';

interface ChordVoicingCustomizerProps {
  chord: string;
  onChange: (voicing: string[]) => void;
  initialVoicing?: string[];
}

export const ChordVoicingCustomizer: React.FC<ChordVoicingCustomizerProps> = ({
  chord,
  onChange,
  initialVoicing
}) => {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const [currentVoicing, setCurrentVoicing] = useState<string[]>(() => {
    if (initialVoicing?.length) return initialVoicing;
    const chordNotes = Chord.get(chord).notes;
    return chordNotes.map(note => `${note}4`); // Start at octave 4
  });

  const { activePresetId, voicingPresets } = useVoicingStore();
  const lastVoicingRef = useRef<string[]>(currentVoicing);

  // Initialize synth
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  // Sort notes by pitch for display
  const sortNotesByPitch = (notes: string[]): string[] => {
    return [...notes].sort((a, b) => {
      const pitchA = Note.midi(a) || 0;
      const pitchB = Note.midi(b) || 0;
      return pitchA - pitchB;
    });
  };

  // Handle preset changes
  useEffect(() => {
    if (!activePresetId) return;
    
    const activePreset = voicingPresets.find(p => p.id === activePresetId);
    if (!activePreset) return;

    const voicingResults = generateVoicings(chord);
    const matchingVoicing = voicingResults.find(v => 
      v.style.name.toLowerCase().includes(activePreset.voicingType.toLowerCase())
    );

    if (matchingVoicing) {
      const newVoicing = sortNotesByPitch(matchingVoicing.notes);
      if (JSON.stringify(newVoicing) !== JSON.stringify(lastVoicingRef.current)) {
        lastVoicingRef.current = newVoicing;
        setCurrentVoicing(newVoicing);
        onChange(newVoicing);
      }
    }
  }, [activePresetId, chord]);

  const transposeOctave = (direction: 'up' | 'down') => {
    const newVoicing = currentVoicing.map(note => {
      const noteName = note.slice(0, -1);
      const octave = parseInt(note.slice(-1));
      const newOctave = direction === 'up' ? octave + 1 : octave - 1;
      return `${noteName}${newOctave}`;
    });
    setCurrentVoicing(newVoicing);
    onChange(newVoicing);
    playVoicing(newVoicing);
  };

  const playVoicing = (notes: string[] = currentVoicing) => {
    if (synthRef.current && notes.length > 0) {
      // Play one octave higher for better sound
      const raisedVoicing = notes.map(note => {
        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1)) + 1;
        return `${noteName}${octave}`;
      });
      synthRef.current.triggerAttackRelease(raisedVoicing, '2n');
    }
  };

  // Notes for the piano roll - 3 octaves should be enough for most voicings
  const notes = React.useMemo(() => {
    const result: string[] = [];
    for (let octave = 3; octave <= 5; octave++) {
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach(note => {
        result.push(`${note}${octave}`);
      });
    }
    return result;
  }, []);

  const handleNoteClick = (note: string) => {
    const isSelected = currentVoicing.includes(note);
    let newVoicing: string[];

    if (isSelected) {
      newVoicing = currentVoicing.filter(n => n !== note);
    } else {
      newVoicing = [...currentVoicing, note].sort((a, b) => 
        (Note.midi(a) || 0) - (Note.midi(b) || 0)
      );
    }

    lastVoicingRef.current = newVoicing;
    setCurrentVoicing(newVoicing);
    onChange(newVoicing);

    if (synthRef.current) {
      // Play the clicked note one octave higher
      const noteName = note.slice(0, -1);
      const octave = parseInt(note.slice(-1)) + 1;
      synthRef.current.triggerAttackRelease(`${noteName}${octave}`, '8n');
    }
  };

  // Display current voicing sorted from lowest to highest
  const displayVoicing = sortNotesByPitch(currentVoicing);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{chord}</h3>
          <p className="text-gray-400 text-sm">Click notes to add/remove them</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => transposeOctave('down')}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition"
            title="Transpose down one octave"
          >
            ▼
          </button>
          <button
            onClick={() => transposeOctave('up')}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition"
            title="Transpose up one octave"
          >
            ▲
          </button>
          <button
            onClick={() => playVoicing()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
          >
            Play ▶
          </button>
        </div>
      </div>

      {/* Piano Roll */}
      <div className="grid grid-cols-12 gap-1 mb-6">
        {notes.map((note) => {
          const isSelected = currentVoicing.includes(note);
          const isBlackKey = note.includes('#');
          return (
            <button
              key={note}
              onClick={() => handleNoteClick(note)}
              className={`
                h-20 rounded-md transition-all
                ${isBlackKey 
                  ? 'bg-gray-900 hover:bg-gray-700' 
                  : 'bg-white hover:bg-gray-200'
                }
                ${isSelected 
                  ? (isBlackKey ? 'ring-2 ring-blue-400' : 'ring-2 ring-blue-500') 
                  : ''
                }
                ${isBlackKey ? 'text-white' : 'text-black'}
                flex items-end justify-center pb-1 text-xs font-medium
              `}
            >
              {note.replace(/\d/, '')}
            </button>
          );
        })}
      </div>

      {/* Current Voicing Display */}
      <div className="bg-gray-700 p-3 rounded-md">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Current Notes:</h4>
        <div className="flex flex-wrap gap-2">
          {displayVoicing.map((note, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
