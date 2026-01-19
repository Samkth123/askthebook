# Ask the Holy Book

A clean, interactive website for asking questions about the Bible, Quran, and Torah with AI-powered responses that include references and modern interpretations.

## Features

- **Book Selection**: Choose between Bible, Quran, or Torah
- **Chat Interface**: Clean, modern chat interface for conversations
- **RAG (Retrieval Augmented Generation)**: Semantic search through holy book texts to find relevant passages
- **Context-Aware**: Understands conversation history and current events
- **References**: Responses include chapter and verse references from actual texts
- **Modern Interpretations**: Answers include contemporary scholarly perspectives
- **AI-Powered**: Backend integration with OpenAI GPT-4 for intelligent responses

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   OPENAI_MODEL=gpt-4
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Load Holy Book Data:**
   The system includes sample passages in `/data` directory. For full functionality, you should add complete holy book texts:
   - Place JSON files: `bible.json`, `quran.json`, `torah.json` in the `/data` directory
   - See `/data/README.md` for the required format
   - The system will automatically generate embeddings on first use

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Frontend Only (Testing)

If you want to test the frontend without the backend:

1. Open `index.html` directly in a web browser
2. Select a book (Bible, Quran, or Torah)
3. Start asking questions (will use fallback responses)

## API Endpoints

### POST `/api/chat`

Sends a message to the AI and receives a response with references.

**Request:**
```json
{
  "book": "bible|quran|torah",
  "message": "user's question",
  "conversationHistory": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ]
}
```

**Response:**
```json
{
  "response": "AI-generated answer with context and interpretations",
  "references": ["John 3:16", "Matthew 5:3-12", "1 Corinthians 13:4-7"]
}
```

### GET `/api/health`

Health check endpoint to verify server and API configuration.

**Response:**
```json
{
  "status": "ok",
  "openaiConfigured": true
}
```

## File Structure

```
holybookproject/
├── index.html          # Main HTML structure
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Express backend server
├── rag.js              # RAG system for semantic search
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── data/               # Holy book data files
│   ├── bible.json      # Bible passages (JSON format)
│   ├── quran.json      # Quran passages (JSON format)
│   ├── torah.json      # Torah passages (JSON format)
│   └── README.md       # Data format documentation
├── cache/              # Cached embeddings (auto-generated)
└── README.md           # This file
```

## Technologies

- **Frontend**: Plain HTML, CSS, and JavaScript (no frameworks)
- **Backend**: Node.js with Express
- **AI**: OpenAI GPT-4 (configurable)
- **RAG**: Semantic search using OpenAI embeddings
- **Styling**: Clean, modern UI design with responsive layout

## How RAG Works

The system uses **Retrieval Augmented Generation (RAG)** to provide accurate, context-aware answers:

1. **Question Analysis**: When you ask a question, the system analyzes it along with your conversation history
2. **Semantic Search**: Uses AI embeddings to search through the holy book texts for relevant passages
3. **Context Retrieval**: Finds the top 5 most relevant passages based on semantic similarity
4. **Enhanced Answering**: The AI uses these retrieved passages to provide accurate answers with proper references
5. **Current Events**: The system recognizes when questions relate to current events and provides contextual interpretations

### Example Flow

**Question**: "Is overthrowing the Islamic regime of Iran against the Quran?"

1. System searches Quran for passages about killing, violence, and oppression
2. Finds relevant verses like Al-Ma'idah 5:32 (prohibition of killing)
3. AI answers using these passages, connecting them to the current situation in Iran
4. Provides both traditional interpretation and contemporary application

## Configuration

### Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `OPENAI_MODEL` (optional): Model to use (default: `gpt-4`)
- `PORT` (optional): Server port (default: `3000`)

### Customization

- **Styling**: Modify `styles.css` to change colors, fonts, or layout
- **Frontend Logic**: Update `script.js` to change API endpoints or add features
- **Backend Logic**: Modify `server.js` to change AI prompts or add features
- **AI Prompts**: Edit the `getSystemPrompt()` function in `server.js` to customize AI behavior

## Development

The backend server includes:
- CORS enabled for frontend communication
- Static file serving for the frontend
- Error handling and validation
- Reference extraction from AI responses
- Book-specific context and formatting

## Production Deployment

For production deployment:

1. Set environment variables on your hosting platform
2. Use a process manager like PM2: `pm2 start server.js`
3. Set up a reverse proxy (nginx) if needed
4. Enable HTTPS
5. Consider rate limiting for API endpoints
6. Monitor API usage and costs

## Notes

- The AI is configured with book-specific prompts to ensure accurate references
- References are automatically extracted from AI responses
- The system includes fallback responses if the API is unavailable
- Ensure your OpenAI account has sufficient credits for API usage
