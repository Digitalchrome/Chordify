import { Midi } from "@tonejs/midi";
import { Chord, Note } from "tonal";
import { VoicingOption } from "./voiceLeadingAnalysis";

interface MidiExportOptions {
  bpm: number;
  timeSignature: [number, number];
  chordDuration: number; // in quarters
  velocity: number;
  channel?: number;
}

export const exportToMidi = (
  progression: Array<{
    chord: string;
    voicing?: VoicingOption;
  }>,
  options: MidiExportOptions = {
    bpm: 120,
    timeSignature: [4, 4],
    chordDuration: 4,
    velocity: 100,
    channel: 0
  }
) => {
  const midi = new Midi();
  const track = midi.addTrack();

  // Set tempo and time signature
  midi.header.setTempo(options.bpm);
  midi.header.timeSignatures = [{
    ticks: 0,
    timeSignature: options.timeSignature
  }];

  // Add each chord to the track
  progression.forEach((item, index) => {
    const startTime = index * options.chordDuration;
    const { chord, voicing } = item;

    if (voicing) {
      // If we have a specific voicing from voice leading optimization
      voicing.midiNotes.forEach(note => {
        track.addNote({
          midi: note,
          time: startTime,
          duration: options.chordDuration,
          velocity: options.velocity,
          channel: options.channel || 0
        });
      });
    } else {
      // Fallback to basic chord notes if no voicing specified
      const chordObj = Chord.get(chord);
      chordObj.notes.forEach(note => {
        const midiNote = Note.midi(note + '4') || 60;
        track.addNote({
          midi: midiNote,
          time: startTime,
          duration: options.chordDuration,
          velocity: options.velocity,
          channel: options.channel || 0
        });
      });
    }
  });

  return midi;
};

export const createArpeggioMidi = (
  progression: Array<{
    chord: string;
    voicing?: VoicingOption;
  }>,
  pattern: 'up' | 'down' | 'updown' | 'random' = 'up',
  options: MidiExportOptions = {
    bpm: 120,
    timeSignature: [4, 4],
    chordDuration: 4,
    velocity: 100,
    channel: 0
  }
) => {
  const midi = new Midi();
  const track = midi.addTrack();

  // Set tempo and time signature
  midi.header.setTempo(options.bpm);
  midi.header.timeSignatures = [{
    ticks: 0,
    timeSignature: options.timeSignature
  }];

  // Add each chord as an arpeggio
  progression.forEach((item, index) => {
    const startTime = index * options.chordDuration;
    const { chord, voicing } = item;

    let notes: number[] = [];
    if (voicing) {
      notes = voicing.midiNotes;
    } else {
      const chordObj = Chord.get(chord);
      notes = chordObj.notes.map(note => Note.midi(note + '4') || 60);
    }

    // Create arpeggio pattern
    let patternNotes: number[] = [];
    switch (pattern) {
      case 'up':
        patternNotes = notes;
        break;
      case 'down':
        patternNotes = [...notes].reverse();
        break;
      case 'updown':
        patternNotes = [...notes, ...notes.slice(0, -1).reverse()];
        break;
      case 'random':
        patternNotes = shuffleArray([...notes]);
        break;
    }

    // Add arpeggio notes
    const noteDuration = options.chordDuration / patternNotes.length;
    patternNotes.forEach((note, noteIndex) => {
      track.addNote({
        midi: note,
        time: startTime + (noteIndex * noteDuration),
        duration: noteDuration * 0.8, // Slightly shorter for articulation
        velocity: options.velocity,
        channel: options.channel || 0
      });
    });
  });

  return midi;
};

// Helper function to shuffle array for random arpeggios
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};