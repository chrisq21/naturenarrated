# Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Get Your API Keys

You need three API keys:

1. **Google Maps API Key**
   - Go to: https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable "Places API" and "Maps JavaScript API"
   - Create credentials → API Key
   - Copy your key

2. **Anthropic API Key**
   - Go to: https://console.anthropic.com/
   - Sign up or log in
   - Go to API Keys section
   - Create a new key
   - Copy your key (starts with `sk-ant-`)

3. **ElevenLabs API Key**
   - Go to: https://elevenlabs.io/
   - Sign up (you'll get free credits to start)
   - Go to Profile → API Keys
   - Copy your key

### Step 2: Configure Environment Variables

1. Create `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your API keys:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
ELEVENLABS_API_KEY=your-actual-elevenlabs-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-google-key-here
```

### Step 3: Run the Development Server

```bash
npm run dev
```

### Step 4: Test It Out

1. Open http://localhost:3000
2. Search for "Rock Creek Park, Washington DC"
3. Select it from the dropdown
4. Choose 2-3 interests
5. Click "Generate My Trail Story"
6. Wait 2-3 minutes
7. Listen to your personalized trail story!

## Troubleshooting

### "Google is not defined" error
- Make sure your Google Maps API key starts with `NEXT_PUBLIC_`
- Restart the dev server after adding environment variables

### Story generation fails
- Check your Anthropic API key is correct
- Make sure you have Claude Sonnet 4 access
- Check console for error messages

### Audio generation fails
- Verify your ElevenLabs account has credits
- Check your API key is correct
- Try a shorter trail story

## Cost Warning

Each story costs approximately $0.96:
- Claude API: $0.04
- ElevenLabs: $0.90
- Google Places: $0.02

Start with just 1-2 test stories to verify everything works before generating more.

## Production Deployment

Ready to deploy? See the main README.md for Vercel deployment instructions.

## Need Help?

Check the main README.md for detailed troubleshooting and project documentation.
