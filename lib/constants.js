export const INTERESTS = [
  {
    id: 'birds',
    label: 'Birds',
    icon: '🦅',
    subcategories: [
      { id: 'overview', label: 'Overview' },
      { id: 'birds-nearby', label: 'Birds nearby' },
      { id: 'songs-hear', label: 'Songs you\'ll hear' },
      { id: 'migration', label: 'Migration patterns' },
      { id: 'spot-them', label: 'How to spot them' }
    ]
  },
  {
    id: 'wildlife',
    label: 'Wildlife',
    icon: '🦌',
    subcategories: [
      { id: 'overview', label: 'Overview' },
      { id: 'animals-nearby', label: 'Animals nearby' },
      { id: 'signs-trail', label: 'Signs on this trail' },
      { id: 'where-live', label: 'Where they live here' },
      { id: 'predators-here', label: 'Predators & prey here' }
    ]
  },
  {
    id: 'indigenous',
    label: 'Indigenous History',
    icon: '🪶',
    subcategories: [
      { id: 'overview', label: 'Overview' },
      { id: 'who-lived', label: 'Who lived here' },
      { id: 'practices-region', label: 'Practices in this region' },
      { id: 'place-names-indigenous', label: 'Indigenous place names' },
      { id: 'communities-today', label: 'Communities today' }
    ]
  },
  {
    id: 'geology',
    label: 'Geology',
    icon: '🪨',
    subcategories: [
      { id: 'overview', label: 'Overview' },
      { id: 'rocks-see', label: 'Rocks you\'ll see' },
      { id: 'how-formed', label: 'How this formed' },
      { id: 'shaping-landscape', label: 'Shaping this landscape' },
      { id: 'ancient-life', label: 'Ancient life here' }
    ]
  },
  {
    id: 'plants',
    label: 'Plants & Ecology',
    icon: '🌲',
    subcategories: [
      { id: 'overview', label: 'Overview' },
      { id: 'trees-trail', label: 'Trees along the trail' },
      { id: 'plants-see', label: 'Plants you\'ll see' },
      { id: 'connect-here', label: 'How things connect here' },
      { id: 'seasons-trail', label: 'Seasons on this trail' }
    ]
  },
  {
    id: 'history',
    label: 'Historical Events',
    icon: '📜',
    subcategories: [
      { id: 'overview', label: 'Overview' },
      { id: 'settlers-exploration', label: 'Early settlers & exploration' },
      { id: 'wars-conflicts', label: 'Wars & conflicts' },
      { id: 'conservation', label: 'Conservation history' },
      { id: 'trail-story', label: 'This trail\'s story' }
    ]
  }
];

// Helper to create a lookup map
export const INTERESTS_MAP = INTERESTS.reduce((acc, interest) => {
  acc[interest.id] = interest;
  return acc;
}, {});

// Helper to get subcategory label
export const getSubcategoryLabel = (categoryId, subcategoryId) => {
  const category = INTERESTS_MAP[categoryId];
  if (!category) return subcategoryId;

  const subcategory = category.subcategories.find(s => s.id === subcategoryId);
  return subcategory?.label || subcategoryId;
};

// Category descriptions for API
export const CATEGORY_DESCRIPTIONS = {
  history: 'historical events and trail-specific stories—how this place was explored, settled, conserved, and celebrated',
  birds: 'the winged lives here—their songs, behaviors, seasonal journeys, and the role they play in this ecosystem',
  wildlife: 'the mammals, reptiles, amphibians, and diverse wildlife that inhabit this ecosystem—their behaviors, habitats, and ecological roles',
  indigenous: 'the Indigenous peoples who have stewarded this land, their deep relationship with place, and the cultural wisdom embedded in this landscape—approached with respect and care',
  geology: 'the deep time written in stone—how tectonic forces, water, ice, and wind sculpted this terrain over millions of years',
  plants: 'the plant communities, forests, and living systems that call this place home, and how they shift with the seasons'
};

// Subcategory modifiers for API
export const SUBCATEGORY_MODIFIERS = {
  'overview': '',

  // Birds subcategories
  'birds-nearby': ', focusing on the bird species you are most likely to see or hear right here on this trail—the accessible, observable avian neighbors of this place',
  'songs-hear': ', with emphasis on the birdsongs and calls you\'ll actually hear as you walk—the soundtrack of this trail',
  'migration': ', exploring seasonal migration patterns, timing, arrival and departure dates, and the incredible journeys these birds undertake',
  'spot-them': ', focusing on how to identify and spot birds you encounter—field marks, behaviors, habitats, and recognition tips',

  // Wildlife subcategories
  'animals-nearby': ', focusing on the wildlife you are most likely to see or encounter on this trail—the accessible, observable animals of this area',
  'signs-trail': ', highlighting the specific animal signs you might notice on this trail—tracks, scat, scratch marks, trails, and evidence of wildlife presence',
  'where-live': ', examining where wildlife lives in this specific landscape—their habitats, dens, territories, and how they use this terrain',
  'predators-here': ', exploring the predator-prey relationships specific to this ecosystem—who hunts whom, food webs, and ecological roles on this trail',

  // Indigenous subcategories
  'who-lived': ', with focus on which Indigenous peoples lived in this specific region—their names, territories, and deep connection to this land',
  'practices-region': ', exploring the cultural practices, seasonal rounds, and traditional knowledge systems developed in this specific region over thousands of years',
  'place-names-indigenous': ', focusing on Indigenous names for this place and nearby landmarks—their meanings, stories, and what they reveal about relationship with land',
  'communities-today': ', honoring the contemporary Indigenous communities connected to this land today—their ongoing stewardship, living traditions, and present-day relationship with this place',

  // Geology subcategories
  'rocks-see': ', focusing on the specific rocks, minerals, and geological features you\'ll actually see along this trail—the accessible geology beneath your feet',
  'how-formed': ', exploring how this specific landscape was formed—the tectonic forces, volcanic activity, glaciation, or ancient seas that created this terrain',
  'shaping-landscape': ', examining the erosion, weathering, and ongoing geological processes that are actively shaping this landscape right now',
  'ancient-life': ', focusing on fossils and traces of ancient life found in this region—what paleontology reveals about this area\'s deep past',

  // Plants subcategories
  'trees-trail': ', with emphasis on the specific tree species you\'ll encounter along this trail—their characteristics, ecology, and role in this forest',
  'plants-see': ', focusing on the understory plants, wildflowers, shrubs, and ground cover you\'ll actually see as you walk this trail',
  'connect-here': ', examining the specific ecological relationships, symbiosis, and connections between plants and animals in this ecosystem',
  'seasons-trail': ', exploring how this trail changes through the seasons—bloom times, fall colors, winter transformations, and the phenological calendar of this place',

  // Historical Events subcategories
  'settlers-exploration': ', focusing on early European exploration and settlement of this specific region—first encounters, pioneers, and how this land was claimed and colonized',
  'wars-conflicts': ', examining wars, conflicts, and struggles that occurred in or near this region—battles, territorial disputes, and their impact on this landscape',
  'conservation': ', exploring the conservation history of this area—how it was protected, who fought to preserve it, and the movements that saved this land',
  'trail-story': ', focusing on the specific story of this trail—who built it, when, why, and how it has evolved over time'
};
