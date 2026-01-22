import React, { useState, useCallback } from 'react';
import SetupForm from './components/SetupForm';
import StoryViewer from './components/StoryViewer';
import IllustrationPanel from './components/IllustrationPanel';
import { GameSettings, StorySegment, Step } from './types';
import { generateInitialStory, generateStoryContinuation, generateSceneImage, generateStorySummary } from './services/geminiService';
// Removed uuid usage to stick to instructions/imports provided previously.

const generateId = () => Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.SETUP);
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [currentSettings, setCurrentSettings] = useState<GameSettings | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track the latest image prompt to show in the UI while loading
  const [currentImagePrompt, setCurrentImagePrompt] = useState<string>("");
  // Track the latest generated image
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);

  const handleStart = async (settings: GameSettings) => {
    setIsLoadingText(true);
    setStep(Step.PLAYING);
    setError(null);
    setCurrentSettings(settings);

    try {
      // 1. Generate Text
      const storyData = await generateInitialStory(settings);
      
      const newSegment: StorySegment = {
        id: generateId(),
        ...storyData,
      };

      setSegments([newSegment]);
      setCurrentImagePrompt(newSegment.imagePrompt);
      setIsLoadingText(false);

      // 2. Generate Image (Async, doesn't block reading)
      setIsLoadingImage(true);
      const imageUrl = await generateSceneImage(newSegment.imagePrompt);
      setCurrentImageUrl(imageUrl);
      
      // Update the segment with the image URL (optional, if we want to store history)
      setSegments(prev => prev.map(s => s.id === newSegment.id ? { ...s, imageUrl } : s));
      
    } catch (err) {
      console.error(err);
      setError("物語の開始に失敗しました。APIキーと接続を確認してください。");
      setStep(Step.SETUP); // Go back to setup on critical failure
    } finally {
      setIsLoadingText(false);
      setIsLoadingImage(false);
    }
  };

  const handleChoice = async (actionText: string) => {
    // Prevent double submission
    if (isLoadingText) return;

    // 1. Add User Action to segments immediately for UI feedback
    const userSegment: StorySegment = {
      id: generateId(),
      text: "", // No narrative text for user action
      choices: [],
      imagePrompt: "",
      isUserAction: true,
      userActionText: actionText
    };
    
    // Optimistic update
    const currentHistory = [...segments, userSegment];
    setSegments(currentHistory);
    setIsLoadingText(true);

    try {
      // 2. Generate Next Story Segment
      const storyData = await generateStoryContinuation(segments, actionText);
      
      const newSegment: StorySegment = {
        id: generateId(),
        ...storyData,
      };

      setSegments([...currentHistory, newSegment]);
      setCurrentImagePrompt(newSegment.imagePrompt);
      setIsLoadingText(false);

      // 3. Generate Image
      setIsLoadingImage(true);
      const imageUrl = await generateSceneImage(newSegment.imagePrompt);
      setCurrentImageUrl(imageUrl);
      
      setSegments(prev => prev.map(s => s.id === newSegment.id ? { ...s, imageUrl } : s));

    } catch (err) {
      console.error(err);
      // Remove the optimistic user action if it failed? Or just show error.
      // Showing error in UI is better.
      // For now, we just log it, but in a real app we'd show a toast.
    } finally {
      setIsLoadingText(false);
      setIsLoadingImage(false);
    }
  };

  const handleGenerateSummary = async (): Promise<string> => {
    if (!currentSettings) return "設定が見つかりません。";
    return await generateStorySummary(segments, currentSettings);
  };

  if (step === Step.SETUP) {
    return <SetupForm onStart={handleStart} isLoading={isLoadingText} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-950">
      {/* Left Panel: Text & Interaction - Takes 50% on desktop */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex-shrink-0">
        <StoryViewer 
          segments={segments} 
          isLoading={isLoadingText} 
          onChoice={handleChoice}
          onGenerateSummary={handleGenerateSummary}
        />
      </div>

      {/* Right Panel: Illustration - Takes 50% on desktop */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex-shrink-0 border-l border-slate-800">
        <IllustrationPanel 
          imageUrl={currentImageUrl} 
          isLoading={isLoadingImage} 
          prompt={currentImagePrompt}
        />
      </div>

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-red-900/90 p-6 rounded-xl max-w-md text-center border border-red-500">
            <h3 className="text-xl font-bold text-white mb-2">エラー</h3>
            <p className="text-red-100 mb-4">{error}</p>
            <button 
              onClick={() => setStep(Step.SETUP)}
              className="px-4 py-2 bg-white text-red-900 font-bold rounded hover:bg-red-100"
            >
              再起動
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;