import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Simple in-memory rate limiter (use Redis in production)
const tokenTracker = {
  tokens: 0,
  resetTime: Date.now() + 60000, // Reset every minute
};

function checkRateLimit(estimatedTokens) {
  const now = Date.now();

  // Reset counter every minute
  if (now > tokenTracker.resetTime) {
    tokenTracker.tokens = 0;
    tokenTracker.resetTime = now + 60000;
  }

  // Check if this request would exceed limit
  if (tokenTracker.tokens + estimatedTokens > 28000) { // Leave 2k buffer
    const waitTime = tokenTracker.resetTime - now;
    return { allowed: false, waitTime };
  }

  return { allowed: true, waitTime: 0 };
}

function trackTokens(inputTokens) {
  tokenTracker.tokens += inputTokens;
}

export async function POST(request) {
  try {
    const { trail, interests, length = 'short', useWebSearch = 'auto' } = await request.json();

    // Estimate tokens (very rough - average ~4 chars per token)
    const estimatedAssessmentTokens = useWebSearch === 'auto' ? 200 : 0; // Small assessment call
    const estimatedPromptTokens = 2000; // Base prompt
    const estimatedSearchTokens = useWebSearch === 'off' ? 0 : 15000; // Search results can be large
    const totalEstimate = estimatedAssessmentTokens + estimatedPromptTokens + estimatedSearchTokens;

    // Check rate limit
    const rateCheck = checkRateLimit(totalEstimate);
    if (!rateCheck.allowed) {
      return Response.json(
        {
          error: 'Rate limit reached',
          retryAfter: Math.ceil(rateCheck.waitTime / 1000),
          message: `Please wait ${Math.ceil(rateCheck.waitTime / 1000)} seconds before trying again.`
        },
        { status: 429 }
      );
    }

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
1. ${useWebSearch === 'on' ? 'Use web search SPARINGLY and STRATEGICALLY—only when you need specific verification of details you are uncertain about. Prefer your training knowledge when confident. Limit to 1-3 focused searches maximum.' : 'Draw on your training knowledge about this region. You do NOT need trail-specific details—regional knowledge about the geology, ecology, indigenous peoples, and wildlife of this area is perfectly sufficient. Use what you know confidently.'}
2. Create a ${config.duration} audio narrative (approximately ${config.words} words).
3. STRUCTURE YOUR NARRATIVE IN THIS ORDER:
   
   a) OPENING PARAGRAPH: Begin with the trail name ("${trail.name}") and set the scene. Give a brief sense of place—where this landscape sits, what makes it distinctive. This is your invitation into the story. (About 20-25% of total words)
   
   b) TOPIC-SPECIFIC SECTIONS: Then devote focused attention to EACH of the listener's chosen interests. Treat each topic substantively:
      ${interests.map(i => `- ${interestDescriptions[i]}`).join('\n      ')}
   
   For EACH selected topic:
   - Dedicate a full paragraph (or more for longer stories)
   - Provide SPECIFIC, CONCRETE details: actual species names, geological time periods, indigenous nation names, historical dates
   - Go deeper than surface-level mentions—if it's birds, tell me which birds, their calls, behaviors, why they're here
   - If it's geology, tell me the rock type, the forces, the timeline
   - If it's indigenous history, name the peoples, describe their practices, honor their relationship with this specific place
   
   c) NATURAL INTERSECTIONS: Where topics genuinely connect (indigenous burning practices shaping bird habitat, geology creating plant microclimates), weave them together organically. But don't force connections—depth over artificial synthesis.

4. Write for the ear, not the eye—use rhythm, varied sentence lengths, and natural speech patterns.
5. Occasionally invite observation: "Notice how..." "Listen for..." "Feel the way..."
6. Balance the poetic with the precise—don't sacrifice accuracy for beauty, but make facts resonate.

