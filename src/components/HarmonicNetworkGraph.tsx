import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Chord } from 'tonal';
import { Info } from 'lucide-react';

interface Node {
  id: string;
  group: number;
  function: string;
  notes: string[];
  romanNumeral?: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
  commonNotes: string[];
  relationship: string;
}

interface HarmonicNetworkGraphProps {
  progression: string[];
  functions: string[];
  romanNumerals?: string[];
}

export const HarmonicNetworkGraph: React.FC<HarmonicNetworkGraphProps> = ({
  progression,
  functions,
  romanNumerals = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Create nodes and links
    const nodes: Node[] = progression.map((chord, i) => ({
      id: chord,
      group: getFunctionGroup(functions[i]),
      function: functions[i],
      notes: Chord.get(chord).notes,
      romanNumeral: romanNumerals[i],
    }));

    const links: Link[] = progression.slice(0, -1).map((chord, i) => {
      const source = Chord.get(chord);
      const target = Chord.get(progression[i + 1]);
      const commonNotes = source.notes.filter(note => target.notes.includes(note));
      
      return {
        source: chord,
        target: progression[i + 1],
        value: 1 + commonNotes.length,
        commonNotes,
        relationship: getHarmonicRelationship(chord, progression[i + 1], functions[i], functions[i + 1]),
      };
    });

    const width = svgRef.current.clientWidth;
    const height = 400;

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    // Create gradient definitions for links
    const defs = svg.append('defs');
    
    links.forEach((link, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `link-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', getColorByGroup(getFunctionGroup(link.source as any)));

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', getColorByGroup(getFunctionGroup(link.target as any)));
    });

    // Create arrow markers
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6366f1');

    // Create links
    const link = svg.append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    link.append('path')
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 2)
      .attr('marker-end', 'url(#arrow)')
      .style('stroke', (_, i) => `url(#link-gradient-${i})`)
      .style('opacity', 0.6);

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add node circles
    node.append('circle')
      .attr('r', 25)
      .attr('fill', (d) => getColorByGroup(d.group))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node labels
    node.append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold');

    // Add function labels
    node.append('text')
      .text((d) => d.romanNumeral || '')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.6em')
      .attr('fill', '#fff')
      .attr('font-size', '0.8em');

    // Tooltip handling
    const tooltip = d3.select(tooltipRef.current);

    node.on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <div class="p-2">
            <div class="font-bold">${d.id}</div>
            <div class="text-sm">${d.function}</div>
            <div class="text-sm">Notes: ${d.notes.join(', ')}</div>
            ${d.romanNumeral ? `<div class="text-sm">Roman: ${d.romanNumeral}</div>` : ''}
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

    link.on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <div class="p-2">
            <div class="font-bold">${d.relationship}</div>
            <div class="text-sm">Common notes: ${d.commonNotes.join(', ')}</div>
            <div class="text-sm">Strength: ${d.value}</div>
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link.selectAll('path')
        .attr('d', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [progression, functions, romanNumerals]);

  return (
    <div className="relative w-full bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Harmonic Network
        </h3>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded invisible group-hover:visible whitespace-nowrap">
            Drag nodes to explore relationships
          </div>
        </div>
      </div>
      
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: '400px' }}
      />
      
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 transition-opacity z-10"
      />

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="font-medium text-gray-700 dark:text-gray-300">Functions:</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Tonic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Dominant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Subdominant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Secondary</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-gray-700 dark:text-gray-300">Connections:</div>
          <div className="text-gray-600 dark:text-gray-400">• Thicker lines = more common notes</div>
          <div className="text-gray-600 dark:text-gray-400">• Curved lines show direction</div>
          <div className="text-gray-600 dark:text-gray-400">• Hover for relationship details</div>
        </div>
      </div>
    </div>
  );
};

const getFunctionGroup = (func: string): number => {
  switch (func) {
    case 'tonic': return 1;
    case 'dominant': return 2;
    case 'subdominant': return 3;
    case 'secondary': return 4;
    default: return 0;
  }
};

const getColorByGroup = (group: number): string => {
  switch (group) {
    case 1: return '#22c55e'; // Tonic - Green
    case 2: return '#ef4444'; // Dominant - Red
    case 3: return '#3b82f6'; // Subdominant - Blue
    case 4: return '#a855f7'; // Secondary - Purple
    default: return '#6b7280'; // Default - Gray
  }
};

const getHarmonicRelationship = (
  source: string,
  target: string,
  sourceFunction: string,
  targetFunction: string
): string => {
  if (sourceFunction === 'dominant' && targetFunction === 'tonic') {
    return 'Authentic Cadence';
  }
  if (sourceFunction === 'subdominant' && targetFunction === 'tonic') {
    return 'Plagal Cadence';
  }
  if (sourceFunction === 'secondary' && targetFunction === 'dominant') {
    return 'Secondary Dominant';
  }
  
  const sourceChord = Chord.get(source);
  const targetChord = Chord.get(target);
  const commonNotes = sourceChord.notes.filter(note => targetChord.notes.includes(note));
  
  if (commonNotes.length === 0) return 'No common tones';
  if (commonNotes.length === 1) return 'Weak connection';
  if (commonNotes.length === 2) return 'Strong connection';
  return 'Very strong connection';
};