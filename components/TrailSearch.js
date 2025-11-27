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

  // Geolocation states
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [geocoder, setGeocoder] = useState(null);

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

  // Initialize geocoder when Google Maps API loads
  useEffect(() => {
    if (isLoaded && window.google) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [isLoaded]);

  // Get current position using browser geolocation
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }),
        (error) => {
          const messages = {
            1: 'Location access denied. Please enable location permissions.',
            2: 'Location information unavailable.',
            3: 'Location request timed out.'
          };
          reject(new Error(messages[error.code] || 'Unable to get location'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Reverse geocode coordinates to get location name
  const reverseGeocode = async (lat, lng) => {
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results?.length > 0) {
            // Prefer city-level results
            const cityResult = results.find(r =>
              r.types.includes('locality') ||
              r.types.includes('administrative_area_level_1')
            ) || results[0];
            resolve(cityResult);
          } else {
            reject(new Error('Unable to determine location'));
          }
        }
      );
    });
  };

  // Format geocoding result to match trail object format
  const formatLocationResult = (geocodingResult, coordinates) => {
    let cityName = '', stateName = '';

    geocodingResult.address_components.forEach(component => {
      if (component.types.includes('locality')) {
        cityName = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        stateName = component.short_name;
      }
    });

    return {
      name: cityName ? `${cityName}, ${stateName}` : geocodingResult.formatted_address.split(',')[0],
      location: geocodingResult.formatted_address,
      coordinates: coordinates,
      place_id: geocodingResult.place_id
    };
  };

  // Main handler for "Use My Location" button
  const handleUseMyLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const coords = await getCurrentPosition();
      const geocodingResult = await reverseGeocode(coords.lat, coords.lng);
      const trail = formatLocationResult(geocodingResult, coords);
      onTrailSelect(trail);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  };

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

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or use your current location</span>
          </div>
        </div>

        {/* Geolocation Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUseMyLocation}
            disabled={!geocoder || isGettingLocation}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Finding your location...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>Use My Location</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {locationError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{locationError}</p>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
