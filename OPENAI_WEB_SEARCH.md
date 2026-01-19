# OpenAI Built-in Web Search

## Current Implementation

We're now using **both** approaches:

1. **OpenAI's Built-in `web_search` Tool** (Primary)
   - Enabled when current events are detected
   - Uses OpenAI's Responses API `web_search` tool
   - More reliable and integrated with the model
   - Automatically incorporated into responses

2. **Custom Web Search** (Fallback)
   - DuckDuckGo, SerpAPI, Google Custom Search
   - Used if OpenAI's tool isn't available or fails
   - Provides context even if OpenAI's tool doesn't trigger

## How It Works

When a user asks about current events:

1. **Detection**: System detects current events keywords
2. **OpenAI Tool**: Adds `{ type: 'web_search' }` to the API call
3. **Automatic Search**: OpenAI model automatically uses web_search when needed
4. **Integrated Response**: Search results are automatically incorporated into the answer
5. **Fallback**: If OpenAI tool doesn't work, our custom search provides context

## API Format

```javascript
{
  model: "gpt-4",
  messages: [...],
  tools: [{ type: 'web_search' }]  // Added for current events queries
}
```

## Benefits

- ✅ **More Reliable**: OpenAI's web_search is optimized for the model
- ✅ **Better Integration**: Results are automatically incorporated
- ✅ **Up-to-date**: Accesses real-time web information
- ✅ **Fallback**: Custom search still available if needed

## Requirements

- OpenAI API key with access to Responses API features
- Model that supports tools (gpt-4, gpt-4-turbo, etc.)
- Current events keywords in the query

## Testing

Try asking:
- "Is overthrowing the Islamic regime of Iran against the Quran?"
- "What does the Bible say about the current conflict in Israel?"

The system will:
1. Detect current events keywords
2. Enable OpenAI's web_search tool
3. Model automatically searches and incorporates results
4. Provides answer with current events context
