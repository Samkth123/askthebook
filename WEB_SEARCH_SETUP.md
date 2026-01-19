# Web Search Setup for Current Events

The system now includes web search capability to provide current events context when answering questions about contemporary situations.

## How It Works

When you ask questions about current events (like "Is overthrowing the Islamic regime of Iran against the Quran?"), the system will:

1. **Detect current events keywords** in your question
2. **Search the web** for relevant news and information
3. **Combine** the search results with relevant passages from the holy books
4. **Provide answers** that connect sacred texts to contemporary situations

## Web Search Mode

You can control when web search runs using `WEB_SEARCH_MODE`:

- `always` (default): search the web for every question
- `auto`: only search when current-events keywords are detected
- `off`: disable web search entirely

Add to your `.env`:
```
WEB_SEARCH_MODE=always
```

## Search Providers

The system supports multiple search providers (tries them in order):

### 1. DuckDuckGo (Always Available)
- ✅ **Free** - No API key needed
- ✅ **Privacy-focused**
- ✅ **Works out of the box**
- ⚠️ Limited results compared to paid services

### 2. SerpAPI (Recommended - Optional)
- ✅ **Best results** - Comprehensive news and web results
- ✅ **Free tier available** - 100 searches/month free
- 🔑 **Requires API key** - Get one at https://serpapi.com/

### 3. Google Custom Search (Alternative - Optional)
- ✅ **Good results** - Google's search quality
- 🔑 **Requires setup** - Need API key + Search Engine ID
- 📝 **Setup guide**: https://developers.google.com/custom-search

## Setup Instructions

### Basic Setup (DuckDuckGo - Works Immediately)

No setup needed! DuckDuckGo works automatically as a fallback.

### Enhanced Setup (SerpAPI - Recommended)

1. **Get free API key:**
   - Visit: https://serpapi.com/
   - Sign up (free tier: 100 searches/month)
   - Copy your API key

2. **Add to `.env` file:**
   ```
   SERPAPI_KEY=your_serpapi_key_here
   ```

3. **Restart server:**
   ```bash
   npm start
   ```

### Alternative Setup (Google Custom Search)

1. **Create Google Custom Search:**
   - Visit: https://programmablesearchengine.google.com/
   - Create a search engine
   - Get your Search Engine ID

2. **Get API key:**
   - Visit: https://console.cloud.google.com/
   - Enable Custom Search API
   - Create API key

3. **Add to `.env` file:**
   ```
   GOOGLE_SEARCH_API_KEY=your_google_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```

## Example Questions That Trigger Web Search

- "Is overthrowing the Islamic regime of Iran against the Quran?"
- "What does the Bible say about the current conflict in Israel?"
- "Is homosexuality a sin according to current interpretations?"
- "What does the Quran say about killing protesters?"

## How It Enhances Answers

**Without web search:**
- Answers based only on sacred texts
- May miss contemporary context

**With web search:**
- Searches for current events related to your question
- Finds relevant news articles and information
- Connects sacred text teachings to real-world situations
- Provides both traditional and contemporary perspectives

## Cost Considerations

- **DuckDuckGo**: Free, unlimited
- **SerpAPI**: Free tier (100 searches/month), then paid
- **Google Custom Search**: Free tier (100 searches/day), then paid

For most use cases, DuckDuckGo is sufficient. Add SerpAPI for better results if needed.

## Troubleshooting

### Web search not working?

1. **Check if question has current events keywords:**
   - Keywords like "iran", "protest", "current", "today" trigger search
   - General questions may not trigger search

2. **Check API keys:**
   - Verify keys are in `.env` file
   - Restart server after adding keys

3. **Check logs:**
   - Server logs will show which search provider is being used
   - Errors will be logged if search fails

### Want to disable web search?

Remove or comment out the web search code in `server.js` if you don't want this feature.

## Privacy Note

- DuckDuckGo: Privacy-focused, doesn't track
- SerpAPI: Standard privacy policy
- Google: Standard Google privacy policy

Choose based on your privacy preferences.
