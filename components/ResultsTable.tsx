import React, { useState, useMemo } from 'react';
import { AnalysisResult, IntentType, KeywordRelation } from '../types';
import { INTENT_COLORS } from '../constants';
import { Box, Layers, FileText, HelpCircle, Link as LinkIcon, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Share2, LayoutGrid, File } from 'lucide-react';

interface ResultsTableProps {
  results: AnalysisResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [filter, setFilter] = useState<IntentType | 'ALL'>('ALL');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Group data: Theme -> Pillar -> PrimaryPage
  const groupedData = useMemo<[string, AnalysisResult[]][]>(() => {
    // 1. Filter
    const filtered = filter === 'ALL' ? results : results.filter(r => r.intent === filter);
    
    // 2. Group by ParentTopic (Theme)
    const themes: Record<string, AnalysisResult[]> = {};
    filtered.forEach(r => {
      if (!themes[r.parentTopic]) themes[r.parentTopic] = [];
      themes[r.parentTopic].push(r);
    });

    // 3. Sort Themes by total volume
    return Object.entries(themes).sort(([, aItems], [, bItems]) => {
      const aVol = aItems.reduce((sum, i) => sum + (i.volume || 0), 0);
      const bVol = bItems.reduce((sum, i) => sum + (i.volume || 0), 0);
      return bVol - aVol;
    });
  }, [results, filter]);

