'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TrailSearch from '@/components/TrailSearch';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌲 TrailStory
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered audio stories that bring trails to life
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <TrailSearch onTrailSelect={handleTrailSelect} />
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-4xl mb-3">🎧</div>
            <h3 className="font-semibold mb-2">Premium AI Narration</h3>
            <p className="text-sm text-gray-600">
              Natural-sounding voices that make learning engaging
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Personalized Content</h3>
            <p className="text-sm text-gray-600">
              Stories tailored to your interests
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="font-semibold mb-2">Any Trail, Anywhere</h3>
            <p className="text-sm text-gray-600">
              AI researches and creates stories for any location
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
