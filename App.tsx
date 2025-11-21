import React, { useState, useCallback } from 'react';
import { SAMPLE_INPUT_TEXT } from './constants';
import { KeywordInput, AnalysisResult } from './types';
import { analyzeKeywords } from './services/geminiService';
import { IntentChart } from './components/IntentChart';
import { ResultsTable } from './components/ResultsTable';
import { Sparkles, Upload, FileSpreadsheet, Play, Loader2, RotateCcw, AlertCircle, Download } from 'lucide-react';

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
      // Cast to KeywordInput to satisfy the filter predicate downstream
      return { term, volume } as KeywordInput;
    }).filter((k): k is KeywordInput => k !== null);
  };

  const handleAnalyze = async () => {
    const parsedKeywords = parseInput(inputText);
    if (parsedKeywords.length === 0) {
      setError("Please enter some keywords first.");
      return;
    }
    if (parsedKeywords.length > 100) {
       setError("Please limit to 100 keywords for this demo to avoid rate limits.");
       return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeKeywords(parsedKeywords);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    // Optional: Keep input text or clear it. keeping it for now.
  };

  const downloadCSV = () => {
    if (!results) return;
    const headers = ["Keyword", "Volume", "Intent", "Reasoning", "Confidence"];
    const csvContent = [
      headers.join(","),
      ...results.map(r => `"${r.keyword}",${r.volume || 0},"${r.intent}","${r.reasoning}",${r.confidenceScore}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "keyword_intent_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">SEO Intent Classifier</h1>
          </div>
          <div className="flex items-center gap-4">
            {results && (
              <button 
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Start Over
              </button>
            )}
             <div className="text-xs text-gray-400 font-mono hidden sm:block">
              Powered by Gemini 2.5
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Analysis Error</h4>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!results ? (
          // Input View
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Classify Your Keywords</h2>
                <p className="text-gray-600">
                  Paste your keyword list (with or without search volumes) to automatically categorize them into 
                  <span className="font-medium text-blue-600 mx-1">Product</span>, 
                  <span className="font-medium text-purple-600 mx-1">Collection</span>, or 
                  <span className="font-medium text-emerald-600 mx-1">Article</span> pages.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Paste keywords here...&#10;Example:&#10;Artificial flowers 14800&#10;How to clean fake plants"
                    className="w-full h-64 p-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none font-mono text-sm bg-gray-50 focus:bg-white"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <button
                      onClick={loadSampleData}
                      className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-1 shadow-sm"
                    >
                      <FileSpreadsheet className="w-3 h-3" /> Load Demo Data
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl ${
                    isAnalyzing || !inputText.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Analyzing Keywords...
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-current" /> Analyze Intent
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard 
                icon={<Upload className="w-5 h-5 text-blue-500" />}
                title="Bulk Analysis"
                desc="Paste directly from Excel or Sheets."
              />
               <FeatureCard 
                icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                title="AI Powered"
                desc="Understands nuance beyond simple keyword matching."
              />
               <FeatureCard 
                icon={<FileSpreadsheet className="w-5 h-5 text-emerald-500" />}
                title="Smart Sorting"
                desc="Prioritize high-volume terms by intent."
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
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-lg font-semibold text-gray-800">Analysis Summary</h3>
                      <p className="text-sm text-gray-500">Analyzed {results.length} keywords successfully.</p>
                   </div>
                   <button 
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                   >
                     <Download className="w-4 h-4" /> Export CSV
                   </button>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4">
                    <StatCard 
                      label="Product Pages" 
                      count={results.filter(r => r.intent === 'Product Page').length}
                      color="bg-blue-50 text-blue-700 border-blue-100"
                    />
                    <StatCard 
                      label="Collection Pages" 
                      count={results.filter(r => r.intent === 'Collection/Category Page').length}
                      color="bg-purple-50 text-purple-700 border-purple-100"
                    />
                    <StatCard 
                      label="Articles/Blog" 
                      count={results.filter(r => r.intent === 'Article/Blog Post').length}
                      color="bg-emerald-50 text-emerald-700 border-emerald-100"
                    />
                 </div>

                 <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600 border border-gray-100">
                   <p><strong>Strategy Tip:</strong> You have a high volume of <span className="text-purple-600 font-medium">Collection</span> keywords. Consider creating robust category landing pages with facets/filters to capture this broad traffic.</p>
                 </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="h-[600px]">
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
  <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
    <div className="bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

const StatCard: React.FC<{label: string, count: number, color: string}> = ({ label, count, color }) => (
  <div className={`p-4 rounded-lg border ${color} flex flex-col items-center justify-center`}>
    <span className="text-3xl font-bold mb-1">{count}</span>
    <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
  </div>
);

export default App;