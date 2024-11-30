import React, { useState, useEffect } from 'react';
import { ChordDisplay } from './components/ChordDisplay';
import { GeneratorControls } from './components/GeneratorControls';
import { ProgressionHistory } from './components/ProgressionHistory';
import { PlaybackControls } from './components/PlaybackControls';
import { ChordAnalysis } from './components/ChordAnalysis';
import { AdvancedAnalysis } from './components/AdvancedAnalysis';
import { ThemeToggle } from './components/ThemeToggle';
import { ChordVoicingLibrary } from './components/ChordVoicingLibrary';
import { AdvancedScaleAnalysis } from './components/AdvancedScaleAnalysis';
import { ProgressionVariationEngine } from './components/ProgressionVariationEngine';
import { useDarkMode } from './hooks/useDarkMode';
import { generateProgression } from './utils/chordGenerator';
import { analyzeChordFunction, getChordSubstitutions } from './utils/chordAnalysis';
import { ChordMode, ProgressionLength, ChordProgression, ScaleType, ChordFunction } from './types/music';
import { audioEngine } from './utils/audioEngine';
import { Music, Book, Layers, RefreshCw, Settings } from 'lucide-react';
import { ChordVoicingCustomizer } from './components/ChordVoicingCustomizer';
import { VoicingPresetManager } from './components/VoicingPresetManager';
import { useVoicingStore } from './stores/voicingStore';
import * as Tone from 'tone';
import { AuthProvider } from './components/auth/AuthProvider';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { useAuthStore } from './stores/authStore';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [isDark, setIsDark] = useDarkMode();
  const isAuthenticated = useAuthStore((state) => state.session !== null);
  const user = useAuthStore((state) => state.session?.user);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const [currentProgression, setCurrentProgression] = useState<ChordProgression>({
    chords: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'],
    mode: 'jazz',
    length: 4,
  });
  
  const [history, setHistory] = useState<ChordProgression[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentKey, setCurrentKey] = useState('C');
  const [currentScale, setCurrentScale] = useState<ScaleType>('major');
  const [selectedCadence, setSelectedCadence] = useState('');
  const [useExtendedVoicings, setUseExtendedVoicings] = useState(false);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number>(-1);
  const [showVoicingLibrary, setShowVoicingLibrary] = useState(false);
  const [showScaleAnalysis, setShowScaleAnalysis] = useState(false);
  const [showVariationEngine, setShowVariationEngine] = useState(false);
  const [showVoicingCustomizer, setShowVoicingCustomizer] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const { currentVoicings, setVoicing } = useVoicingStore();

  const initializeAudio = async () => {
    if (!audioInitialized) {
      try {
        await Tone.start();
        audioEngine.initializeAudioContext();
        setAudioInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    }
  };

  const handleInitAudio = async () => {
    await initializeAudio();
  };

  useEffect(() => {
    const handleClick = () => {
      if (!audioInitialized) {
        handleInitAudio();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [audioInitialized]);

  const handleGenerate = async () => {
    await initializeAudio();
    const newProgression = generateProgression(
      currentProgression.mode,
      currentProgression.length,
      {
        selectedCadence,
        useExtendedVoicings,
        key: currentKey,
        scale: currentScale,
      }
    );
    
    setCurrentProgression({
      ...newProgression,
      mode: currentProgression.mode,
      length: currentProgression.length,
    });
    setHistory(prev => [newProgression, ...prev].slice(0, 10));
    setSelectedChordIndex(-1);
  };

  const handleChordChange = (index: number, newChord: string) => {
    const newChords = [...currentProgression.chords];
    newChords[index] = newChord;
    setCurrentProgression({ ...currentProgression, chords: newChords });
  };

  const handleModeChange = (mode: ChordMode) => {
    setCurrentProgression({ ...currentProgression, mode });
    setSelectedCadence('');
  };

  const handleLengthChange = (length: ProgressionLength) => {
    setCurrentProgression({ ...currentProgression, length });
  };

  const handlePlay = async () => {
    await initializeAudio();
    if (isPlaying) {
      audioEngine.stopAll();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    await audioEngine.playProgression(currentProgression.chords, tempo);
    setIsPlaying(false);
  };

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
  };

  const handleHistorySelect = (progression: ChordProgression) => {
    setCurrentProgression(progression);
    setSelectedChordIndex(-1);
  };

  const handleVoicingSelect = (voicing: string[]) => {
    if (selectedChordIndex >= 0) {
      handleChordChange(selectedChordIndex, voicing.join(''));
    }
  };

  const handleVariationSelect = (variation: string[]) => {
    setCurrentProgression({
      ...currentProgression,
      chords: variation,
    });
  };

  const handleVoicingChange = (notes: string[]) => {
    if (selectedChordIndex >= 0) {
      setVoicing(currentProgression.chords[selectedChordIndex], notes, 'custom');
    }
  };

  const getChordFunction = (index: number): ChordFunction => {
    return analyzeChordFunction(
      currentProgression.chords[index],
      currentKey,
      currentProgression.romanNumerals?.[index] || ''
    );
  };

  const getSubstitutions = (index: number): string[] => {
    return getChordSubstitutions(
      currentProgression.chords[index],
      currentProgression.romanNumerals?.[index] || '',
      getChordFunction(index)
    );
  };

  const MainApp = () => (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Chordify</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
              Chord Progression Generator
            </h1>
            <p className="text-indigo-600 dark:text-indigo-400">
              Create beautiful chord progressions in different styles
            </p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </header>

        {/* Voicing Customization Panel */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowVoicingCustomizer(!showVoicingCustomizer)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showVoicingCustomizer ? 'Hide Voicing Editor' : 'Show Voicing Editor'}
          </button>
        </div>

        {showVoicingCustomizer && selectedChordIndex >= 0 && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Chord Voicing Editor</h2>
                <button
                  onClick={() => setShowVoicingCustomizer(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChordVoicingCustomizer
                  chord={currentProgression.chords[selectedChordIndex]}
                  onChange={handleVoicingChange}
                  initialVoicing={currentVoicings[currentProgression.chords[selectedChordIndex]]?.notes}
                />
                <VoicingPresetManager />
              </div>
            </div>
          </div>
        )}

        {!audioInitialized && (
          <div 
            className="fixed bottom-4 right-4 p-4 bg-yellow-800 rounded-lg shadow-lg cursor-pointer z-50"
            onClick={handleInitAudio}
          >
            <p className="text-yellow-100">
              Click anywhere to enable audio playback
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GeneratorControls
              mode={currentProgression.mode}
              length={currentProgression.length}
              rootKey={currentKey}
              scale={currentScale}
              onModeChange={handleModeChange}
              onLengthChange={handleLengthChange}
              onKeyChange={setCurrentKey}
              onScaleChange={setCurrentScale}
              onGenerate={handleGenerate}
              useExtendedVoicings={useExtendedVoicings}
              onVoicingsChange={setUseExtendedVoicings}
              selectedCadence={selectedCadence}
              onCadenceChange={setSelectedCadence}
            />

            <ChordDisplay
              chords={currentProgression.chords}
              mode={currentProgression.mode}
              romanNumerals={currentProgression.romanNumerals}
              onChordChange={handleChordChange}
              onChordSelect={setSelectedChordIndex}
            />

            <PlaybackControls
              isPlaying={isPlaying}
              tempo={tempo}
              onPlay={handlePlay}
              onTempoChange={handleTempoChange}
            />

            {selectedChordIndex !== -1 && (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowVoicingLibrary(!showVoicingLibrary)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      showVoicingLibrary 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-indigo-600 border border-indigo-200'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    Voicing Library
                  </button>
                  <button
                    onClick={() => setShowScaleAnalysis(!showScaleAnalysis)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      showScaleAnalysis 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-indigo-600 border border-indigo-200'
                    }`}
                  >
                    <Book className="w-4 h-4" />
                    Scale Analysis
                  </button>
                  <button
                    onClick={() => setShowVariationEngine(!showVariationEngine)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      showVariationEngine 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-indigo-600 border border-indigo-200'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Variations
                  </button>
                </div>

                <ChordAnalysis
                  chord={currentProgression.chords[selectedChordIndex]}
                  nextChord={currentProgression.chords[selectedChordIndex + 1]}
                  romanNumeral={currentProgression.romanNumerals?.[selectedChordIndex] || ''}
                  function={getChordFunction(selectedChordIndex)}
                  substitutions={getSubstitutions(selectedChordIndex)}
                  scale={currentScale}
                  onSubstitute={(newChord) => handleChordChange(selectedChordIndex, newChord)}
                  progression={currentProgression.chords}
                  functions={currentProgression.chords.map((_, i) => getChordFunction(i))}
                />

                {showVoicingLibrary && (
                  <ChordVoicingLibrary
                    chord={currentProgression.chords[selectedChordIndex]}
                    onSelectVoicing={handleVoicingSelect}
                  />
                )}

                {showScaleAnalysis && (
                  <AdvancedScaleAnalysis
                    chord={currentProgression.chords[selectedChordIndex]}
                    scale={currentScale}
                    currentKey={currentKey}
                  />
                )}

                {showVariationEngine && (
                  <ProgressionVariationEngine
                    progression={currentProgression.chords}
                    mode={currentProgression.mode}
                    onSelectVariation={handleVariationSelect}
                  />
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <ProgressionHistory
              history={history}
              onSelect={handleHistorySelect}
              currentProgression={currentProgression}
            />
          </div>
        </div>

        {selectedChordIndex !== -1 && (
          <AdvancedAnalysis
            progression={currentProgression}
            currentKey={currentKey}
            scale={currentScale}
          />
        )}
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <SignUpForm />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <MainApp /> : <Navigate to="/login" />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;