import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { Chord, Note } from 'tonal';
import * as THREE from 'three';

interface ChordVisualization3DProps {
  chord: string;
}

const getColorForInterval = (interval: string): string => {
  switch (interval) {
    case '1P': return '#6366f1'; // Root - Indigo
    case '3M': return '#10b981'; // Major third - Emerald
    case '3m': return '#f59e0b'; // Minor third - Amber
    case '5P': return '#3b82f6'; // Perfect fifth - Blue
    case '7M': return '#8b5cf6'; // Major seventh - Purple
    case '7m': return '#ef4444'; // Minor seventh - Red
    case '9M': return '#14b8a6'; // Major ninth - Teal
    case '11P': return '#f97316'; // Perfect eleventh - Orange
    case '13M': return '#84cc16'; // Major thirteenth - Lime
    default: return '#6b7280'; // Gray
  }
};

const ChordNote = ({ note, position, isRoot, color }: any) => {
  const size = isRoot ? 0.5 : 0.3;
  
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, size + 0.2, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {note}
      </Text>
      <Html distanceFactor={10}>
        <div className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
          {Note.freq(note + "4").toFixed(1)}Hz
        </div>
      </Html>
    </group>
  );
};

const ChordStructure = ({ chord }: { chord: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const chordInfo = Chord.get(chord);
  const notes = chordInfo.notes;
  const intervals = chordInfo.intervals;
  const root = notes[0];

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central root note */}
      <ChordNote
        note={root}
        position={[0, 0, 0]}
        isRoot={true}
        color={getColorForInterval('1P')}
      />

      {/* Chord notes in circular arrangement */}
      {notes.slice(1).map((note, index) => {
        const angle = ((index + 1) * Math.PI * 2) / (notes.length);
        const radius = 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (index + 1) * 0.5;

        return (
          <group key={note}>
            <ChordNote
              note={note}
              position={[x, y, z]}
              isRoot={false}
              color={getColorForInterval(intervals[index + 1])}
            />
            {/* Connection line to root */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(x, y, z),
                ])}
              />
              <lineBasicMaterial
                attach="material"
                color={getColorForInterval(intervals[index + 1])}
                linewidth={2}
                transparent
                opacity={0.6}
              />
            </line>
          </group>
        );
      })}

      {/* Interval rings */}
      {intervals.map((interval, index) => {
        if (index === 0) return null;
        const radius = 1.5 + index * 0.3;
        const segments = 32;
        const points = [];

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(theta) * radius,
              0,
              Math.sin(theta) * radius
            )
          );
        }

        return (
          <line key={`ring-${interval}`}>
            <bufferGeometry
              attach="geometry"
              {...new THREE.BufferGeometry().setFromPoints(points)}
            />
            <lineBasicMaterial
              attach="material"
              color={getColorForInterval(interval)}
              transparent
              opacity={0.3}
            />
          </line>
        );
      })}
    </group>
  );
};

export const ChordVisualization3D: React.FC<ChordVisualization3DProps> = ({ chord }) => {
  const chordInfo = Chord.get(chord);

  return (
    <div className="space-y-4">
      <div className="h-64 bg-white dark:bg-dark-800 rounded-lg shadow-sm overflow-hidden">
        <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ChordStructure chord={chord} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={false}
            autoRotateSpeed={1}
          />
        </Canvas>
      </div>

      {/* Chord Information */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Structure</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div>Root: {chordInfo.tonic}</div>
            <div>Quality: {chordInfo.quality}</div>
            <div>Intervals: {chordInfo.intervals.join(', ')}</div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Properties</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div>Notes: {chordInfo.notes.join(', ')}</div>
            <div>Aliases: {chordInfo.aliases.join(', ')}</div>
            <div>Extended: {chordInfo.extended ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[
          { interval: '1P', name: 'Root' },
          { interval: '3M', name: 'Major Third' },
          { interval: '3m', name: 'Minor Third' },
          { interval: '5P', name: 'Perfect Fifth' },
          { interval: '7M', name: 'Major Seventh' },
          { interval: '7m', name: 'Minor Seventh' },
          { interval: '9M', name: 'Major Ninth' },
          { interval: '11P', name: 'Perfect Eleventh' },
          { interval: '13M', name: 'Major Thirteenth' },
        ].map(({ interval, name }) => (
          <div
            key={interval}
            className="flex items-center gap-1"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColorForInterval(interval) }}
            />
            <span className="text-gray-600 dark:text-gray-400">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};