# Embedding Caching System

## How It Works

**No, you don't need to download or create embeddings every time!** The system uses intelligent caching.

## First Time Setup (One-Time Only)

When you first run the server:

1. **Download holy books** (one-time):
   ```bash
   # Download Quran (already done - 6,236 verses)
   python3 scripts/fetch-quran.py
   
   # Download Bible (once Node.js is installed)
   node scripts/download-bible-api.js
   ```

2. **Generate embeddings** (one-time, ~5-10 minutes):
   - Happens automatically on first server start
   - Creates embeddings for all passages
   - Saves to `cache/` directory:
     - `cache/bible_embeddings.json`
     - `cache/quran_embeddings.json`
     - `cache/torah_embeddings.json`

## Subsequent Runs (Fast!)

After the first time:

1. **Server starts** → Loads JSON files (instant)
2. **Checks cache** → Finds cached embeddings (instant)
3. **Uses cache** → No API calls needed! ⚡

**Startup time**: ~2-3 seconds (vs 5-10 minutes first time)

## Cache Files

- **Location**: `cache/` directory
- **Size**: 
  - Bible: ~50-100 MB
  - Quran: ~20-30 MB
  - Torah: ~10-15 MB
- **Format**: JSON files with passage + embedding pairs
- **Persistence**: Saved to disk, survives server restarts

## When Embeddings Are Regenerated

Embeddings are only regenerated if:

1. **Cache file missing** (first time)
2. **Passage count changed** (you updated the JSON file)
3. **Cache file corrupted** (rare)

Otherwise, cached embeddings are used automatically.

## Cost Savings

- **First time**: ~$0.10-0.50 (one-time embedding generation)
- **Subsequent runs**: $0.00 (uses cache, no API calls)

## Manual Cache Management

If you need to regenerate embeddings:

```bash
# Delete cache files
rm -rf cache/

# Restart server (will regenerate)
npm start
```

## Tips

- ✅ **Keep cache files** - They save time and money
- ✅ **Backup cache** - If you have large books, backup the cache directory
- ✅ **Git ignore** - Cache is already in `.gitignore` (too large for git)

## File Structure

```
holybookproject/
├── data/
│   ├── bible.json          # Source text (download once)
│   ├── quran.json          # Source text (download once)
│   └── torah.json          # Source text (auto-extracted)
├── cache/                  # Auto-generated, don't edit
│   ├── bible_embeddings.json
│   ├── quran_embeddings.json
│   └── torah_embeddings.json
└── ...
```

## Summary

- **Download books**: Once (or when you want to update)
- **Generate embeddings**: Once (automatic, cached forever)
- **Run server**: Every time (uses cache, fast startup)

The system is designed to be efficient - embeddings are expensive to generate but cheap to store and reuse!
