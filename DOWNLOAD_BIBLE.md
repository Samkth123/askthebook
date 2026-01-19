# Download Bible Instructions

## Quick Start

Once Node.js is installed, run:

```bash
# Option 1: Use environment variable
BIBLE_API_KEY=your_key_here node scripts/download-bible-api.js

# Option 2: Pass as CLI argument
node scripts/download-bible-api.js your_key_here
```

The script is already configured with your API key and will:
1. Download the full Bible (all 66 books)
2. Save to `data/bible.json`
3. Automatically extract Torah (first 5 books) to `data/torah.json`

## What's Configured

- **API Key**: Provide via `BIBLE_API_KEY` env var or CLI argument
- **API Endpoint**: Configured to try both:
  - `https://api.scripture.api.bible/v1` (standard)
  - `https://rest.api.bible` (alternative you provided)

## Expected Results

- **Bible**: ~31,000+ verses (all 66 books)
- **Torah**: ~5,800+ verses (Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
- **File sizes**: 
  - Bible: ~4-6 MB
  - Torah: ~1-2 MB

## Troubleshooting

If you get errors:

1. **Check API key**: Verify your API key is correct
2. **Check endpoint**: The script tries both endpoints automatically
3. **Rate limiting**: The script includes delays to avoid rate limits
4. **Network issues**: Make sure you have internet connection

## After Download

Once downloaded, the RAG system will automatically:
- Load the Bible and Torah on server startup
- Generate embeddings (takes 5-10 minutes first time)
- Cache embeddings for faster future use

Then you can ask questions like:
- "Is homosexuality a sin in the Bible?"
- "What does the Bible say about killing?"
- "Is overthrowing a regime against the Quran?"

And get accurate answers with proper references!
