import React, { useRef, useEffect } from 'react';
import { Chord } from 'tonal';
import { Circle, ArrowRight, Music } from 'lucide-react';

interface ChordVisualizationProps {
  chord: string;
  nextChords: string[];
  probabilities: number[];
}

export const ChordVisualization: React.FC<ChordVisualizationProps> = ({
  chord,
  nextChords,
  probabilities
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw chord visualization
    const chordNotes = Chord.get(chord).notes;
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw circle of fifths
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw chord notes
    const angleStep = (Math.PI * 2) / 12;
    NOTES.forEach((note, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, chordNotes.includes(note) ? 8 : 4, 0, Math.PI * 2);
      ctx.fillStyle = chordNotes.includes(note) ? '#6366f1' : '#e2e8f0';
      ctx.fill();
    });
  }, [chord]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full bg-white dark:bg-dark-800 rounded-lg shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Likely Next Chords
        </h3>
        <div className="grid gap-2">
          {nextChords.map((nextChord, i) => (
            <div
              key={nextChord}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium">{nextChord}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded"
                  style={{ width: `${probabilities[i] * 100}px` }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3ch]">
                  {Math.round(probabilities[i] * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];