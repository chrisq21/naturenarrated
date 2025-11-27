'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TrailSearch from '@/components/TrailSearch';
import { EXAMPLE_STORIES } from '@/lib/examples';

export default function HomePage() {
  const router = useRouter();
  const [selectedTrail, setSelectedTrail] = useState(null);

  const handleTrailSelect = (trail) => {
    setSelectedTrail(trail);
    // Store trail in URL params and navigate
    const params = new URLSearchParams({
      name: trail.name,
      location: trail.location,
      lat: trail.coordinates.lat,
      lng: trail.coordinates.lng
    });
    router.push(`/customize?${params.toString()}`);
  };

  const handleExampleClick = (example) => {
    // Store audio path in sessionStorage
    sessionStorage.setItem('trailhead-audio', `/audio/examples/${example.audioFile}`);

    // Navigate to story page with URL params
    const params = new URLSearchParams({
      name: example.name,
      location: example.location,
      interests: example.interests.map(i => `${i.category}:${i.subcategory}`).join(','),
      story: example.story,
      hasAudio: 'true'
    });

    router.push(`/story?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌲 Nature Narrated
          </h1>
          <p className="text-xl text-gray-600">
            Every trail has a story to tell. Create yours below.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <TrailSearch onTrailSelect={handleTrailSelect} />
        </div>

        {/* Example Stories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Try These Examples
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {EXAMPLE_STORIES.map((example) => (
              <button
                key={example.id}
                onClick={() => handleExampleClick(example)}
                className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow text-center cursor-pointer group"
              >
                <div className="text-4xl mb-3">{example.emoji}</div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-green-600 transition-colors">
                  {example.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {example.location}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
