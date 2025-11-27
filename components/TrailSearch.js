'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const GOOGLE_LIBRARIES = ['places'];

export default function TrailSearch({ onTrailSelect }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
    setIsLoaded(true);
  }, []);

  // Debounce input changes to reduce API calls
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 300ms debounce
    debounceTimerRef.current = setTimeout(() => {
      // Input is debounced - Google Places API will now fetch predictions
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        alert('Please select a place from the dropdown');
        return;
      }

      const trail = {
        name: place.name,
        location: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        place_id: place.place_id
      };

      onTrailSelect(trail);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={GOOGLE_LIBRARIES}
    >
      <div>
        <label className="block text-lg font-semibold mb-3 text-gray-700">
          Choose a trail or location. We'll create your narration.
        </label>

        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['park', 'natural_feature', 'point_of_interest'],
            componentRestrictions: { country: 'us' }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search for a trail or park... (e.g., 'Rock Creek Park, Washington DC')"
            className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
          />
        </Autocomplete>

        <p className="mt-3 text-sm text-gray-500">
          Include the city or state for best results.
        </p>
      </div>
    </LoadScript>
  );
}
