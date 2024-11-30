import React from 'react';
import { TrendingUp, AlertTriangle, Music, Info } from 'lucide-react';
import { ChordFunction } from '../types/music';
import { analyzeTension } from '../utils/tensionAnalysis';
import { TensionGraph } from './TensionGraph';
import { Chord, Scale } from 'tonal';

interface TensionAnalysisProps {
  chord: string;
  nextChord?: string;
  function: ChordFunction;
  progression: string[];
  functions: ChordFunction[];
}

export const TensionAnalysis: React.FC<TensionAnalysisProps> = ({
  chord,
  nextChord,
  function: chordFunction,
  progression,
  functions,
}) => {
  const chordInfo = Chord.get(chord);
  const tensionAnalysis = analyzeTension(chord, nextChord, chordFunction);
  
  const progressionTension = progression.map((c, i) => ({
    chord: c,
    function: functions[i],
    tension: analyzeTension(
      c,
      progression[i + 1],
      functions[i],
      i === progression.length - 1
    ).totalTension,
  }));

  const getTensionDescription = (tension: number): string => {
    if (tension < 20) return 'Very stable, resolved';
    if (tension < 40) return 'Stable, mild tension';
    if (tension < 60) return 'Moderate tension';
    if (tension < 80) return 'High tension';
    return 'Very high tension';
  };

  const getFunctionColor = (func: ChordFunction): string => {
    switch (func) {
      case 'tonic': return 'text-green-600 dark:text-green-400';
      case 'dominant': return 'text-red-600 dark:text-red-400';
      case 'subdominant': return 'text-blue-600 dark:text-blue-400';
      case 'secondary': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Chord Tension */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={getFunctionColor(chordFunction)} />
            <span className={`font-medium ${getFunctionColor(chordFunction)}`}>
              {chordFunction.charAt(0).toUpperCase() + chordFunction.slice(1)} Function
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  tensionAnalysis.totalTension > 60
                    ? 'bg-red-500'
                    : tensionAnalysis.totalTension > 40
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${tensionAnalysis.totalTension}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {tensionAnalysis.totalTension}% tension
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getTensionDescription(tensionAnalysis.totalTension)}
        </div>
      </div>

      {/* Tension Sources Analysis */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tension Sources
        </h3>
        {tensionAnalysis.sources.map((source, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`w-4 h-4 ${
                  source.severity > 60
                    ? 'text-red-500'
                    : source.severity > 40
                    ? 'text-yellow-500'
                    : 'text-blue-500'
                }`}
              />
              <span className="text-sm">{source.description}</span>
            </div>
            <div className="text-sm text-gray-500">
              +{source.severity}% tension
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Suggestions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Resolution Suggestions
        </h3>
        <div className="grid gap-2">
          {tensionAnalysis.resolutionPaths.map((path, index) => (
            <div
              key={`resolution-${index}`}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Info className="w-4 h-4" />
                <span className="font-medium">Resolution Path {index + 1}</span>
              </div>
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">
                {path}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Leading Suggestions */}
      {tensionAnalysis.voiceLeadingSuggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Voice Leading Suggestions
          </h3>
          <div className="grid gap-2">
            {tensionAnalysis.voiceLeadingSuggestions.map((suggestion, index) => (
              <div
                key={`voice-leading-${index}`}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Music className="w-4 h-4" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tension Flow Graph */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Harmonic Tension Flow
        </h3>
        <TensionGraph progression={progressionTension} />
      </div>

      {/* Educational Information */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">
            Understanding Tension
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Tension creates musical interest</li>
            <li>• Balance tension with resolution</li>
            <li>• Use tension to build anticipation</li>
            <li>• Consider genre expectations</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">
            Resolution Techniques
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Step-wise voice leading</li>
            <li>• Common tone retention</li>
            <li>• Traditional cadential patterns</li>
            <li>• Voice exchange techniques</li>
          </ul>
        </div>
      </div>
    </div>
  );
};