import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AnalysisResult, IntentType } from '../types';
import { INTENT_COLORS } from '../constants';

interface IntentChartProps {
  results: AnalysisResult[];
}

export const IntentChart: React.FC<IntentChartProps> = ({ results }) => {
  
  const data = useMemo(() => {
    const counts = {
      [IntentType.PRODUCT]: 0,
      [IntentType.COLLECTION]: 0,
      [IntentType.ARTICLE]: 0,
      [IntentType.UNKNOWN]: 0,
    };

    results.forEach(r => {
      if (counts[r.intent] !== undefined) {
        counts[r.intent]++;
      } else {
        counts[IntentType.UNKNOWN]++;
      }
    });

    return Object.keys(counts).map(key => {
      const intentKey = key as IntentType;
      return {
        name: intentKey,
        value: counts[intentKey],
        color: INTENT_COLORS[intentKey]
      };
    }).filter(d => d.value > 0);
  }, [results]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Intent Distribution</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value} Keywords`, 'Count']}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};