import React from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { generateSecondaryDominantChain } from '../utils/chordAnalysis';

interface SecondaryDominantChainsProps {
  chord: string;
  currentKey: string;
  onSelectChain: (chord: string) => void;
}

export const SecondaryDominantChains: React.FC<SecondaryDominantChainsProps> = ({
  chord,
  currentKey,
  onSelectChain,
}) => {
  const chains = generateSecondaryDominantChain(chord, currentKey);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Secondary dominant chains leading to {chord}:
      </div>

      <div className="grid gap-3">
        {chains.map((chain, index) => (
          <div
            key={index}
            className="p-3 bg-indigo-50 dark:bg-dark-700 rounded-lg"
          >
            <div className="flex flex-wrap items-center gap-2">
              {chain.map((c, i) => (
                <React.Fragment key={i}>
                  <button
                    onClick={() => onSelectChain(c)}
                    className="px-3 py-1 bg-white dark:bg-dark-600 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-dark-500 transition-colors"
                  >
                    {c}
                  </button>
                  {i < chain.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Chain type: {index === 0 ? 'Extended' : index === 1 ? 'Chromatic' : 'Modal'}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Click any chord to insert it into your progression
      </div>
    </div>
  );
};