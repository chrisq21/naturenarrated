'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterestSelector from '@/components/InterestSelector';

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trail, setTrail] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [storyLength, setStoryLength] = useState('short');

  useEffect(() => {
    // Get trail data from URL params
    const trailData = {
      name: searchParams.get('name'),
      location: searchParams.get('location'),
      coordinates: {
        lat: parseFloat(searchParams.get('lat')),
        lng: parseFloat(searchParams.get('lng'))
      }
    };
    setTrail(trailData);
  }, [searchParams]);

  const handleGenerate = () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    // Pass all data to generating page
    const params = new URLSearchParams({
      name: trail.name,
      location: trail.location,
      lat: trail.coordinates.lat,
      lng: trail.coordinates.lng,
      interests: selectedInterests
        .map(si => `${si.category}:${si.subcategory}`)
        .join(','),
      length: storyLength
    });

    router.push(`/generating?${params.toString()}`);
  };

  if (!trail) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← Back to search
        </button>

        {/* Trail info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{trail.name}</h1>
          <p className="text-gray-600">{trail.location}</p>
        </div>

        {/* Interest selection */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <InterestSelector
            selectedInterests={selectedInterests}
            onInterestsChange={setSelectedInterests}
          />

          {/* Story Length Selector */}
          <div className="mt-8 mb-6">
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Story Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setStoryLength('short')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  storyLength === 'short'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">Short</div>
                <div className="text-xs opacity-75">20-40 sec</div>
              </button>
              <button
                onClick={() => setStoryLength('medium')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  storyLength === 'medium'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">Medium</div>
                <div className="text-xs opacity-75">90s-2.5 min</div>
              </button>
              <button
                onClick={() => setStoryLength('long')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  storyLength === 'long'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">Long</div>
                <div className="text-xs opacity-75">4-6 min</div>
              </button>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Story length:</strong> {storyLength === 'short' ? '20-40 seconds' : storyLength === 'medium' ? '90 seconds-2.5 minutes' : '4-6 minutes'}<br />
              <strong>Style:</strong> Conversational and punchy
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={selectedInterests.length === 0}
            className="mt-6 w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate My Trail Story 🎧
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <CustomizeContent />
    </Suspense>
  );
}
