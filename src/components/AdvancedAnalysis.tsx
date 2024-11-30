import React from 'react';
import { Music } from 'lucide-react';
import { ChordProgression, ScaleType } from '../types/music';
import { getCompatibleScales, getScaleCharacteristics } from '../utils/musicAnalysis';
import { Scale } from 'tonal';

interface AdvancedAnalysisProps {
  progression: ChordProgression;
  currentKey: string;
  scale: ScaleType;
}

const getScaleNotes = (root: string, scaleName: string): string[] => {
  const scale = Scale.get(`${root} ${scaleName}`);
  return scale.notes;
};

export const AdvancedAnalysis: React.FC<AdvancedAnalysisProps> = ({
  progression,
  currentKey,
  scale,
}) => {
  const scaleCompatibility = progression.chords.map(chord => ({
    chord,
    scales: getCompatibleScales(chord),
  }));

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
          <Music className="w-4 h-4 text-green-500" />
          Compatible Scales & Modes
        </h4>
        <div className="grid grid-cols-1 gap-4">
          {scaleCompatibility.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">{item.chord}</span>
              </div>
              <div className="pl-4 space-y-2">
                {item.scales.map((scaleName, scaleIndex) => {
                  const scaleNotes = getScaleNotes(item.chord.match(/^[A-G][#b]?/)?.[0] || 'C', scaleName);
                  return (
                    <div key={scaleIndex} className="p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-indigo-600">{scaleName}</span>
                        <div className="text-xs text-gray-500">
                          {getScaleCharacteristics(scaleName)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scaleNotes.map((note, i) => (
                          <div
                            key={`${note}-${i}`}
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.chord.includes(note)
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};