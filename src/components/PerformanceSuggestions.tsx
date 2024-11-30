import React, { useState } from 'react';
import { Music, Play, Pause, RefreshCw } from 'lucide-react';
import { Scale, Chord } from 'tonal';
import * as Tone from 'tone';

interface PerformanceSuggestionsProps {
  chord: string;
  nextChord?: string;
  scale: string;
}

interface Pattern {
  name: string;
  notes: string[];
  rhythm: string;
  style: string;
}

export const PerformanceSuggestions: React.FC<PerformanceSuggestionsProps> = ({
  chord,
  nextChord,
  scale,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);

  const generatePatterns = (chord: string, scale: string): Pattern[] => {
    const chordInfo = Chord.get(chord);
    const scaleNotes = Scale.get(`${chordInfo.tonic} ${scale}`).notes;
    
    return [
      {
        name: 'Chord Tones',
        notes: chordInfo.notes,
        rhythm: '4n',
        style: 'Basic',
      },
      {
        name: 'Scale Run',
        notes: scaleNotes,
        rhythm: '8n',
        style: 'Linear',
      },
      {
        name: 'Arpeggiated',
        notes: [...chordInfo.notes, ...chordInfo.notes.reverse()],
        rhythm: '16n',
        style: 'Flowing',
      },
      {
        name: 'Approach Notes',
        notes: scaleNotes.filter(note => !chordInfo.notes.includes(note)),
        rhythm: '8n',
        style: 'Jazz',
      },
    ];
  };

  const playPattern = async (pattern: Pattern) => {
    if (!Tone.Transport.started) {
      await Tone.start();
    }

    setCurrentPattern(pattern);
    setIsPlaying(true);

    const synth = new Tone.PolySynth().toDestination();
    const sequence = new Tone.Sequence(
      (time, note) => {
        synth.triggerAttackRelease(note + '4', '8n', time);
      },
      pattern.notes,
      pattern.rhythm
    );

    Tone.Transport.start();
    sequence.start(0);

    // Stop after playing through the sequence
    setTimeout(() => {
      sequence.stop();
      synth.dispose();
      setIsPlaying(false);
      setCurrentPattern(null);
      Tone.Transport.stop();
    }, pattern.notes.length * 500);
  };

  const patterns = generatePatterns(chord, scale);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Performance Suggestions
          </h3>
        </div>
      </div>

      <div className="grid gap-3">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {pattern.name}
              </span>
              <button
                onClick={() => playPattern(pattern)}
                disabled={isPlaying}
                className={`p-2 rounded-full ${
                  isPlaying && currentPattern?.name === pattern.name
                    ? 'bg-red-100 text-red-600'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                {isPlaying && currentPattern?.name === pattern.name ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {pattern.notes.map((note, i) => (
                <div
                  key={i}
                  className={`px-2 py-1 rounded-full text-sm ${
                    chord.includes(note)
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {note}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Style: {pattern.style}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Practice Tips
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Start slow and gradually increase tempo</li>
          <li>• Focus on smooth transitions between patterns</li>
          <li>• Mix chord tones with scale runs</li>
          <li>• Use approach notes for tension and release</li>
        </ul>
      </div>
    </div>
  );
};