import React, { useState } from 'react';
import { Scale, Note, Collection } from 'tonal';
import { Music, TrendingUp, Info } from 'lucide-react';

interface AdvancedScaleAnalysisProps {
  chord: string;
  scale: string;
  currentKey: string;
}

interface ScaleAnalysis {
  name: string;
  notes: string[];
  compatibility: number;
  characteristics: string[];
  commonPatterns: string[][];
}

export const AdvancedScaleAnalysis: React.FC<AdvancedScaleAnalysisProps> = ({
  chord,
  scale,
  currentKey,
}) => {
  const [selectedScale, setSelectedScale] = useState<string>(scale);

  const analyzeScale = (scaleName: string): ScaleAnalysis => {
    const scaleInfo = Scale.get(`${currentKey} ${scaleName}`);
    const chordNotes = chord.split(' ')[0].split('');
    
    // Calculate compatibility score
    const compatibility = chordNotes.filter(note => 
      scaleInfo.notes.includes(note)
    ).length / chordNotes.length * 100;

    // Generate common patterns
    const patterns = generateMelodicPatterns(scaleInfo.notes);

    return {
      name: scaleName,
      notes: scaleInfo.notes,
      compatibility,
      characteristics: getScaleCharacteristics(scaleName),
      commonPatterns: patterns,
    };
  };

  const getScaleCharacteristics = (scaleName: string): string[] => {
    switch (scaleName.toLowerCase()) {
      case 'major':
        return ['Bright', 'Stable', 'Strong resolution'];
      case 'minor':
        return ['Dark', 'Emotional', 'Tension-building'];
      case 'dorian':
        return ['Minor with bright 6th', 'Modal jazz', 'Folk-like'];
      case 'mixolydian':
        return ['Dominant quality', 'Blues/Rock', 'Suspended resolution'];
      default:
        return ['Unique character', 'Experimental'];
    }
  };

  const generateMelodicPatterns = (notes: string[]): string[][] => {
    const patterns: string[][] = [];
    
    // Ascending pattern
    patterns.push([...notes]);
    
    // Descending pattern
    patterns.push([...notes].reverse());
    
    // Thirds pattern
    const thirds = notes.filter((_, i) => i % 2 === 0);
    patterns.push(thirds);
    
    // Pentatonic subset
    const pentatonic = [notes[0], notes[1], notes[2], notes[4], notes[5]];
    patterns.push(pentatonic);

    return patterns;
  };

  const analysis = analyzeScale(selectedScale);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Advanced Scale Analysis
        </h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-600">
            {Math.round(analysis.compatibility)}% Compatible
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Scale Notes */}
        <div className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Scale Notes
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.notes.map((note, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  chord.includes(note)
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Characteristics */}
        <div className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Scale Characteristics
          </h4>
          <div className="grid gap-2">
            {analysis.characteristics.map((char, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <Info className="w-4 h-4" />
                {char}
              </div>
            ))}
          </div>
        </div>

        {/* Melodic Patterns */}
        <div className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Common Melodic Patterns
          </h4>
          <div className="grid gap-3">
            {analysis.commonPatterns.map((pattern, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
              >
                <div className="flex flex-wrap gap-2">
                  {pattern.map((note, nIndex) => (
                    <span
                      key={nIndex}
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Practice Tips
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Practice patterns in all directions</li>
          <li>• Focus on chord tones within the scale</li>
          <li>• Use patterns as improvisation building blocks</li>
          <li>• Experiment with different rhythmic variations</li>
        </ul>
      </div>
    </div>
  );
};