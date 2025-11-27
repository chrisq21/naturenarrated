import { INTERESTS } from '@/lib/constants';

export default function InterestSelector({ selectedInterests, onInterestsChange }) {
  const toggleInterest = (interestId) => {
    const existing = selectedInterests.find(si => si.category === interestId);

    if (existing) {
      onInterestsChange(selectedInterests.filter(si => si.category !== interestId));
    } else if (selectedInterests.length < 3) {
      onInterestsChange([
        ...selectedInterests,
        { category: interestId, subcategory: 'overview' }
      ]);
    }
  };

  const handleSubcategoryChange = (categoryId, newSubcategoryId) => {
    onInterestsChange(
      selectedInterests.map(si =>
        si.category === categoryId
          ? { ...si, subcategory: newSubcategoryId }
          : si
      )
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">
        What interests you? (Select up to 3)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {INTERESTS.map(interest => (
          <div key={interest.id}>
            <button
              onClick={() => toggleInterest(interest.id)}
              disabled={
                !selectedInterests.some(si => si.category === interest.id) &&
                selectedInterests.length >= 3
              }
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedInterests.some(si => si.category === interest.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                !selectedInterests.some(si => si.category === interest.id) &&
                selectedInterests.length >= 3
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <span className="text-3xl mr-2">{interest.icon}</span>
              <span className="font-medium">{interest.label}</span>
            </button>

            {selectedInterests.find(si => si.category === interest.id) && (
              <div className="mt-2 pl-4 transition-all duration-200">
                <label className="text-sm text-gray-600 block mb-1">
                  Focus area:
                </label>
                <select
                  value={selectedInterests.find(si => si.category === interest.id).subcategory}
                  onChange={(e) => handleSubcategoryChange(interest.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {interest.subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Selected: {selectedInterests.length}/3
      </p>
    </div>
  );
}
