# TrailStory V0 - Proof of Concept

AI-powered audio stories that bring trails to life. This is a proof of concept demonstrating the core TrailStory experience.

## Features

- Search for any trail using Google Places API
- Select up to 3 interests (History, Indigenous History, Wildlife & Birds, Nature & Plants, Geology)
- AI generates a personalized 5-7 minute audio story using Claude
- Premium text-to-speech narration via ElevenLabs
- Download audio for offline listening

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **APIs:**
  - Google Places API (trail search)
  - Anthropic Claude API (story generation with web search)
  - ElevenLabs API (text-to-speech)
- **Deployment:** Vercel (recommended)

## Prerequisites

You'll need API keys for:

1. **Google Maps API** - [Get API key](https://developers.google.com/maps/documentation/javascript/get-api-key)
   - Enable Places API
   - Enable Maps JavaScript API

2. **Anthropic API** - [Get API key](https://console.anthropic.com/)
   - Requires Claude Sonnet 4 access
   - Web search tool must be enabled

3. **ElevenLabs API** - [Get API key](https://elevenlabs.io/)
   - Requires active subscription or credits

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Search for a trail** - Type a trail name with location (e.g., "Rock Creek Park, Washington DC")
2. **Select from dropdown** - Choose the correct trail from Google Places suggestions
3. **Choose interests** - Select 1-3 topics you want to learn about
4. **Generate story** - Click the button and wait 2-3 minutes
5. **Listen & download** - Play the audio story and optionally download it

## Project Structure

```
trailstory-poc/
├── app/
│   ├── page.js                    # Homepage with trail search
│   ├── customize/page.js          # Interest selection
│   ├── generating/page.js         # Loading screen
│   ├── story/page.js              # Story player
│   ├── layout.js                  # Root layout
│   ├── globals.css                # Global styles
│   └── api/
│       ├── generate-story/route.js  # Claude story generation
│       └── generate-audio/route.js  # ElevenLabs TTS
├── components/
│   ├── TrailSearch.js             # Google Places autocomplete
│   └── InterestSelector.js        # Interest checkboxes
├── public/                        # Static assets
├── .env.local                     # Environment variables (not in git)
├── package.json
├── next.config.js
└── tailwind.config.js
```

## Cost Per Story

| Service | Cost |
|---------|------|
| Claude API (with web search) | ~$0.04 |
| ElevenLabs API (5-7 min audio) | ~$0.90 |
| Google Places API | ~$0.02 |
| **Total** | **~$0.96** |

For testing with 10 stories: approximately $10

## Known Limitations (POC)

- No data persistence (refresh = lose story)
- Stories not saved (must regenerate)
- Audio passed via URL params (base64, max ~5MB)
- No user accounts
- No payment system
- Single session only

These are acceptable for a proof of concept. V1 will add proper database storage, user accounts, and payment integration.

## Troubleshooting

### Google Places not working
- Check API key is correct in `.env.local`
- Verify Places API is enabled in Google Cloud Console
- Check browser console for errors

### Story generation fails
- Check Anthropic API key
- Verify you have Claude Sonnet 4 access
- Check API console for error messages

### Audio generation fails
- Check ElevenLabs API key
- Verify you have credits/active subscription
- Try shorter text (< 1,200 words)

### Audio won't play
- Check browser supports MP3
- Verify base64 data URL is valid
- Check file size (should be < 5MB)

## Testing Checklist

- [ ] Search for "Rock Creek Park, Washington DC"
- [ ] Select from dropdown
- [ ] Choose 2-3 interests
- [ ] Generate story (wait 2-3 minutes)
- [ ] Verify story is 5-7 minutes long
- [ ] Play audio and verify quality
- [ ] Download audio file
- [ ] Try another trail

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app will be live at `your-project.vercel.app`

## Next Steps

After validating the POC:

1. Test with 5-10 real trails
2. Get feedback from 3-5 users
3. Validate story quality and audio naturalness
4. Proceed to V1 with:
   - Database for story storage
   - User accounts
   - Payment integration
   - Proper audio storage (S3/CDN)

## License

MIT

## Support

For issues or questions, please create an issue in the GitHub repository.
