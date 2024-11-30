import React, { useState } from 'react';
import { Music, Info } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ArpeggioVisualizer } from './ArpeggioVisualizer';
import { ModalInterchange } from './ModalInterchange';
import { VoiceLeadingVisualizer } from './VoiceLeadingVisualizer';
import { ChordScaleVisualizer } from './ChordScaleVisualizer';
import { TensionAnalysis } from './TensionAnalysis';
import { ChordVisualization3D } from './ChordVisualization3D';
import { HarmonicNetworkGraph } from './HarmonicNetworkGraph';
import { PolyharmonicAnalysis } from './PolyharmonicAnalysis';
import { PerformanceSuggestions } from './PerformanceSuggestions';
import { ChordFunction } from '../types/music';
import { Chord } from 'tonal';

interface ChordAnalysisProps {
  chord: string;
  nextChord?: string;
  romanNumeral: string;
  function: ChordFunction;
  substitutions?: string[];
  scale: string;
  onSubstitute: (chord: string) => void;
  progression: string[];
  functions: ChordFunction[];
}

export const ChordAnalysis: React.FC<ChordAnalysisProps> = ({
  chord,
  nextChord,
  romanNumeral,
  function: chordFunction,
  substitutions = [],
  scale,
  onSubstitute,
  progression,
  functions,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'arpeggio'>('analysis');
  const chordNotes = Chord.get(chord).notes;

  return (
    <div className="space-y-4 bg-white dark:bg-dark-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {chord} Analysis
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('arpeggio')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeTab === 'arpeggio'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Arpeggios
          </button>
        </div>
      </div>

      {activeTab === 'analysis' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <CollapsibleSection title="Chord Structure" defaultOpen>
              <ChordVisualization3D chord={chord} />
            </CollapsibleSection>

            <CollapsibleSection title="Tension Analysis" defaultOpen>
              <TensionAnalysis
                chord={chord}
                nextChord={nextChord}
                function={chordFunction}
                progression={progression}
                functions={functions}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Polyharmonic Analysis">
              <PolyharmonicAnalysis
                chord={chord}
                progression={progression}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Performance Suggestions">
              <PerformanceSuggestions
                chord={chord}
                nextChord={nextChord}
                scale={scale}
              />
            </CollapsibleSection>

            {nextChord && (
              <CollapsibleSection title="Voice Leading">
                <VoiceLeadingVisualizer
                  currentChord={chordNotes}
                  nextChord={Chord.get(nextChord).notes}
                />
              </CollapsibleSection>
            )}
          </div>

          <div className="space-y-4">
            <CollapsibleSection title="Harmonic Network" defaultOpen>
              <HarmonicNetworkGraph
                progression={progression}
                functions={functions}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Modal Interchange">
              <ModalInterchange
                chord={chord}
                scale={scale}
                onSelectChord={onSubstitute}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Compatible Scales">
              <ChordScaleVisualizer
                chord={chord}
                scale={scale}
                currentKey={chord.match(/^[A-G][#b]?/)?.[0] || 'C'}
              />
            </CollapsibleSection>

            {substitutions.length > 0 && (
              <CollapsibleSection title="Chord Substitutions">
                <div className="flex flex-wrap gap-2">
                  {substitutions.map((sub, index) => (
                    <button
                      key={index}
                      onClick={() => onSubstitute(sub)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>
      ) : (
        <ArpeggioVisualizer chord={chord} progression={progression} />
      )}
    </div>
  );
};