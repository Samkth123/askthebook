# Holy Book Data Files

This directory should contain JSON files with the holy book texts in the following format:

## File Structure

Each book should have a file named `{bookname}.json` (e.g., `bible.json`, `quran.json`, `torah.json`)

## JSON Format

```json
{
  "passages": [
    {
      "reference": "John 3:16",
      "text": "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      "context": "Jesus speaking to Nicodemus about salvation"
    },
    {
      "reference": "Matthew 5:3",
      "text": "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
      "context": "The Beatitudes - Sermon on the Mount"
    }
  ]
}
```

## Required Fields

- **reference**: The chapter and verse reference (e.g., "John 3:16", "Al-Fatiha 1:1-7")
- **text**: The actual text of the passage
- **context** (optional): Additional context about the passage

## Getting the Texts

### Bible
- Public domain translations: King James Version (KJV), American Standard Version (ASV)
- Sources: Project Gutenberg, Bible Gateway API
- Format: Break into verse-level or paragraph-level passages

### Quran
- Public domain translations available
- Sources: Tanzil.net, Quran.com API
- Format: Verse-level passages with Surah and Ayah references

### Torah
- Same as Bible (first 5 books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
- Can use Bible sources for these books

## Processing Script

You can create a script to convert raw text files into this JSON format. The passages should be:
- Small enough for good semantic search (1-3 verses or a paragraph)
- Large enough to have meaningful context
- Properly referenced with chapter:verse format

## Example Processing

```javascript
// Example: Convert a verse file to JSON
const verses = [
  { book: "John", chapter: 3, verse: 16, text: "For God so loved..." },
  // ...
];

const passages = verses.map(v => ({
  reference: `${v.book} ${v.chapter}:${v.verse}`,
  text: v.text,
  context: `From ${v.book} chapter ${v.chapter}`
}));

fs.writeFileSync('bible.json', JSON.stringify({ passages }, null, 2));
```

## Note on Copyright

Make sure to use public domain or properly licensed translations. Many older translations are in the public domain.
