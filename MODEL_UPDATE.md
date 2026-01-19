# Model Update Instructions

## Current Issue

The AI is saying it doesn't have access to current events. This is often because:

1. **Old Model**: Default is `gpt-4` which has older training data
2. **Need Newer Model**: Use a newer, cheaper model (e.g., `gpt-4o-mini` or `gpt-5-mini` if available on your account)

## Solution

### Update Your .env File

Change the model to a newer, cheaper one:

```bash
# Old (limited current events knowledge)
OPENAI_MODEL=gpt-4

# New (cheaper + strong)
OPENAI_MODEL=gpt-4o-mini

# If available on your account (cheaper + newer)
OPENAI_MODEL=gpt-5-mini
```

### Model Comparison

| Model | Training Cutoff | Current Events Knowledge |
|-------|----------------|------------------------|
| `gpt-4` | April 2023 | Limited |
| `gpt-4o-mini` | Recent | Good (cheap + fast) |
| `gpt-5-mini` | Newer | Better (if available) |

### Recommended: Use `gpt-4o-mini` (or `gpt-5-mini` if available)

- Cheapest reliable option
- Fast responses
- Good current events knowledge

### Steps

1. **Edit `.env` file:**
   ```
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **Restart server:**
   ```bash
   npm start
   ```

3. **Test with:**
   - "Is overthrowing the Islamic regime of Iran against the Quran?"
   - "What does the Bible say about the current conflict in Israel?"

## What Changed in Code

1. **Default model updated** to `gpt-4o-mini` (was `gpt-4`)
2. **Strengthened system prompt** with explicit instructions
3. **Added user message enhancement** for current events queries
4. **Multiple layers of instructions** to prevent "I don't have access" responses

The AI should now use its training data knowledge of current events!
