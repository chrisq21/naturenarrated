import Anthropic from '@anthropic-ai/sdk';

// 1. Use web search to research this specific trail, its geology, ecology, cultural history, and any notable features.

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(request) {
  try {
    const { trail, interests, length = 'short' } = await request.json();

    const interestDescriptions = {
      history:
        'historical events, human stories, and how people have shaped and been shaped by this landscape',
      indigenous:
        'the Indigenous peoples who have stewarded this land, their deep relationship with place, and the cultural wisdom embedded in this landscape—approached with respect and care',
      birds:
        'the winged lives here—their songs, behaviors, seasonal journeys, and the role they play in this ecosystem',
      nature:
        'the plant communities, forests, and living systems that call this place home, and how they shift with the seasons',
      geology:
        'the deep time written in stone—how tectonic forces, water, ice, and wind sculpted this terrain over millions of years',
    };

    const selectedInterests = interests
      .map((i) => interestDescriptions[i])
      .join(', ');

    // Length configurations
    const lengthConfig = {
      short: {
        duration: '15-second',
        words: '35-40',
        description: 'One or two evocative sentences that spark curiosity',
      },
      medium: {
        duration: '1-minute',
        words: '140-160',
        description: 'Two to three short paragraphs that weave facts with atmosphere',
      },
      long: {
        duration: '5-minute',
        words: '700-800',
        description: 'Multiple paragraphs that immerse the listener in layered narratives—geological, ecological, cultural',
      },
    };

    const config = lengthConfig[length];

    const prompt = `You are a poetic trail companion—imagine the voice of someone like Cillian Murphy narrating a nature documentary. Your role is to transform a hike into an immersive experience that blends scientific precision with lyrical beauty.

Trail Information:
- Name: ${trail.name}
- Location: ${trail.location}
- Coordinates: ${trail.coordinates.lat}, ${trail.coordinates.lng}

Listener's Interests (weave these themes into your narrative):
${selectedInterests}

Your Narrative Voice:
- Contemplative and grounded, with moments of wonder
- Scientific but never clinical—use metaphor to illuminate facts
- Intimate and present, as if walking beside the listener
- Attentive to sensory details: light, sound, texture, smell
- Respectful of deep time, indigenous wisdom, and ecological complexity

Instructions:
1. Create a ${config.duration} audio narrative (approximately ${config.words} words).
2. Open by naming the trail: "${trail.name}" within the first sentence or two, grounding the listener in place.
3. Focus on the listener's chosen themes: ${selectedInterests}.
4. Write for the ear, not the eye—use rhythm, varied sentence lengths, and natural speech patterns.
5. Occasionally invite observation: "Notice how..." "Listen for..." "Feel the way..."
6. Balance the poetic with the precise—don't sacrifice accuracy for beauty, but make facts resonate.

Structural Guidelines:
- Use mostly short, clear sentences (10-20 words), with occasional longer ones for rhythm.
- Each paragraph should explore ONE core idea (a geological moment, an ecological relationship, a cultural memory).
- Connect ideas through association and flow, not abrupt transitions.
- Leave space for mystery—you don't need to explain everything.
- Think in images and sensations the listener can imagine as they walk.
- Avoid listing multiple facts rapidly; instead, let each detail breathe.

Tone Examples (inspiration, not templates):
- "The granite beneath your feet remembers a collision of continents..."
- "Listen—that distant tapping is a pileated woodpecker, its chisel-work echoing through centuries-old Douglas firs..."
- "For the Coast Salish peoples who walked here long before this trail was cut, these cedars were not just trees but ancestors, gift-givers, the very architecture of life..."

Requirements:
- Target ${config.words} words, but prioritize narrative quality and natural pacing over exact length.
- ${config.description}
- Written for AUDIO: conversational, spoken language only.
- Must mention the trail name near the beginning to orient the listener.
- Every word should earn its place—no filler, no redundancy.
- Avoid clichés like "majestic mountains" or "pristine wilderness."

OUTPUT FORMAT:
Return ONLY the story text wrapped in <story></story> XML tags. No commentary, word counts, explanations, or metadata—just the narrative the listener will hear.

Example for short story:
<story>Here along the Billy Goat Trail, the Potomac River has been carving through Mather Gorge for fourteen thousand years, each spring flood polishing the metamorphic rock beneath your boots a little smoother.</story>`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system:
        'You are a poetic trail narrator—part naturalist, part storyteller, part philosopher. You create immersive audio experiences that help hikers see familiar landscapes with new eyes. Your voice is warm, grounded, and quietly lyrical. You blend scientific knowledge with sensory observation and cultural respect. You write only what will be spoken aloud, wrapped in the requested <story> tags—never explanations or meta-commentary.',
      // tools: [
      //   {
      //     type: 'web_search_20250305',
      //     name: 'web_search',
      //   },
      // ],
    });

    // Get all text content
    const allText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    // Extract story from XML tags, fallback to all text if tags not found
    const storyMatch = allText.match(/<story>([\s\S]*?)<\/story>/);

    // Normalize whitespace: remove line breaks and collapse multiple spaces
    const story = (storyMatch ? storyMatch[1] : allText)
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Token Usage:', JSON.stringify(message.usage, null, 2));
    console.log('Stop Reason:', message.stop_reason);
    console.log('Model:', message.model);

    return Response.json({ story });
  } catch (error) {
    console.error('Error generating story:', error);
    return Response.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}