import React from 'react';
import { ArrowRight, Music } from 'lucide-react';
import { optimizeVoiceLeading } from '../utils/voiceLeadingAnalysis';

interface VoiceLeadingOptimizerProps {
  currentChord: string;
  nextChord?: string;
  onOptimize: (chord: string) => void;
}

export const VoiceLeadingOptimizer: React.FC<VoiceLeadingOptimizerProps> = ({
  currentChord,
  nextChord,
  onOptimize,
}) => {
  if (!nextChord) return null;

  const optimizedVoicings = optimizeVoiceLeading(currentChord, nextChord);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Optimized voice leading suggestions:
      </div>

      <div className="grid gap-3">
        {optimizedVoicings.map((voicing, index) => (
          <button
            key={index}
            onClick={() => onOptimize(voicing.chord)}
            className="p-3 bg-indigo-50 dark:bg-dark-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-dark-600 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Option {index + 1}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Smoothness: {voicing.smoothness}%
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gray-400" />
              <span>{voicing.chord}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span>{nextChord}</span>
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {voicing.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};