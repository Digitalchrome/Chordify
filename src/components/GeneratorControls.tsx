import React from 'react';
import { ChordMode, ProgressionLength, ScaleType } from '../types/music';
import { CADENCE_PATTERNS, ROOTS } from '../utils/chordDatabase';
import { Info } from 'lucide-react';

interface GeneratorControlsProps {
  mode: ChordMode;
  length: ProgressionLength;
  rootKey: string;
  scale: ScaleType;
  onModeChange: (mode: ChordMode) => void;
  onLengthChange: (length: ProgressionLength) => void;
  onKeyChange: (key: string) => void;
  onScaleChange: (scale: ScaleType) => void;
  onGenerate: () => void;
  useExtendedVoicings?: boolean;
  onVoicingsChange?: (useExtended: boolean) => void;
  selectedCadence?: string;
  onCadenceChange?: (cadence: string) => void;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  mode = 'classical',
  length = 4,
  rootKey = 'C',
  scale = 'major',
  onModeChange,
  onLengthChange,
  onKeyChange,
  onScaleChange,
  onGenerate,
  useExtendedVoicings = false,
  onVoicingsChange,
  selectedCadence,
  onCadenceChange,
}) => {
  const lengths: ProgressionLength[] = [4, 8, 12, 16];
  const modes: ChordMode[] = ['smart', 'classical', 'jazz', 'blues', 'modal', 'contemporary'];
  const scales: ScaleType[] = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian'];

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as ChordMode;
    onModeChange(newMode);
    if (onCadenceChange) {
      onCadenceChange('');
    }
  };

  const getModeDescription = (mode: ChordMode): string => {
    switch (mode) {
      case 'smart':
        return 'AI-powered progression generation with advanced harmony';
      case 'classical':
        return 'Traditional harmony following common practice period rules';
      case 'jazz':
        return 'Extended harmonies with seventh chords and alterations';
      case 'blues':
        return 'Blues-based progressions with dominant seventh chords';
      case 'modal':
        return 'Modal harmony based on church modes and modal interchange';
      case 'contemporary':
        return 'Modern progressions with extended and altered harmonies';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
            <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
          </label>
          <select
            value={mode}
            onChange={handleModeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {m === 'smart' ? 'Smart (AI-Powered)' : m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white p-2 rounded text-sm mt-1 w-48">
            {getModeDescription(mode)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key
          </label>
          <select
            value={rootKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {ROOTS.map((root) => (
              <option key={root} value={root}>
                {root}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scale
          </label>
          <select
            value={scale}
            onChange={(e) => onScaleChange(e.target.value as ScaleType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {scales.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Length (Bars)
          </label>
          <select
            value={length}
            onChange={(e) => onLengthChange(Number(e.target.value) as ProgressionLength)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {lengths.map((l) => (
              <option key={l} value={l}>
                {l} Bars
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cadence
          </label>
          <select
            value={selectedCadence}
            onChange={(e) => onCadenceChange?.(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={mode === 'smart'}
          >
            <option value="">
              {mode === 'smart' ? 'Auto-selected in Smart mode' : 'No specific cadence'}
            </option>
            {CADENCE_PATTERNS[mode]?.map((cadence) => (
              <option key={cadence.name} value={cadence.name}>
                {cadence.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={useExtendedVoicings}
            onChange={(e) => onVoicingsChange?.(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Use Extended Voicings
        </label>
      </div>

      <button
        onClick={onGenerate}
        className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        Generate New Progression
      </button>
    </div>
  );
};