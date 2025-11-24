
import React, { useState } from 'react';
import { SAMPLE_INPUT_TEXT } from './constants';
import { KeywordInput, AnalysisResult } from './types';
import { analyzeKeywords } from './services/geminiService';
import { IntentChart } from './components/IntentChart';
import { ResultsTable } from './components/ResultsTable';
import { Sparkles, FileSpreadsheet, Loader2, RotateCcw, AlertCircle, Download, Layers, Network, Star } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const loadSampleData = () => {
    setInputText(SAMPLE_INPUT_TEXT);
    setError(null);
  };

  const parseInput = (text: string): KeywordInput[] => {
    if (!text.trim()) return [];
    
    return text.trim().split('\n').map(line => {
      // Handle tab separated (excel copy paste) or comma separated
      const parts = line.split(/[\t,]+/);
      const term = parts[0].trim();
      
      // Try to find a number in the second part, or clean the term if mixed
      let volume = 0;
      if (parts.length > 1) {
        const volStr = parts[1].replace(/[^0-9]/g, '');
        if (volStr) volume = parseInt(volStr, 10);
      }

      if (!term) return null;
      // Cast to KeywordInput to satisfy the filter type check
      return { term, volume } as KeywordInput;
    }).filter((k): k is KeywordInput => k !== null);
  };

  const handleAnalyze = async () => {
    const parsedKeywords = parseInput(inputText);
    if (parsedKeywords.length === 0) {
      setError("请先输入一些关键词。");
      return;
    }
    if (parsedKeywords.length > 100) {
       setError("为保证演示速度，请将关键词限制在 100 个以内。");
       return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeKeywords(parsedKeywords);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "发生未知错误。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  const downloadCSV = () => {
    if (!results) return;
    // Chinese Headers
    const headers = ["关键词", "中文释义", "搜索量", "Level 1: 主题(Theme)", "Level 2: 支柱(Pillar)", "Level 3: 核心页面词(Primary)", "角色", "意图", "策略", "置信度"];
    const csvContent = [
      headers.join(","),
      ...results.map(r => `"${r.keyword}","${r.translation}",${r.volume || 0},"${r.parentTopic}","${r.pillar}","${r.primaryVariant}","${r.relation}","${r.intent}","${r.contentStrategy}",${r.confidenceScore}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "seo_structure_strategy.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">SEO 网站架构集群</h1>
              <p className="text-xs text-gray-500 font-medium">Topic Clusters & Hub-Spoke Strategy</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {results && (
              <button 
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-4 h-4" /> 开始新分析
              </button>
            )}
             <div className="text-xs text-gray-400 font-mono hidden sm:block px-3 py-1 bg-gray-100 rounded-full">
              Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">分析出错</h4>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!results ? (
          // Input View
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-500/5 border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">SEO 网站架构集群</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  输入关键词，AI 将为您构建 <strong>Theme (主题) -> Pillar (支柱) -> Page (页面)</strong> 的三层金字塔结构，助您打穿行业大词。
                </p>
                <div className="flex justify-center gap-6 mt-6 text-sm text-gray-700 font-medium">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full border border-yellow-100"><Star className="w-3 h-3" /> Level 1: Theme</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-100"><Layers className="w-3 h-3" /> Level 2: Pillar</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100"><FileSpreadsheet className="w-3 h-3" /> Level 3: Page</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
                  <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="在此处粘贴关键词...&#10;建议一次性输入包含大词和长尾词的完整列表，以便 AI 构建完整的集群结构。"
                    className="relative w-full h-72 p-5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none font-mono text-sm bg-white shadow-sm"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <button
                      onClick={loadSampleData}
                      className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-1 shadow-sm hover:shadow transition-all font-medium"
                    >
                      <FileSpreadsheet className="w-3 h-3" /> 加载演示数据
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 ${
                    isAnalyzing || !inputText.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> 正在构建架构图谱...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-white/20" /> 开始智能规划
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Network className="w-6 h-6 text-indigo-600" />}
                title="三层树状结构"
                desc="Theme -> Pillar -> Page 树状图，清晰展现网站骨架。"
              />
               <FeatureCard 
                icon={<AlertCircle className="w-6 h-6 text-amber-600" />}
                title="内容去重"
                desc="自动识别同义词并归入同一个页面，避免关键词自相残杀。"
              />
               <FeatureCard 
                icon={<Layers className="w-6 h-6 text-emerald-600" />}
                title="Hub-Spoke 模型"
                desc="基于权威性构建内部链接策略，打造行业专家形象。"
              />
            </div>
          </div>
        ) : (
          // Results View
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Section */}
              <div className="lg:col-span-1">
                <IntentChart results={results} />
              </div>

              {/* Summary Stats */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-lg font-bold text-gray-900">架构总览</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        规划了 <span className="font-semibold text-gray-900">{new Set(results.map(r => r.parentTopic)).size}</span> 个核心主题集群 (Theme)，包含 <span className="font-semibold text-gray-900">{new Set(results.map(r => r.pillar)).size}</span> 个支柱板块 (Pillar)。
                      </p>
                   </div>
                   <button 
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow hover:shadow-lg"
                   >
                     <Download className="w-4 h-4" /> 导出架构表
                   </button>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatCard 
                      label="Hub 集合页" 
                      count={results.filter(r => r.intent === '集合页' && r.relation === '核心大词').length}
                      color="bg-yellow-50 text-yellow-700 border-yellow-100"
                      desc="Level 1: Theme"
                    />
                    <StatCard 
                      label="Pillar 支柱" 
                      count={new Set(results.map(r => r.pillar)).size}
                      color="bg-indigo-50 text-indigo-700 border-indigo-100"
                      desc="Level 2: Category"
                    />
                    <StatCard 
                      label="独立页面" 
                      count={new Set(results.map(r => r.primaryVariant)).size}
                      color="bg-emerald-50 text-emerald-700 border-emerald-100"
                      desc="Level 3: URL"
                    />
                 </div>

                 <div className="mt-auto bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 text-sm text-indigo-900 border border-indigo-100 flex gap-3">
                   <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                   <div>
                    <p className="font-semibold mb-1">架构师建议:</p>
                    <p>已完成 URL 去重。请重点关注 <span className="font-bold">Level 3: 核心页面词</span>，这是您网站的实际 URL 列表。折叠在其中的同义词应作为页面内的 H2/H3 标签或内容变体使用。</p>
                   </div>
                 </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="h-[800px]">
              <ResultsTable results={results} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper Components
const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md transition-all">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const StatCard: React.FC<{label: string, count: number, color: string, desc: string}> = ({ label, count, color, desc }) => (
  <div className={`p-4 rounded-xl border ${color} flex flex-col`}>
    <span className="text-3xl font-bold mb-1">{count}</span>
    <span className="text-sm font-bold opacity-90 mb-1">{label}</span>
    <span className="text-xs opacity-75">{desc}</span>
  </div>
);

export default App;
