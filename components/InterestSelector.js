const INTERESTS = [
  { id: 'history', label: 'Historical Events', icon: '🏛️' },
  { id: 'indigenous', label: 'Indigenous History', icon: '🪶' },
  { id: 'birds', label: 'Wildlife & Birds', icon: '🦅' },
  { id: 'nature', label: 'Nature & Plants', icon: '🌿' },
  { id: 'geology', label: 'Geology', icon: '🪨' }
];

export default function InterestSelector({ selectedInterests, onInterestsChange }) {
  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      onInterestsChange(selectedInterests.filter(id => id !== interestId));
    } else if (selectedInterests.length < 3) {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">
        What interests you? (Select up to 3)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {INTERESTS.map(interest => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            disabled={
              !selectedInterests.includes(interest.id) &&
              selectedInterests.length >= 3
            }
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedInterests.includes(interest.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${
              !selectedInterests.includes(interest.id) &&
              selectedInterests.length >= 3
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <span className="text-3xl mr-2">{interest.icon}</span>
            <span className="font-medium">{interest.label}</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Selected: {selectedInterests.length}/3
      </p>
    </div>
  );
}
