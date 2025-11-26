import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(request) {
  try {
    const { trail, interests, length = 'short' } = await request.json();

    const interestDescriptions = {
      history:
        'historical events, colonial history, and modern development in and around this trail',
      indigenous:
        'Indigenous peoples who lived here, their relationship with the land, and the cultural significance of this place, handled in a meaningful and progressive way',
      birds:
        'bird species in the area, birdwatching tips, their calls and behaviors, and any notable migration patterns',
      nature:
        'trees, plants, flowers, ecosystems, and how this landscape changes with the seasons',
      geology:
        'rock formations, geological history, terrain features, and how this landscape was formed over time',
    };

    const selectedInterests = interests
      .map((i) => interestDescriptions[i])
      .join(', ');

    // Length configurations
    const lengthConfig = {
      short: {
        duration: '15-second',
        words: '35-40',
        description: 'Just one or two sentences maximum',
      },
      medium: {
        duration: '1-minute',
        words: '140-160',
        description: 'Two to three short paragraphs with engaging details',
      },
      long: {
        duration: '5-minute',
        words: '700-800',
        description: 'Multiple paragraphs with rich storytelling and vivid details',
      },
    };

    const config = lengthConfig[length];

    const prompt = `You are creating a ${config.duration} audio trail story for hikers who are walking alone and want a friendly, knowledgeable companion.

Trail Information:
- Name: ${trail.name}
- Location: ${trail.location}
- Coordinates: ${trail.coordinates.lat}, ${trail.coordinates.lng}

User's Interests (prioritize these themes in the story):
${selectedInterests}

Instructions:
1. Use web search to research this specific trail and its surrounding region.
2. Create an engaging ${config.duration} audio story (aim for about ${config.words} words when read aloud).
3. Write in a conversational, warm tone, as if you are gently walking alongside the listener.
4. Start the story by mentioning the trail name: "${trail.name}". Only mention the trail itself; do not mention parking, logistics, or app usage.
5. Focus on fascinating details about the user's selected interests: ${selectedInterests}.
6. Imagine the listener is actively walking: occasionally invite them to look, listen, or notice specific things around them (trees, sounds, views, textures).
7. Keep the pacing calm and reflective. Avoid sounding like a lecture or textbook.

Narrative and pacing guidelines:
- Use mostly short, clear sentences (often under 20 words).
- Each paragraph should have ONE main idea (for example: Indigenous history, a plant community, a geological feature).
- Do NOT jump rapidly between many topics in a single paragraph.
- Connect ideas gently from one paragraph to the next, like a flowing walk.
- It’s okay to leave some mystery and wonder; you don’t need to explain everything.
- You are a friendly guide, not a professor.
- Avoid long lists of facts. Prefer small, vivid scenes and images the listener can imagine or notice as they walk.

Requirements:
- Aim for approximately ${config.words} words, but quality, clarity, and rhythm are more important than hitting an exact count.
- This is for AUDIO, so write exactly how people speak in real conversation.
- ${config.description}
- MUST begin by mentioning the trail name in the first sentence.
- Make every word count; avoid filler and repeated phrases.

Tone examples (you may echo this style, but do not copy these exact sentences):
- "As you walk along this stretch..."
- "If you pause for a moment and listen..."
- "On your left, just beyond the edge of the trail..."

OUTPUT FORMAT:
Wrap your story in <story></story> XML tags. Return ONLY the story text between these tags with no additional commentary, explanations, word counts, or metadata. The tags should contain exactly what will be spoken aloud to the hiker.

Example for short story:
<story>Here at Rock Creek Park, you're walking the same trails President Theodore Roosevelt used for his wilderness escapes, right in the heart of Washington, DC.</story>`;

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
        'You are an expert trail narrator and hiking companion. You create warm, grounded, easy-to-follow audio stories for people walking on real trails. You only output the story text wrapped in the requested <story> XML tags—never explanations, meta-information, or commentary.',
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        },
      ],
      // optional: if your Anthropic client supports explicit tool_choice, you can add it here
      // tool_choice: { type: "auto" }
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

    return Response.json({ story });
  } catch (error) {
    console.error('Error generating story:', error);
    return Response.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