  const toggleGroup = (topic: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  // Default expand all
  React.useEffect(() => {
    if (results.length > 0) {
      const allGroups: Record<string, boolean> = {};
      results.forEach(r => allGroups[r.parentTopic] = true);
      setExpandedGroups(allGroups);
    }
  }, [results]);

  const getIntentIcon = (intent: IntentType) => {
    switch (intent) {
      case IntentType.PRODUCT: return <Box className="w-3 h-3" />;
      case IntentType.COLLECTION: return <Layers className="w-3 h-3" />;
      case IntentType.ARTICLE: return <FileText className="w-3 h-3" />;
      default: return <HelpCircle className="w-3 h-3" />;
    }
  };

  const getClusterHealth = (items: AnalysisResult[]) => {
    const uniquePages = new Set(items.map(i => i.primaryVariant)).size;
    if (uniquePages >= 5) {
      return { status: 'strong', label: '权威集群', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 mr-1" />, desc: '结构完整' };
    } else if (uniquePages >= 3) {
      return { status: 'medium', label: '成长中', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: <Share2 className="w-4 h-4 mr-1" />, desc: '可拓展' };
    } else {
      return { status: 'weak', label: '内容单薄', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: <AlertTriangle className="w-4 h-4 mr-1" />, desc: '建议合并' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          架构可视化 ({Object.keys(groupedData).length} Themes)
        </h3>
        <div className="flex gap-2">
          {[
            { type: 'ALL', label: '全部', icon: <LayoutGrid className="w-3 h-3 mr-1" /> },
            { type: IntentType.COLLECTION, label: '集合页', icon: <Layers className="w-3 h-3 mr-1" /> },
            { type: IntentType.PRODUCT, label: '产品页', icon: <Box className="w-3 h-3 mr-1" /> },
            { type: IntentType.ARTICLE, label: '文章页', icon: <FileText className="w-3 h-3 mr-1" /> },
          ].map(btn => (
             <button 
               key={btn.type}
               onClick={() => setFilter(btn.type as any)}
               className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${
                 filter === btn.type 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
               }`}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="overflow-auto flex-1 p-6 bg-gray-50/50">
        <div className="space-y-6">
          {groupedData.map(([topic, items]) => {
            const isExpanded = expandedGroups[topic];
            const health = getClusterHealth(items);
            const totalVol = items.reduce((acc, i) => acc + (i.volume || 0), 0);

            // 1. Group items by Pillar (Level 2)
            const pillars = items.reduce((acc, item) => {
              const p = item.pillar || 'General';
              if (!acc[p]) acc[p] = [];
              acc[p].push(item);
              return acc;
            }, {} as Record<string, AnalysisResult[]>);

            return (
              <div key={topic} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Theme Header (Level 1) */}
                <div 
                  onClick={() => toggleGroup(topic)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                   <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{topic}</h3>
                            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${health.color}`}>
                                {health.icon} {health.label}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                           <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">Theme Hub</span>
                           <span>•</span>
                           <span>{new Set(items.map(i => i.primaryVariant)).size} 个独立页面</span>
                        </div>
                     </div>
                   </div>
                   <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-gray-900">{totalVol.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Cluster Vol.</div>
                   </div>
                </div>

                {/* Expanded Tree View */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-6 pt-2">
                     {Object.entries(pillars).map(([pillarName, pillarItems]) => {
                       
                       // 2. Group by Primary Page (Level 3)
                       const pages = pillarItems.reduce((acc, item) => {
                         const pageKey = item.primaryVariant || item.keyword;
                         if (!acc[pageKey]) acc[pageKey] = { primary: null, synonyms: [] };
                         
                         if (item.relation === KeywordRelation.PRIMARY || item.keyword === pageKey) {
                           acc[pageKey].primary = item; // Found the leader
                         } else {
                           acc[pageKey].synonyms.push(item);
                         }
                         return acc;
                       }, {} as Record<string, { primary: AnalysisResult | null, synonyms: AnalysisResult[] }>);

                       // Ensure we have a primary for each group (fallback if API didn't flag one)
                       Object.keys(pages).forEach(k => {
                         if (!pages[k].primary && pages[k].synonyms.length > 0) {
                           pages[k].primary = pages[k].synonyms[0];
                           pages[k].synonyms = pages[k].synonyms.slice(1);
                         }
                       });

                       const sortedPageKeys = Object.keys(pages).sort((a, b) => {
                         const volA = (pages[a].primary?.volume || 0);
                         const volB = (pages[b].primary?.volume || 0);
                         return volB - volA;
                       });

                       return (
                        <div key={pillarName} className="relative pl-8 py-4 group">
                          {/* Tree Lines for Pillar */}
                          <div className="absolute left-3 top-0 bottom-0 w-px bg-indigo-200 group-last:bottom-auto group-last:h-8"></div>
                          <div className="absolute left-3 top-8 w-5 h-px bg-indigo-200"></div>

                          {/* Pillar Header (Level 2) */}
                          <div className="flex items-start mb-4">
                             <div className="relative z-10">
                               <span className="flex items-center justify-center w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></span>
                             </div>
                             <div className="ml-3 -mt-1">
                                <h4 className="text-sm font-bold text-gray-800 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm inline-flex items-center gap-2">
                                  {pillarName}
                                  <span className="text-xs font-normal text-gray-400">| Pillar</span>
                                </h4>
                             </div>
                          </div>

                          {/* Page Cards (Level 3) */}
                          <div className="pl-8 space-y-3 border-l-2 border-gray-100 ml-4">
                             {sortedPageKeys.map((pageKey) => {
                               const { primary, synonyms } = pages[pageKey];
                               if (!primary) return null;

                               return (
                                 <div key={pageKey} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all relative group/card">
                                    {/* Connector */}
                                    <div className="absolute -left-4 top-6 w-4 h-px bg-gray-300 group-hover/card:bg-indigo-300 transition-colors"></div>

                                    {/* Primary Page Info */}
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="flex items-start gap-3">
                                        {/* Intent Badge */}
                                        <div 
                                          className="mt-1 p-1.5 rounded-md shrink-0"
                                          style={{ backgroundColor: `${INTENT_COLORS[primary.intent]}15`, color: INTENT_COLORS[primary.intent] }}
                                        >
                                          {getIntentIcon(primary.intent)}
                                        </div>
                                        
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                              {primary.keyword}
                                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-normal">URL 核心词</span>
                                            </h5>
                                            <span className="text-xs text-gray-500">({primary.translation})</span>
                                          </div>
                                          
                                          <div className="text-xs text-gray-500 mt-1">
                                            策略: <span className="text-gray-700 font-medium">{primary.contentStrategy}</span>
                                          </div>

                                          {/* Synonyms Section */}
                                          {synonyms.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
                                              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <LinkIcon className="w-3 h-3" /> 归并同义词 / 长尾词:
                                              </div>
                                              <div className="flex flex-wrap gap-2">
                                                {synonyms.map((syn, sIdx) => (
                                                  <span key={sIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100" title={`搜索量: ${syn.volume}`}>
                                                    {syn.keyword}
                                                    <span className="text-gray-400 text-[10px]">{syn.volume ? `(${syn.volume})` : ''}</span>
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <div className="text-sm font-bold text-gray-900 font-mono">
                                          {primary.volume?.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase">Vol.</div>
                                      </div>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                       );
                     })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};