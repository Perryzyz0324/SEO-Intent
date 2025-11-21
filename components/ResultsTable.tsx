import React, { useState } from 'react';
import { AnalysisResult, IntentType } from '../types';
import { INTENT_COLORS } from '../constants';
import { CheckCircle2, Box, Layers, FileText, HelpCircle, ArrowUpDown } from 'lucide-react';

interface ResultsTableProps {
  results: AnalysisResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [filter, setFilter] = useState<IntentType | 'ALL'>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: 'keyword' | 'volume' | 'confidenceScore', direction: 'asc' | 'desc' }>({ key: 'volume', direction: 'desc' });

  const handleSort = (key: 'keyword' | 'volume' | 'confidenceScore') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredData = results.filter(r => filter === 'ALL' || r.intent === filter);

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortConfig.key] || 0;
    const bVal = b[sortConfig.key] || 0;
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getIntentIcon = (intent: IntentType) => {
    switch (intent) {
      case IntentType.PRODUCT: return <Box className="w-4 h-4 mr-1" />;
      case IntentType.COLLECTION: return <Layers className="w-4 h-4 mr-1" />;
      case IntentType.ARTICLE: return <FileText className="w-4 h-4 mr-1" />;
      default: return <HelpCircle className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Analysis Results ({sortedData.length})</h3>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          <button 
             onClick={() => setFilter(IntentType.PRODUCT)}
             className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${filter === IntentType.PRODUCT ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <Box className="w-3 h-3 mr-1" /> Product
          </button>
           <button 
             onClick={() => setFilter(IntentType.COLLECTION)}
             className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${filter === IntentType.COLLECTION ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <Layers className="w-3 h-3 mr-1" /> Collection
          </button>
           <button 
             onClick={() => setFilter(IntentType.ARTICLE)}
             className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${filter === IntentType.ARTICLE ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <FileText className="w-3 h-3 mr-1" /> Article
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('keyword')}>
                <div className="flex items-center">Keyword <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" /></div>
              </th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-right" onClick={() => handleSort('volume')}>
                 <div className="flex items-center justify-end">Volume <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" /></div>
              </th>
              <th className="px-6 py-3">Intent</th>
              <th className="px-6 py-3">Reasoning</th>
              <th className="px-6 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('confidenceScore')}>
                <div className="flex items-center justify-end">Confidence <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{row.keyword}</td>
                <td className="px-6 py-4 text-right font-mono text-gray-600">
                  {row.volume ? row.volume.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    style={{ 
                      backgroundColor: `${INTENT_COLORS[row.intent]}15`, // 10% opacity hex
                      color: INTENT_COLORS[row.intent],
                      borderColor: `${INTENT_COLORS[row.intent]}30`
                    }}
                  >
                    {getIntentIcon(row.intent)}
                    {row.intent}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-xs" title={row.reasoning}>
                  {row.reasoning}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-500">{row.confidenceScore}%</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${row.confidenceScore}%`,
                          backgroundColor: row.confidenceScore > 80 ? '#10b981' : row.confidenceScore > 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No keywords found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};