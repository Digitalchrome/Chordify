import React, { useState } from 'react';
import { useVoicingStore } from '../stores/voicingStore';
import { VoicingType } from '../utils/voiceLeadingAnalysis';

interface VoicingPresetFormData {
  name: string;
  description: string;
  voicingType: VoicingType;
  preferredOctaves: number[];
  maxSpread: number;
  forceTopNote?: string;
  forceBassPedal: boolean;
}

export const VoicingPresetManager: React.FC = () => {
  const { voicingPresets, addPreset, removePreset, setActivePreset, activePresetId } = useVoicingStore();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<VoicingPresetFormData>({
    name: '',
    description: '',
    voicingType: 'close',
    preferredOctaves: [4],
    maxSpread: 12,
    forceBassPedal: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPreset({
      name: formData.name,
      description: formData.description,
      voicingType: formData.voicingType,
      voicingRules: {
        preferredOctaves: formData.preferredOctaves,
        maxSpread: formData.maxSpread,
        forceTopNote: formData.forceTopNote,
        forceBassPedal: formData.forceBassPedal,
      },
    });
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      voicingType: 'close',
      preferredOctaves: [4],
      maxSpread: 12,
      forceBassPedal: false,
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Voicing Presets
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isCreating ? 'Cancel' : 'New Preset'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Voicing Type
              <select
                value={formData.voicingType}
                onChange={(e) => setFormData({ ...formData, voicingType: e.target.value as VoicingType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="close">Close Position</option>
                <option value="drop2">Drop 2</option>
                <option value="drop3">Drop 3</option>
                <option value="spread">Spread</option>
                <option value="quartal">Quartal</option>
                <option value="cluster">Cluster</option>
                <option value="openVoicing">Open</option>
                <option value="shellVoicing">Shell</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Spread (semitones)
              <input
                type="number"
                value={formData.maxSpread}
                onChange={(e) => setFormData({ ...formData, maxSpread: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min={1}
                max={48}
              />
            </label>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.forceBassPedal}
                onChange={(e) => setFormData({ ...formData, forceBassPedal: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">Force Bass Pedal</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create Preset
          </button>
        </form>
      )}

      <div className="space-y-2">
        {voicingPresets.map((preset) => (
          <div
            key={preset.id}
            className={`p-3 rounded-lg border ${
              activePresetId === preset.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700'
            } cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700`}
            onClick={() => setActivePreset(preset.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">{preset.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{preset.description}</p>
              </div>
              {!preset.id.startsWith('default-') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreset(preset.id);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 mr-2">
                {preset.voicingType}
              </span>
              <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                Max Spread: {preset.voicingRules.maxSpread}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
