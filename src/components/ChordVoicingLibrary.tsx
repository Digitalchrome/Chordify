import React, { useState } from 'react';
import { Piano, Guitar, Music, Play, Pause } from 'lucide-react';
import { Chord, Note } from 'tonal';
import * as Tone from 'tone';

interface ChordVoicingLibraryProps {
  chord: string;
  onSelectVoicing: (voicing: string[]) => void;
}

interface VoicingCategory {
  name: string;
  voicings: string[][];
  description: string;
  instrument: 'piano' | 'guitar';
}

export const ChordVoicingLibrary: React.FC<ChordVoicingLibraryProps> = ({
  chord,
  onSelectVoicing,
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<'piano' | 'guitar'>('piano');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoicing, setCurrentVoicing] = useState<string[] | null>(null);

  const generateVoicings = (chord: string): VoicingCategory[] => {
    const chordInfo = Chord.get(chord);
    
    // Generate voicings using Tonal.js Chord functions
    const closeVoicing = chordInfo.notes;
    const dropTwoVoicing = closeVoicing.length >= 4 ? 
      [closeVoicing[0], closeVoicing[2], closeVoicing[3], closeVoicing[1]] : 
      closeVoicing;
    const dropThreeVoicing = closeVoicing.length >= 4 ?
      [closeVoicing[0], closeVoicing[2], closeVoicing[1], closeVoicing[3]] :
      closeVoicing;
    
    const categories: VoicingCategory[] = [
      {
        name: 'Close Position',
        voicings: [closeVoicing],
        description: 'Compact voicings with minimal spacing',
        instrument: 'piano'
      },
      {
        name: 'Drop 2',
        voicings: [dropTwoVoicing],
        description: 'Second highest note dropped an octave',
        instrument: 'piano'
      },
      {
        name: 'Drop 3',
        voicings: [dropThreeVoicing],
        description: 'Third highest note dropped an octave',
        instrument: 'piano'
      },
      {
        name: 'Guitar Voicings',
        voicings: [closeVoicing, dropTwoVoicing],
        description: 'Optimized for guitar fingerings',
        instrument: 'guitar'
      }
    ];

    return categories;
  };

  const playVoicing = async (voicing: string[]) => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      setCurrentVoicing(voicing);

      await Tone.start();
      const synth = new Tone.PolySynth().toDestination();
      
      // Play notes with slight delay for arpeggio effect
      voicing.forEach((note, index) => {
        synth.triggerAttackRelease(note, '2n', Tone.now() + index * 0.1);
      });

      // Stop after playing
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentVoicing(null);
        synth.dispose();
      }, voicing.length * 500);
    } catch (error) {
      console.error('Error playing voicing:', error);
      setIsPlaying(false);
      setCurrentVoicing(null);
    }
  };

  const categories = generateVoicings(chord);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Chord Voicing Library
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedInstrument('piano')}
            className={`p-2 rounded-lg ${
              selectedInstrument === 'piano'
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Piano className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedInstrument('guitar')}
            className={`p-2 rounded-lg ${
              selectedInstrument === 'guitar'
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Guitar className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {categories
          .filter(cat => cat.instrument === selectedInstrument)
          .map((category, index) => (
            <div
              key={index}
              className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700"
            >
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                {category.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {category.description}
              </p>

              <div className="grid gap-3">
                {category.voicings.map((voicing, vIndex) => (
                  <div
                    key={vIndex}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex flex-wrap gap-2">
                      {voicing.map((note, nIndex) => (
                        <span
                          key={nIndex}
                          className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => playVoicing(voicing)}
                        disabled={isPlaying}
                        className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      >
                        {isPlaying && currentVoicing === voicing ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onSelectVoicing(voicing)}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <Music className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {selectedInstrument === 'guitar' && (
        <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Guitar-Specific Tips
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use barre chords for moveable shapes</li>
            <li>• Consider open strings for added resonance</li>
            <li>• Focus on comfortable finger positions</li>
            <li>• Experiment with different inversions</li>
          </ul>
        </div>
      )}
    </div>
  );
};