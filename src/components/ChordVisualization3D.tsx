import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Chord } from 'tonal';
import { VoicingType } from '../types/music';
import { useChordSelectionStore } from '../stores/chordSelectionStore';

interface ChordVisualization3DProps {
  chord: string;
  voicingType?: VoicingType;
}

const ChordVisualization3D: React.FC<ChordVisualization3DProps> = ({ 
  chord,
  voicingType = 'basic'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const frameIdRef = useRef<number>(0);

  const chordNotes = useMemo(() => {
    try {
      return Chord.get(chord).notes;
    } catch (error) {
      console.error('Error parsing chord:', error);
      return [];
    }
  }, [chord]);

  const notePositions = useMemo(() => {
    const radius = 2;
    const positions: THREE.Vector3[] = [];
    const noteCount = chordNotes.length;

    switch (voicingType) {
      case 'close':
        // Stack notes vertically with small spacing
        chordNotes.forEach((_, index) => {
          positions.push(new THREE.Vector3(0, index * 0.5, 0));
        });
        break;

      case 'spread':
        // Spread notes in a circle
        chordNotes.forEach((_, index) => {
          const angle = (index / noteCount) * Math.PI * 2;
          positions.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            index * 0.3,
            Math.sin(angle) * radius
          ));
        });
        break;

      case 'drop2':
        // Second note from top dropped down an octave
        chordNotes.forEach((_, index) => {
          const y = index === noteCount - 2 ? -1 : index * 0.5;
          positions.push(new THREE.Vector3(0, y, 0));
        });
        break;

      case 'quartal':
        // Stack notes in fourths
        chordNotes.forEach((_, index) => {
          const angle = (index / noteCount) * Math.PI * 2;
          const r = radius + index * 0.3;
          positions.push(new THREE.Vector3(
            Math.cos(angle) * r,
            index * 0.7,
            Math.sin(angle) * r
          ));
        });
        break;

      default:
        // Basic voicing - circular arrangement
        chordNotes.forEach((_, index) => {
          const angle = (index / noteCount) * Math.PI * 2;
          positions.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          ));
        });
    }

    return positions;
  }, [chordNotes, voicingType]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    camera.position.y = 2;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Cleanup function
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      cancelAnimationFrame(frameIdRef.current);
      spheresRef.current.forEach(sphere => scene.remove(sphere));
      renderer.dispose();
    };
  }, []);

  // Update spheres when chord changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing spheres
    spheresRef.current.forEach(sphere => sceneRef.current?.remove(sphere));
    spheresRef.current = [];

    // Create new spheres for each note
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x4f46e5 });

    notePositions.forEach((position) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(position);
      sceneRef.current?.add(sphere);
      spheresRef.current.push(sphere);
    });
  }, [notePositions]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-64 rounded-lg overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};

export default ChordVisualization3D;