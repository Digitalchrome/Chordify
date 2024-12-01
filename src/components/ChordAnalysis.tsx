import React, { useState, lazy, Suspense, useMemo } from 'react';
import { Music } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ChordFunction, ScaleType, VoicingType } from '../types/music';
import { Chord } from 'tonal';

// Lazy load heavy components
const ArpeggioVisualizer = lazy(() => import('./ArpeggioVisualizer'));
const ModalInterchange = lazy(() => import('./ModalInterchange'));
const VoiceLeadingVisualizer = lazy(() => import('./VoiceLeadingVisualizer'));
const ChordScaleVisualizer = lazy(() => import('./ChordScaleVisualizer'));
const TensionAnalysis = lazy(() => import('./TensionAnalysis'));
const ChordVisualization3D = lazy(() => import('./ChordVisualization3D'));
const HarmonicNetworkGraph = lazy(() => import('./HarmonicNetworkGraph'));
const PolyharmonicAnalysis = lazy(() => import('./PolyharmonicAnalysis'));
const PerformanceSuggestions = lazy(() => import('./PerformanceSuggestions'));

interface ChordAnalysisProps {
  chord: string;
  nextChord?: string;
  romanNumeral: string;
  function: ChordFunction;
  substitutions?: string[];
  scale: ScaleType;
  voicingType?: VoicingType;
  onSubstitute: (chord: string) => void;
  progression: string[];
  functions: ChordFunction[];
}

const LoadingFallback = () => (
  <div className="animate-pulse flex space-x-4">
    <div className="flex-1 space-y-4 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export const ChordAnalysis: React.FC<ChordAnalysisProps> = ({
  chord,
  nextChord,
  romanNumeral,
  function: chordFunction,
  substitutions = [],
  scale,
  voicingType = 'basic',
  onSubstitute,
  progression,
  functions,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const chordInfo = useMemo(() => {
    try {
      return Chord.get(chord);
    } catch (error) {
      console.error('Error parsing chord:', error);
      return null;
    }
  }, [chord]);

  if (!chordInfo) {
    return <div>Invalid chord: {chord}</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Music className="w-5 h-5 mr-2 text-indigo-600" />
          Chord Analysis
        </h3>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <CollapsibleSection
          title="Chord Structure"
          isOpen={activeSection === 'structure'}
          onToggle={() => setActiveSection(activeSection === 'structure' ? null : 'structure')}
        >
          <ChordVisualization3D
            chord={chord}
            voicingType={voicingType}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Voice Leading"
          isOpen={activeSection === 'voiceLeading'}
          onToggle={() => setActiveSection(activeSection === 'voiceLeading' ? null : 'voiceLeading')}
        >
          <VoiceLeadingVisualizer
            currentChord={chord}
            nextChord={nextChord}
            voicingType={voicingType}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Scales & Modes"
          isOpen={activeSection === 'scales'}
          onToggle={() => setActiveSection(activeSection === 'scales' ? null : 'scales')}
        >
          <ChordScaleVisualizer
            chord={chord}
            scale={scale}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Modal Interchange"
          isOpen={activeSection === 'modal'}
          onToggle={() => setActiveSection(activeSection === 'modal' ? null : 'modal')}
        >
          <ModalInterchange
            chord={chord}
            romanNumeral={romanNumeral}
            function={chordFunction}
            onSubstitute={onSubstitute}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Harmonic Network"
          isOpen={activeSection === 'network'}
          onToggle={() => setActiveSection(activeSection === 'network' ? null : 'network')}
        >
          <HarmonicNetworkGraph
            progression={progression}
            functions={functions}
            currentChord={chord}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Performance Suggestions"
          isOpen={activeSection === 'performance'}
          onToggle={() => setActiveSection(activeSection === 'performance' ? null : 'performance')}
        >
          <PerformanceSuggestions
            chord={chord}
            function={chordFunction}
            voicingType={voicingType}
          />
        </CollapsibleSection>
      </Suspense>
    </div>
  );
};