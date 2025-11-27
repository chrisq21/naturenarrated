'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { INTERESTS_MAP, getSubcategoryLabel } from '@/lib/constants';

export default function StoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [storyData, setStoryData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const data = {
      trailName: searchParams.get('name'),
      trailLocation: searchParams.get('location'),
      interests: searchParams.get('interests')?.split(',').map(pair => {
        const [category, subcategory] = pair.split(':');
        return { category, subcategory: subcategory || 'overview' };
      }),
      story: searchParams.get('story'),
      audioDataUrl: searchParams.get('hasAudio') === 'true'
        ? sessionStorage.getItem('trailhead-audio')
        : null
    };
    setStoryData(data);

    // Clean up sessionStorage after retrieving
    if (data.audioDataUrl) {
      sessionStorage.removeItem('trailhead-audio');
    }
  }, [searchParams]);

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = storyData.audioDataUrl;
    link.download = `${storyData.trailName.replace(/\s+/g, '-')}-story.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const speakStory = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(storyData.story);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in your browser');
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (!storyData) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Create another story
          </button>
        </div>

        {/* Story Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{storyData.trailName}</h1>
          <p className="text-gray-600 mb-4">{storyData.trailLocation}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {storyData.interests.map(({ category, subcategory }) => {
              const categoryLabel = INTERESTS_MAP[category]?.label || category;
              const subcategoryLabel = subcategory !== 'overview'
                ? ` (${getSubcategoryLabel(category, subcategory)})`
                : '';

              return (
                <span
                  key={`${category}-${subcategory}`}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {categoryLabel}{subcategoryLabel}
                </span>
              );
            })}
          </div>

          {/* Audio Player */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              🎧 Your Trail Story
            </h3>

            {storyData.audioDataUrl ? (
              // ElevenLabs audio player
              <>
                <audio
                  controls
                  className="w-full"
                  src={storyData.audioDataUrl}
                >
                  Your browser does not support audio playback.
                </audio>
                <button
                  onClick={downloadAudio}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  ⬇️ Download for Offline Listening
                </button>
              </>
            ) : (
              // Browser TTS controls
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Using browser text-to-speech for free, unlimited playback
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={isPlaying ? stopSpeech : speakStory}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isPlaying ? '⏹️ Stop' : '▶️ Play Story'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Story Text */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Story Transcript</h2>
          <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {storyData.story}
          </div>
        </div>
      </div>
    </div>
  );
}
