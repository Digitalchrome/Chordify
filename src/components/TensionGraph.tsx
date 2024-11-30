import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChordFunction } from '../types/music';

interface TensionGraphProps {
  progression: {
    chord: string;
    function: ChordFunction;
    tension: number;
  }[];
}

export const TensionGraph: React.FC<TensionGraphProps> = ({ progression }) => {
  const data = progression.map((item, index) => ({
    id: `${item.chord}-${index}`, // Add unique id for key prop
    name: item.chord,
    tension: item.tension,
    function: item.function,
  }));

  const maxTension = Math.max(...data.map(d => d.tension));
  const avgTension = data.reduce((sum, d) => sum + d.tension, 0) / data.length;

  const getFunctionColor = (func: ChordFunction) => {
    switch (func) {
      case 'tonic': return '#22c55e';
      case 'dominant': return '#ef4444';
      case 'subdominant': return '#3b82f6';
      case 'secondary': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tension: {data.tension.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Function: {data.function}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="name"
              stroke="#6366f1"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6366f1"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgTension}
              stroke="#6366f1"
              strokeDasharray="3 3"
              label={{
                value: 'Avg Tension',
                fill: '#6366f1',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="tension"
              stroke="#6366f1"
              strokeWidth={2}
              dot={(props: any) => (
                <circle
                  key={props.payload.id} // Add key prop here
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={getFunctionColor(props.payload.function)}
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
              activeDot={{ r: 6, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            Peak Tension: {maxTension.toFixed(1)}%
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Highest point of harmonic tension
          </div>
        </div>
        <div>
          <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            Average Tension: {avgTension.toFixed(1)}%
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Overall progression intensity
          </div>
        </div>
      </div>
    </div>
  );
};