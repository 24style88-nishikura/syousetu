import React, { useEffect, useRef, useState } from 'react';
import { StorySegment } from '../types';

interface StoryViewerProps {
  segments: StorySegment[];
  isLoading: boolean;
  onChoice: (text: string) => void;
  onGenerateSummary: () => Promise<string>;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ segments, isLoading, onChoice, onGenerateSummary }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [customInput, setCustomInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Auto-scroll to bottom when segments change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments, isLoading]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isLoading) return;
    onChoice(customInput);
    setCustomInput('');
  };

  const handleSaveClick = async () => {
    setShowSaveModal(true);
    if (!summaryText) {
      setIsGeneratingSummary(true);
      try {
        const summary = await onGenerateSummary();
        setSummaryText(summary);
      } catch (e) {
        setSummaryText("あらすじの生成に失敗しました。");
      } finally {
        setIsGeneratingSummary(false);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-indigo-400">物語</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveClick}
            disabled={segments.length === 0}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="あらすじを生成して保存"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
            </svg>
            記録
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-wider">{segments.length} 章</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {segments.map((segment) => (
          <div key={segment.id} className="animate-fade-in">
            {segment.isUserAction ? (
              <div className="flex justify-end">
                <div className="bg-indigo-900/40 text-indigo-100 px-4 py-2 rounded-lg rounded-tr-none border border-indigo-500/30 max-w-[80%] text-sm italic">
                  あなた: {segment.userActionText}
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="font-serif text-lg leading-relaxed text-slate-200 whitespace-pre-line">
                  {segment.text}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 italic animate-pulse">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            <span>執筆中...</span>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Interaction Area */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        {!isLoading && lastSegment && !lastSegment.isUserAction && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">選択肢</span>
              {lastSegment.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => onChoice(choice)}
                  className="text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-indigo-500 rounded-lg transition-colors flex items-start gap-3 group"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-bold text-xs group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-slate-200 group-hover:text-white">{choice}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800/50 px-2 text-slate-500">または行動を入力</span>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="どうしますか？"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                決定
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90%]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-indigo-400">冒険の記録</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isGeneratingSummary ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p className="text-slate-400 text-sm">これまでの冒険をまとめています...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    以下のテキストをコピーして保存してください。<br/>
                    次回のゲーム開始時に「設定 / あらすじ」欄に貼り付けることで、続きから遊ぶことができます。
                  </p>
                  <div className="relative">
                    <textarea 
                      readOnly 
                      value={summaryText}
                      className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none resize-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                      title="クリップボードにコピー"
                    >
                      {copyFeedback ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;