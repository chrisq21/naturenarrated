'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Generating your story...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    generateStory();
  }, []);

  const generateStory = async () => {
    try {
      const trail = {
        name: searchParams.get('name'),
        location: searchParams.get('location'),
        coordinates: {
          lat: parseFloat(searchParams.get('lat')),
          lng: parseFloat(searchParams.get('lng'))
        }
      };
      const interests = searchParams.get('interests').split(',').map(pair => {
        const [category, subcategory] = pair.split(':');
        return { category, subcategory: subcategory || 'overview' };
      });
      const storyLength = searchParams.get('length') || 'short';

      // Step 1: Generate text story
      setStatus('Researching your trail...');
      setProgress(20);

      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trail, interests, length: storyLength })
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to generate story');
      }

      const { story } = await storyResponse.json();

      // Step 2: Generate audio (only if ElevenLabs is enabled)
      let audioDataUrl = null;

      if (process.env.NEXT_PUBLIC_USE_ELEVENLABS === 'true') {
        setStatus('Creating audio narration...');
        setProgress(60);

        try {
          const audioResponse = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: story })
          });

          if (audioResponse.ok) {
            const { audioDataUrl: generatedAudio } = await audioResponse.json();
            audioDataUrl = generatedAudio;
          } else {
            console.warn('ElevenLabs audio generation failed, will use browser TTS');
          }
        } catch (error) {
          console.warn('ElevenLabs error, will use browser TTS:', error);
        }
      } else {
        setStatus('Story ready!');
        setProgress(80);
      }

      setStatus('Ready!');
      setProgress(100);

      // Store audio in sessionStorage if it exists
      if (audioDataUrl) {
        sessionStorage.setItem('trailhead-audio', audioDataUrl);
      }

      // Navigate to story page with data
      setTimeout(() => {
        const params = new URLSearchParams({
          name: trail.name,
          location: trail.location,
          interests: interests.map(si => `${si.category}:${si.subcategory}`).join(','),
          story: story,
          hasAudio: audioDataUrl ? 'true' : 'false'
        });
        router.push(`/story?${params.toString()}`);
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setStatus('Something went wrong. Please try again.');
      setTimeout(() => router.push('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
        </div>

        <h2 className="text-2xl font-bold mb-3">{status}</h2>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-gray-600 text-sm">
          This usually takes 30-45 seconds. We're researching your trail and creating a quick personalized story just for you.
        </p>
      </div>
    </div>
  );
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Loading...</h2>
        </div>
      </div>
    }>
      <GeneratingContent />
    </Suspense>
  );
}