Structural Guidelines:
- Start with an INTRO PARAGRAPH that orients the listener (trail name, sense of place, brief invitation)
- Then address EACH selected topic in its own dedicated section with substantial depth
- Use mostly short, clear sentences (10-20 words), with occasional longer ones for rhythm
- Each topic section should include SPECIFIC DETAILS: species names, geological ages, indigenous nations, particular behaviors or phenomena
- For example, don't just say "birds live here"—tell me "the wood thrush, the scarlet tanager, the red-eyed vireo" and what they're doing
- Don't just say "Indigenous peoples lived here"—name them (Nacotchtank, Piscataway, etc.) and describe specific practices
- Don't just say "old rocks"—tell me granite, schist, limestone, and when they formed
- Connect topics where they naturally intersect, but prioritize depth over forced synthesis
- Leave space for mystery—you don't need to explain everything
- Think in images and sensations the listener can imagine as they walk
- Avoid mentioning multiple topics superficially in a single paragraph; instead, give each topic room to breathe

Tone Examples (inspiration, not templates):
- "The granite beneath your feet remembers a collision of continents..."
- "Listen—that distant tapping is a pileated woodpecker, its chisel-work echoing through centuries-old Douglas firs..."
- "For the Coast Salish peoples who walked here long before this trail was cut, these cedars were not just trees but ancestors, gift-givers, the very architecture of life..."

STRUCTURE EXAMPLE (if interests were "birds" and "indigenous"):
Paragraph 1 (Intro): "Here at [Trail Name], you're walking through a landscape where forest meets wetland, creating one of the richest bird habitats in the region..."

Paragraph 2 (Birds - specific): "Listen for the wood thrush—that liquid, flute-like trill echoing from the understory. They've just arrived from Central America, traveling at night by the stars to reach these exact breeding grounds. The males are establishing territories now, each song a claim to ten or fifteen acres of forest floor where they'll nest in the low branches of spicebush and mountain laurel..."

Paragraph 3 (Indigenous - specific): "The Piscataway people called this watershed home for twelve thousand years. They knew the rhythms of the shad runs, returning each spring to fish the tributaries. Their practice of controlled burning kept the oak forests open, creating the edge habitat that still draws migrating warblers today..."

Paragraph 4 (Natural intersection): "That connection between fire and birds isn't accidental—the cleared understory the Piscataway maintained created the very conditions wood thrushes prefer: open ground for foraging, dense canopy above for nesting..."

Requirements:
- Target ${config.words} words, but prioritize narrative quality and natural pacing over exact length.
- ${config.description}
- Written for AUDIO: conversational, spoken language only.
- Must mention the trail name near the beginning to orient the listener.
- Every word should earn its place—no filler, no redundancy.
- Avoid clichés like "majestic mountains" or "pristine wilderness."

OUTPUT FORMAT:
Return ONLY the story text wrapped in <story></story> XML tags. No commentary, word counts, explanations, or metadata—just the narrative the listener will hear.

Example structure for a medium-length story with "geology" and "birds" interests:
<story>Here along the Billy Goat Trail, the Potomac River has carved through Mather Gorge for fourteen thousand years, creating one of the most geologically dramatic landscapes within sight of any capital city. The bedrock beneath your boots is Mather Gorge schist—ancient seafloor sediments that were buried, compressed, and metamorphosed nearly five hundred million years ago, long before the first fish crawled onto land. Notice the wavy bands in the rock, each layer a remnant of deep ocean mud, now tilted nearly vertical by the collision that built the Appalachian Mountains. The Potomac has been exploiting these weaknesses ever since the glaciers retreated, carving deeper each spring flood. Listen for the sharp killy-killy-killy call—that's a common yellowthroat, a tiny warbler that nests in the riverside thickets. They migrate here each April from Mexico and Central America, the males arriving first to claim the best territories among the sycamores and river birch. Watch for their distinctive black mask as they flit through the understory, hunting insects stirred up by the river's edge.</story>`;

    // Determine if web search should be enabled
    let enableWebSearch = useWebSearch === 'on';

    if (useWebSearch === 'auto') {
      // Ask Claude if it needs web search for this region
      const assessmentPrompt = `Region: ${trail.location}
