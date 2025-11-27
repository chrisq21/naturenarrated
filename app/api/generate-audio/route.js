export async function POST(request) {
  try {
    const { text } = await request.json();

    // Validate API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not set in environment variables');
      return Response.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Clean text for audio: remove category labels and markdown formatting
    const cleanText = text
      .split('\n\n')
      .filter(para => !para.match(/^\*\*[^*]+\*\*$/))  // Remove label-only paragraphs
      .join('\n\n')
      .replace(/\*\*/g, '');  // Remove any remaining ** markers

    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/4YYIPFl9wE5c4L2eu2Gb', // Burt Reynolds voice
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorBody}`);
    }

    // Convert audio to base64 data URL
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return Response.json({ audioDataUrl });

  } catch (error) {
    console.error('Error generating audio:', error);
    return Response.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
