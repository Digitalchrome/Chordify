import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Music, Book, RefreshCw, Settings } from 'lucide-react';
import { ChordMode, VoicingType, ChordProgression, ScaleType, ChordFunction } from './types/music';
import { audioEngine } from './utils/audioEngine';
import { ChordDisplay } from './components/ChordDisplay';
import { ChordAnalysis } from './components/ChordAnalysis';
import ChordVisualization3D from './components/ChordVisualization3D';
import { generateChordProgression } from './utils/progressionGenerator';

const DEFAULT_PROGRESSION: ChordProgression = {
  chords: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'],
  mode: 'jazz',
  length: 4,
  key: 'C',
  scale: 'major',
  voicingType: 'basic',
  romanNumerals: ['Imaj7', 'ii7', 'V7', 'Imaj7'],
  functions: ['tonic', 'subdominant', 'dominant', 'tonic']
};

function App() {
  const [currentProgression, setCurrentProgression] = useState<ChordProgression>(DEFAULT_PROGRESSION);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentKey, setCurrentKey] = useState<string>('C');
  const [currentScale, setCurrentScale] = useState<ScaleType>('major');
  const [selectedCadence, setSelectedCadence] = useState('');
  const [useExtendedVoicings, setUseExtendedVoicings] = useState(false);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);

  const initializeAudio = useCallback(async () => {
    if (!audioInitialized) {
      try {
        await Tone.start();
        await audioEngine.initialize();
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        alert('Unable to initialize audio. Please check your browser settings and try again.');
      }
    }
  }, [audioInitialized]);

  useEffect(() => {
    const handleClick = () => {
      if (!audioInitialized) {
        initializeAudio();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [audioInitialized, initializeAudio]);

  const handleSaveProgression = useCallback(() => {
    const savedProgressions = JSON.parse(localStorage.getItem('savedProgressions') || '[]');
    savedProgressions.unshift(currentProgression);
    localStorage.setItem('savedProgressions', JSON.stringify(savedProgressions.slice(0, 10)));
  }, [currentProgression]);

  const handleGenerate = useCallback(async () => {
    try {
      await initializeAudio();
      const newProgression = await generateChordProgression(
        currentProgression.mode,
        currentProgression.length,
        {
          key: currentKey,
          scale: currentScale,
          cadence: selectedCadence,
          useExtendedVoicings,
          voicingType: currentProgression.voicingType || 'basic'
        }
      );
      
      setCurrentProgression({
        ...newProgression,
        romanNumerals: newProgression.romanNumerals || currentProgression.romanNumerals,
        functions: newProgression.functions || currentProgression.functions
      });
      setSelectedChordIndex(-1);
    } catch (error) {
      console.error('Error generating progression:', error);
      alert('Failed to generate progression. Please try again.');
    }
  }, [currentProgression, selectedCadence, useExtendedVoicings, currentKey, currentScale, initializeAudio]);

  const handleChordChange = (index: number, newChord: string) => {
    setCurrentProgression(prev => ({
      ...prev,
      chords: prev.chords.map((chord, i) => i === index ? newChord : chord)
    }));
  };

  const handleModeChange = (mode: ChordMode) => {
    setCurrentProgression(prev => ({ ...prev, mode }));
    setSelectedCadence('');
  };

  const handleVoicingTypeChange = (voicingType: VoicingType) => {
    setCurrentProgression(prev => ({ ...prev, voicingType }));
  };

  const handlePlay = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioEngine.stopAll();
      return;
    }

    try {
      await initializeAudio();
      setIsPlaying(true);
      await audioEngine.playProgression(currentProgression.chords, tempo);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error playing progression:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Music className="w-8 h-8 mr-2" />
              Chordify
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Generate
              </button>
              <button
                onClick={handleSaveProgression}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
              >
                <Book className="w-5 h-5 mr-2" />
                Save
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ChordDisplay
                chords={currentProgression.chords}
                mode={currentProgression.mode}
                romanNumerals={currentProgression.romanNumerals}
                onChordChange={handleChordChange}
                onChordSelect={setSelectedChordIndex}
              />

              {selectedChordIndex !== -1 && (
                <ChordVisualization3D
                  chord={currentProgression.chords[selectedChordIndex]}
                  voicingType={currentProgression.voicingType}
                />
              )}
            </div>

            <div className="space-y-6">
              {selectedChordIndex !== -1 && (
                <ChordAnalysis
                  chord={currentProgression.chords[selectedChordIndex]}
                  nextChord={currentProgression.chords[selectedChordIndex + 1]}
                  romanNumeral={currentProgression.romanNumerals?.[selectedChordIndex] || ''}
                  function={currentProgression.functions?.[selectedChordIndex] || 'tonic'}
                  scale={currentProgression.scale || 'major'}
                  voicingType={currentProgression.voicingType}
                  onSubstitute={(newChord) => handleChordChange(selectedChordIndex, newChord)}
                  progression={currentProgression.chords}
                  functions={currentProgression.functions || []}
                />
              )}

              {showSettings && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Voicing Type
                      </label>
                      <select
                        value={currentProgression.voicingType}
                        onChange={(e) => handleVoicingTypeChange(e.target.value as VoicingType)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="basic">Basic</option>
                        <option value="jazz">Jazz</option>
                        <option value="spread">Spread</option>
                        <option value="close">Close</option>
                        <option value="drop2">Drop 2</option>
                        <option value="quartal">Quartal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Playback Speed
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="60"
                          max="200"
                          value={tempo}
                          onChange={(e) => setTempo(Number(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {tempo} BPM
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Extended Voicings
                      </label>
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={useExtendedVoicings}
                          onChange={(e) => setUseExtendedVoicings(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 mr-2"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Use extended chord voicings
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;