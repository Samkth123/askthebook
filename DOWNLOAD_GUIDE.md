# Download Guide: Getting Full Holy Books

This guide will help you download the complete texts of the Bible, Quran, and Torah for your RAG system.

## Quick Start

### Option 1: Automated Download (Recommended)

Once Node.js is installed, run:

```bash
# Download Quran (free API, no key needed)
node scripts/fetch-quran.js

# Or use Python (if you have it)
python3 scripts/fetch-quran.py
```

### Option 2: Manual Download Instructions

Follow the steps below for each book.

---

## 📖 Quran

### Automated (Easiest)

The Quran can be downloaded automatically using the free Al-Quran Cloud API:

```bash
# Using Node.js
node scripts/fetch-quran.js

# Or using Python
python3 scripts/fetch-quran.py
```

**Note:** If you get SSL certificate errors, you may need to:
- Run the script on your local machine (not in sandbox)
- Or install certificates: `pip install certifi` (Python) or update Node.js certificates

### Manual Download

1. **Visit:** https://api.alquran.cloud/v1/quran/en.pickthall
2. **Download the JSON** (this contains all 114 surahs)
3. **Convert to our format** using the script in `scripts/convert-quran-json.js`

---

## 📘 Bible

### Option 1: API.Bible (Free Tier)

1. **Sign up for free API key:**
   - Visit: https://scripture.api.bible/
   - Create free account
   - Get your API key

2. **Run the download script:**
   ```bash
   node scripts/download-bible-api.js YOUR_API_KEY
   ```

### Option 2: World English Bible (Public Domain)

1. **Download from Project Gutenberg:**
   - Visit: https://www.gutenberg.org/ebooks/8294
   - Download as plain text

2. **Convert to JSON:**
   - Use the parser script (create based on format)
   - Or manually structure the data

### Option 3: King James Version (KJV)

1. **Download from Project Gutenberg:**
   - Visit: https://www.gutenberg.org/ebooks/10
   - Download as plain text

2. **Parse and convert:**
   - The KJV text needs parsing by book/chapter/verse
   - Create a parser script based on the text format

---

## ✡️ Torah

The Torah is the first 5 books of the Bible:
- Genesis
- Exodus  
- Leviticus
- Numbers
- Deuteronomy

### Easy Method

After downloading the full Bible, the Torah will be automatically extracted, or you can:

1. **Download Bible** (see Bible section above)
2. **Extract first 5 books** using:
   ```bash
   node scripts/extract-torah.js
   ```

---

## 📝 Data Format

All books should be saved in `/data` directory as JSON files with this format:

```json
{
  "passages": [
    {
      "reference": "John 3:16",
      "text": "For God so loved the world...",
      "context": "Jesus speaking to Nicodemus"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### SSL Certificate Errors

If you get SSL errors when downloading:

**Python:**
```bash
# Install certifi
pip install certifi

# Or disable SSL verification (not recommended for production)
# Edit script to use: ssl._create_unverified_context()
```

**Node.js:**
```bash
# Update Node.js to latest version
# Or set NODE_TLS_REJECT_UNAUTHORIZED=0 (not recommended)
```

### API Rate Limiting

If you hit rate limits:
- Add delays between requests (scripts already include this)
- Run downloads during off-peak hours
- Use API keys with higher limits if available

### Large File Sizes

- Bible: ~4-6 MB JSON file
- Quran: ~2-3 MB JSON file  
- Torah: ~1-2 MB JSON file

Make sure you have enough disk space.

---

## ✅ Verification

After downloading, verify your files:

```bash
# Check file sizes
ls -lh data/*.json

# Check passage counts
node -e "const d=require('./data/quran.json'); console.log('Quran:', d.passages.length)"
node -e "const d=require('./data/bible.json'); console.log('Bible:', d.passages.length)"
node -e "const d=require('./data/torah.json'); console.log('Torah:', d.passages.length)"
```

Expected counts:
- **Quran:** ~6,236 verses (114 surahs)
- **Bible:** ~31,102 verses (66 books, KJV)
- **Torah:** ~5,845 verses (5 books)

---

## 🚀 Next Steps

After downloading:

1. **Start your server:**
   ```bash
   npm start
   ```

2. **The system will automatically:**
   - Load the JSON files
   - Generate embeddings (takes 5-10 minutes for full Bible)
   - Cache embeddings for faster future use

3. **Test the RAG system:**
   - Ask questions about specific topics
   - Verify references are accurate
   - Check that semantic search works

---

## 📚 Additional Resources

- **API.Bible:** https://scripture.api.bible/
- **Al-Quran Cloud:** https://alquran.cloud/api
- **Project Gutenberg:** https://www.gutenberg.org/
- **World English Bible:** https://worldenglish.bible/

---

## ⚠️ Copyright Notes

All recommended sources are:
- **Public domain** (KJV, Pickthall Quran)
- **Free to use** (World English Bible, API.Bible free tier)
- **Properly licensed** for your use case

Always verify copyright status for your specific jurisdiction.
