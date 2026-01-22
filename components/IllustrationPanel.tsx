import React from 'react';

interface IllustrationPanelProps {
  imageUrl?: string;
  isLoading: boolean;
  prompt: string;
}

const IllustrationPanel: React.FC<IllustrationPanelProps> = ({ imageUrl, isLoading, prompt }) => {
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blur effect for ambiance */}
      {imageUrl && (
        <div 
          className="absolute inset-0 opacity-30 blur-3xl scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        />
      )}

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <div className="flex-1 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-indigo-400 font-medium animate-pulse">シーンを視覚化中...</p>
              {/* Optional: Show prompt for debugging or flavor, style allows truncation */}
              <p className="text-slate-500 text-xs max-w-xs text-center truncate px-4 opacity-0 hover:opacity-100 transition-opacity">{prompt}</p>
            </div>
          ) : imageUrl ? (
            <div className="relative group w-full max-w-2xl aspect-square shadow-2xl rounded-lg overflow-hidden border border-slate-800">
               <img
                src={imageUrl}
                alt="Scene Illustration"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p>物語の始まりを待っています...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IllustrationPanel;