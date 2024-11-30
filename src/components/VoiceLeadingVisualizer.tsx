import React from 'react';
import { ArrowRight, ArrowDown, ArrowUpRight, ArrowDownRight, AlertTriangle, Info } from 'lucide-react';
import { Interval } from 'tonal';

interface VoiceLeadingVisualizerProps {
  currentChord: string[];
  nextChord: string[];
}

interface Motion {
  type: 'parallel' | 'contrary' | 'oblique' | 'similar';
  interval: number;
  direction: 'ascending' | 'descending' | 'static';
  intervalName: string;
  warning?: string;
}

const analyzeMotion = (note1: string, note2: string): Motion => {
  const semitones = Math.abs(Interval.semitones(Interval.distance(note1, note2)) || 0);
  const intervalName = Interval.distance(note1, note2);
  const direction = note1 === note2 ? 'static' 
    : (Interval.semitones(intervalName) || 0) > 0 ? 'ascending' 
    : 'descending';
  
  let type: Motion['type'];
  let warning: string | undefined;

  if (note1 === note2) {
    type = 'oblique';
  } else if (semitones <= 2) {
    type = 'similar';
  } else if (semitones > 7) {
    type = 'parallel';
    warning = 'Large leap detected (greater than P5)';
  } else {
    type = 'parallel';
  }

  // Check for problematic intervals
  if (intervalName === 'P5' || intervalName === 'P8') {
    warning = `Parallel ${intervalName} detected`;
  } else if (semitones > 9) {
    warning = 'Very large leap (greater than M6)';
  }

  return { type, interval: semitones, direction, intervalName, warning };
};

const getMotionColor = (motion: Motion): string => {
  if (motion.warning) return 'text-red-500 dark:text-red-400';
  
  switch (motion.type) {
    case 'parallel':
      return motion.interval > 7 ? 'text-yellow-500 dark:text-yellow-400' : 'text-blue-500 dark:text-blue-400';
    case 'contrary':
      return 'text-green-500 dark:text-green-400';
    case 'oblique':
      return 'text-indigo-500 dark:text-indigo-400';
    case 'similar':
      return motion.interval <= 2 ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

const getMotionIcon = (motion: Motion) => {
  if (motion.direction === 'static') return <ArrowRight className="w-4 h-4" />;
  if (motion.direction === 'ascending') return <ArrowUpRight className="w-4 h-4" />;
  return <ArrowDownRight className="w-4 h-4" />;
};

const getHistoricalExample = (motion: Motion): string => {
  switch (motion.type) {
    case 'parallel':
      return 'Avoided in Bach chorales when involving perfect intervals';
    case 'contrary':
      return 'Preferred in Renaissance counterpoint';
    case 'oblique':
      return 'Common in Palestrina\'s works';
    case 'similar':
      return 'Used carefully in Classical period voice leading';
    default:
      return '';
  }
};

const VoiceMotion: React.FC<{ motion: Motion, voiceNumber: number }> = ({ motion, voiceNumber }) => (
  <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg ${
    motion.warning ? 'border border-red-200 dark:border-red-800' : ''
  }`}>
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Voice {voiceNumber + 1}
      </span>
      <div className={`flex items-center gap-2 ${getMotionColor(motion)}`}>
        {getMotionIcon(motion)}
        <span className="capitalize">{motion.type}</span>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {motion.intervalName} ({motion.interval} semitones)
      </span>
    </div>
    
    {motion.warning && (
      <div className="group relative">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs rounded invisible group-hover:visible whitespace-nowrap">
          {motion.warning}
        </div>
      </div>
    )}
  </div>
);

export const VoiceLeadingVisualizer: React.FC<VoiceLeadingVisualizerProps> = ({
  currentChord,
  nextChord,
}) => {
  const motions = currentChord.map((note, index) => {
    if (index >= nextChord.length) return null;
    return analyzeMotion(note, nextChord[index]);
  }).filter((m): m is Motion => m !== null);

  const hasWarnings = motions.some(m => m.warning);

  return (
    <div className="space-y-6">
      {/* Voice Movement Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Current</div>
          {currentChord.map((note, index) => (
            <div key={`current-${index}`} className="px-3 py-2 bg-indigo-50 dark:bg-dark-700 rounded">
              {note}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Next</div>
          {nextChord.map((note, index) => (
            <div key={`next-${index}`} className="px-3 py-2 bg-indigo-50 dark:bg-dark-700 rounded">
              {note}
            </div>
          ))}
        </div>
      </div>

      {/* Voice Leading Analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Voice Leading Analysis</div>
          {hasWarnings && (
            <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Voice leading issues detected</span>
            </div>
          )}
        </div>
        
        {motions.map((motion, index) => (
          <VoiceMotion key={index} motion={motion} voiceNumber={index} />
        ))}
      </div>

      {/* Historical Context */}
      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Info className="w-4 h-4" />
          Historical Context
        </div>
        {motions.map((motion, index) => (
          <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium capitalize">{motion.type} motion:</span>{' '}
            {getHistoricalExample(motion)}
          </div>
        ))}
      </div>

      {/* Educational Legend */}
      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Voice Leading Guidelines:
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div>Contrary: Opposite directions</div>
          <div>Parallel: Same direction</div>
          <div>Oblique: One voice static</div>
          <div>Smooth: Less than or equal to 2 semitones</div>
          <div>Large leap: More than 4 semitones</div>
          <div>Avoid parallel P5/P8</div>
        </div>
      </div>
    </div>
  );
};