Trail: ${trail.name}
User interests: ${interests.join(', ')}

Do you have sufficient knowledge from your training data to create a detailed, accurate ${length} story about this REGION covering these topics? Focus on regional knowledge, not trail-specific details. Consider:
- Do you know the geology and landscape formation of this region?
- Do you know which indigenous peoples historically lived in this area?
- Can you name specific bird/plant/animal species native to this region?
- Do you understand the ecological systems and climate of this area?

Respond with ONLY "YES" if you have strong regional knowledge, or "NO" if you need web search for accuracy.`;

      const assessment = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: assessmentPrompt }],
        system: [
          {
            type: 'text',
            text: 'You are a trail knowledge assessor. Respond with only YES or NO.',
            cache_control: { type: 'ephemeral' }
          }
        ],
      });

      // Track assessment tokens
      if (assessment.usage) {
        trackTokens(assessment.usage.input_tokens);
      }

      const assessmentResponse = assessment.content[0].text.trim().toUpperCase();
      const needsSearch = assessmentResponse.includes('NO');
      enableWebSearch = needsSearch;

      // Log the assessment decision
      console.log('=== Web Search Assessment ===');
      console.log(`Trail: ${trail.name}`);
      console.log(`Location: ${trail.location}`);
      console.log(`Interests: ${interests.join(', ')}`);
      console.log(`Assessment Response: ${assessmentResponse}`);
      console.log(`Web Search Enabled: ${enableWebSearch}`);
      console.log('============================');
    } else {
      console.log('=== Web Search Assessment ===');
      console.log(`Trail: ${trail.name}`);
      console.log(`Mode: ${useWebSearch}`);
      console.log(`Web Search Enabled: ${enableWebSearch}`);
      console.log('============================');
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: [
        {
          type: 'text',
          text: 'You are a poetic trail narrator—part naturalist, part storyteller, part philosopher. You create immersive audio experiences that help hikers see familiar landscapes with new eyes. Your voice is warm, grounded, and quietly lyrical. You blend scientific knowledge with sensory observation and cultural respect. You write only what will be spoken aloud, wrapped in the requested <story> tags—never explanations or meta-commentary.',
          cache_control: { type: 'ephemeral' }
        }
      ],
      ...(enableWebSearch && {
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
          },
        ],
      }),
    });

    // Track actual token usage
    if (message.usage) {
      trackTokens(message.usage.input_tokens);

      console.log('=== Story Generation Complete ===');
      console.log(`Input Tokens: ${message.usage.input_tokens}`);
      console.log(`Output Tokens: ${message.usage.output_tokens}`);
      if (message.usage.cache_creation_input_tokens) {
        console.log(`Cache Creation Tokens: ${message.usage.cache_creation_input_tokens}`);
      }
      if (message.usage.cache_read_input_tokens) {
        console.log(`Cache Read Tokens: ${message.usage.cache_read_input_tokens}`);
      }
      console.log(`Web Search Used: ${enableWebSearch}`);
      console.log('=================================');
    }

    // Get all text content
    const allText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    // Extract story from XML tags, fallback to all text if tags not found
    const storyMatch = allText.match(/<story>([\s\S]*?)<\/story>/);

    // Normalize whitespace while preserving intentional paragraph breaks:
    // 1. Preserve double line breaks (paragraph separators)
    // 2. Remove single line breaks within paragraphs
    // 3. Collapse multiple spaces
    const story = (storyMatch ? storyMatch[1] : allText)
      .replace(/\n\n+/g, '<<<PARAGRAPH_BREAK>>>') // Temporarily mark paragraph breaks
      .replace(/\n/g, ' ') // Remove single line breaks
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/<<<PARAGRAPH_BREAK>>>/g, '\n\n') // Restore paragraph breaks
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