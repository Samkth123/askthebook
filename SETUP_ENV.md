# Environment Setup

## Create .env File

Create a `.env` file in the project root with your OpenAI API key:

```bash
# Create .env file
cat > .env << 'EOF'
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Specify which OpenAI model to use
# Options: gpt-4, gpt-4-turbo, gpt-3.5-turbo
OPENAI_MODEL=gpt-4o-mini

# Server Port (default: 3000)
PORT=3000
EOF
```

Or manually create `.env` and paste:

```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

## Verify Setup

After creating `.env`, verify it works:

```bash
# Check if .env exists
ls -la .env

# Start the server (it will load the API key)
npm start
```

The server will automatically load the API key from `.env` when it starts.
