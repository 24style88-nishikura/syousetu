import React, { useState } from 'react';
import { GameSettings } from '../types';

interface SetupFormProps {
  onStart: (settings: GameSettings) => void;
  isLoading: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart, isLoading }) => {
  const [gender, setGender] = useState('男性');
  const [age, setAge] = useState('15');
  const [genre, setGenre] = useState('ファンタジー');
  const [setting, setSetting] = useState('中世ファンタジーの世界。魔法と剣が支配する冒険の旅。主人公は多くの魔力を持っており、クラフトスキルを所持しているいわゆるチートである。');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onStart({ gender, age: `${age}歳`, setting: setting || '謎めいた旅の始まり', genre });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-serif font-bold text-indigo-400 mb-2 text-center">Story Weaver</h1>
        <p className="text-slate-400 text-center mb-8">冒険の設定</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">性別</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-800 border-slate-700 text-slate-100 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="ノンバイナリー">ノンバイナリー</option>
                <option value="不明">不明</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">年齢</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={age} 
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 text-slate-100 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="15"
                />
                <span className="text-slate-400 font-medium whitespace-nowrap">歳</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">ジャンル</label>
            <select 
              value={genre} 
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 text-slate-100 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ファンタジー">ファンタジー</option>
              <option value="SF">SF</option>
              <option value="ミステリー">ミステリー</option>
              <option value="ホラー">ホラー</option>
              <option value="サイバーパンク">サイバーパンク</option>
              <option value="歴史">歴史</option>
              <option value="日常">日常</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-slate-400">設定 / または前回のあらすじ</label>
              <span className="text-xs text-slate-500">続きから遊ぶ場合はここにペースト</span>
            </div>
            <textarea 
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="例: 記憶を失って目覚めた場所は... または、前回保存した「あらすじ」をここに貼り付けてください。"
              className="w-full h-32 bg-slate-800 border-slate-700 text-slate-100 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
              isLoading 
                ? 'bg-indigo-800 cursor-not-allowed opacity-70' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/20'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                物語を紡いでいます...
              </span>
            ) : (
              '冒険を始める'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;