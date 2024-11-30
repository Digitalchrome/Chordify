import React from 'react';
import { motion } from 'framer-motion';
import { Chord, Note } from 'tonal';
import { ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react';

interface VoiceLeadingFlowProps {
  currentChord: string;
  nextChord: string;
}

interface VoiceMovement {
  from: string;
  to: string;
  interval: number;
  motion: 'ascending' | 'descending' | 'static';
  distance: number;
}

export const VoiceLeadingFlow: React.FC<VoiceLeadingFlowProps> = ({
  currentChord,
  nextChord,
}) => {
  const current = Chord.get(currentChord);
  const next = Chord.get(nextChord);

  if (!current.notes.length || !next.notes.length) return null;

  const analyzeVoiceMovement = (note1: string, note2: string): VoiceMovement => {
    const midi1 = Note.midi(note1 + '4') || 60;
    const midi2 = Note.midi(note2 + '4') || 60;
    const distance = midi2 - midi1;
    
    return {
      from: note1,
      to: note2,
      interval: Math.abs(distance),
      motion: distance > 0 ? 'ascending' : distance < 0 ? 'descending' : 'static',
      distance: Math.abs(distance),
    };
  };

  const movements = current.notes.map((note, i) => {
    if (i >= next.notes.length) return null;
    return analyzeVoiceMovement(note, next.notes[i]);
  }).filter((m): m is VoiceMovement => m !== null);

  const getMotionColor = (movement: VoiceMovement): string => {
    if (movement.distance > 7) return 'text-red-500 dark:text-red-400'; // Large leap
    if (movement.distance > 4) return 'text-yellow-500 dark:text-yellow-400'; // Medium leap
    if (movement.distance === 0) return 'text-blue-500 dark:text-blue-400'; // Static
    return 'text-green-500 dark:text-green-400'; // Smooth
  };

  const getMotionIcon = (motion: VoiceMovement['motion']) => {
    switch (motion) {
      case 'ascending':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'descending':
        return <ArrowDownRight className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr,2fr,1fr] gap-4">
        {/* Current Chord */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Current</div>
          {current.notes.map((note, i) => (
            <div
              key={`current-${i}`}
              className="px-3 py-2 bg-indigo-50 dark:bg-dark-700 rounded text-center"
            >
              {note}
            </div>
          ))}
        </div>

        {/* Voice Movement Visualization */}
        <div className="relative">
          <svg className="w-full h-full" preserveAspectRatio="none">
            {movements.map((movement, i) => {
              const y1 = (i * 48) + 32;
              const y2 = (i * 48) + 32 + (movement.motion === 'ascending' ? -8 : movement.motion === 'descending' ? 8 : 0);

              return (
                <motion.path
                  key={`path-${i}`}
                  d={`M 0,${y1} C 100,${y1} 100,${y2} 200,${y2}`}
                  stroke={getMotionColor(movement).replace('text-', 'stroke-')}
                  strokeWidth={2}
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              );
            })}
          </svg>

          {/* Interval Labels */}
          {movements.map((movement, i) => (
            <div
              key={`label-${i}`}
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{ top: `${(i * 48) + 24}px` }}
            >
              <div className={`flex items-center gap-1 ${getMotionColor(movement)}`}>
                {getMotionIcon(movement.motion)}
                <span className="text-xs">
                  {movement.interval} semitones
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Chord */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Next</div>
          {next.notes.map((note, i) => (
            <div
              key={`next-${i}`}
              className="px-3 py-2 bg-indigo-50 dark:bg-dark-700 rounded text-center"
            >
              {note}
            </div>
          ))}
        </div>
      </div>

      {/* Analysis */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Voice Leading Analysis
        </div>
        {movements.map((movement, i) => (
          <div
            key={`analysis-${i}`}
            className={`flex items-center justify-between p-2 rounded ${
              movement.distance > 7
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-gray-50 dark:bg-dark-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">Voice {i + 1}:</span>
              <span className={`flex items-center gap-1 ${getMotionColor(movement)}`}>
                {getMotionIcon(movement.motion)}
                {movement.from} → {movement.to}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {movement.distance > 7 ? (
                <span className="text-red-500 dark:text-red-400">Large leap!</span>
              ) : movement.distance > 4 ? (
                <span className="text-yellow-500 dark:text-yellow-400">Medium leap</span>
              ) : movement.distance === 0 ? (
                <span className="text-blue-500 dark:text-blue-400">Static</span>
              ) : (
                <span className="text-green-500 dark:text-green-400">Smooth motion</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <div className="font-medium">Motion Types:</div>
          <div>• Contrary: Opposite directions</div>
          <div>• Parallel: Same direction</div>
          <div>• Oblique: One voice static</div>
          <div>• Smooth: Less than or equal to 2 semitones</div>
          <div>• Large leap: More than 4 semitones</div>
        </div>
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <div className="font-medium">Best Practices:</div>
          <div>• Avoid parallel fifths/octaves</div>
          <div>• Minimize large leaps</div>
          <div>• Resolve leading tones up</div>
          <div>• Keep common tones static</div>
          <div>• Use contrary motion when possible</div>
        </div>
      </div>
    </div>
  );
};