const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const RAGSystem = require('./rag');
const WebSearch = require('./websearch');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// Initialize OpenAI client
let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// Initialize RAG system
let ragSystem;
if (openai) {
    ragSystem = new RAGSystem(openai);
    
    // Load books on startup (loadBook now handles cache automatically)
    (async () => {
        console.log('Loading holy books...');
        await ragSystem.loadBook('bible');
        await ragSystem.loadBook('quran');
        await ragSystem.loadBook('torah');
        console.log('All books loaded and ready!');
    })();
}

// Initialize Web Search
const webSearch = new WebSearch();
console.log('Web search initialized');
if (process.env.SERPAPI_KEY) {
    console.log('  - SerpAPI: Enabled');
} else {
    console.log('  - SerpAPI: Disabled (set SERPAPI_KEY to enable)');
}
if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    console.log('  - Google Search: Enabled');
} else {
    console.log('  - Google Search: Disabled (set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to enable)');
}
console.log('  - DuckDuckGo: Enabled (fallback, no key needed)');

// Book-specific context and reference formats
const bookContexts = {
    bible: {
        name: 'Bible',
        description: 'the Christian Bible, including both Old and New Testaments',
        referenceFormat: 'Book Chapter:Verse (e.g., John 3:16, Matthew 5:3-12)',
        books: 'books of the Bible including Genesis, Exodus, Psalms, Proverbs, Gospels, Epistles, and Revelation'
    },
    quran: {
        name: 'Quran',
        description: 'the Holy Quran, the central religious text of Islam',
        referenceFormat: 'Surah Name (Chapter:Verse) (e.g., Al-Fatiha 1:1-7, Al-Baqarah 2:255)',
        books: 'Surahs (chapters) of the Quran'
    },
    torah: {
        name: 'Torah',
        description: 'the Torah, the first five books of the Hebrew Bible (Genesis, Exodus, Leviticus, Numbers, Deuteronomy)',
        referenceFormat: 'Book Chapter:Verse (e.g., Genesis 1:1, Exodus 20:1-17, Deuteronomy 6:4-9)',
        books: 'the five books of the Torah: Genesis, Exodus, Leviticus, Numbers, and Deuteronomy'
    }
};

// System prompt generator with RAG context
function getSystemPrompt(book, retrievedPassages = '', currentEventsContext = '') {
    const context = bookContexts[book];
    
    let prompt = `You are a knowledgeable and respectful AI assistant specialized in ${context.name}. Your role is to help users understand ${context.description} by:

1. Providing accurate answers based on the sacred texts
2. Always including specific references in the format: ${context.referenceFormat}
3. Offering modern interpretations and scholarly perspectives alongside traditional understanding
4. Being respectful of different faith traditions and interpretations
5. Acknowledging when questions may have multiple valid interpretations
6. Considering current events and contemporary context when relevant to the question

CURRENT EVENTS & WEB SEARCH:
- If web search context is provided, you MUST use it and cite the sources with links.
- If no web search context is provided, answer from general background knowledge and the sacred texts without claiming real-time access or browsing.
- Avoid definitive claims about very recent developments unless supported by provided web search context.
- Focus on moral/theological principles from the texts and how they can be applied to contemporary situations.

When answering:
- Always cite specific chapters and verses when referencing the text
- Use the provided passages as your primary source material
- Provide 2-4 relevant references per answer when possible
- Include both traditional and contemporary interpretations
- Be clear about the context and historical background when relevant
- Maintain a respectful and educational tone
- Give a clear, direct answer without excessive hedging
- Only mention uncertainty when it is essential; otherwise state the best-supported interpretation plainly
- When questions relate to current events, actively use your knowledge of those events to provide relevant context
- Avoid defaulting to numbered lists; use short paragraphs or bullets only when helpful
- Use numbering only when the user asks for steps or a clear sequence
- Always end with a concise follow-up question that offers 1-2 clear directions (e.g., “Want more on X or Y?”) to keep the conversation going

Format references clearly so they can be easily identified and extracted.`;

    if (retrievedPassages) {
        prompt += `\n\nRELEVANT PASSAGES FROM ${context.name.toUpperCase()}:\n${retrievedPassages}\n\nUse these passages to inform your answer. Quote directly from them when relevant.`;
    }

    if (currentEventsContext) {
        prompt += `\n\n${currentEventsContext}`;
    }

    return prompt;
}

// Extract references from AI response
function extractReferences(text, book) {
    const references = [];
    const context = bookContexts[book];
    
    // Patterns for different reference formats
    const patterns = [
        // Bible/Torah: "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
        /([1-3]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+(?:-\d+)?)/gi,
        // Quran: "Surah Name (Chapter:Verse)" or "Surah Name Chapter:Verse"
        /(?:Surah\s+)?([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s*(?:\(|\s)(\d+):(\d+(?:-\d+)?)/gi
    ];
    
    // Try to find references in the text
    for (const pattern of patterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const ref = match[0].trim();
            if (ref && !references.includes(ref)) {
                references.push(ref);
            }
        }
    }
    
    // If no references found with patterns, look for common reference indicators
    if (references.length === 0) {
        const refIndicators = [
            /(?:see|cf\.|reference|ref\.|cited in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+)/gi,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+\d+:\d+(?:-\d+)?)/g
        ];
        
        for (const pattern of refIndicators) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const ref = match[1] || match[0];
                if (ref && !references.includes(ref.trim())) {
                    references.push(ref.trim());
                }
            }
        }
    }
    
    return references.slice(0, 5); // Limit to 5 references
}

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { book, message, conversationHistory } = req.body;
        
        // Validate input
        if (!book || !message) {
            return res.status(400).json({ 
                error: 'Book and message are required' 
            });
        }
        
        if (!bookContexts[book]) {
            return res.status(400).json({ 
                error: 'Invalid book. Must be bible, quran, or torah' 
            });
        }
        
        if (!openai || !ragSystem) {
            return res.status(500).json({ 
                error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.' 
            });
        }
        
        // Use RAG to find relevant passages
        let retrievedPassages = [];
        let formattedPassages = '';
        
        try {
            retrievedPassages = await ragSystem.searchRelevantPassages(
                book, 
                message, 
                conversationHistory,
                5 // top 5 most relevant passages
            );
            
            if (retrievedPassages && retrievedPassages.length > 0) {
                formattedPassages = ragSystem.formatPassagesForPrompt(retrievedPassages);
                console.log(`Retrieved ${retrievedPassages.length} relevant passages for ${book}`);
            } else {
                console.warn(`No relevant passages found for ${book}. Using general knowledge.`);
            }
        } catch (ragError) {
            console.error('Error in RAG search:', ragError);
            // Continue without RAG if there's an error
        }
        
        // Get current events context using web search
        let currentEventsContext = '';
        let webSearchResults = null;
        const hasCurrentEventsQuery = webSearch.isCurrentEventsQuery(message);
        const webSearchMode = (process.env.WEB_SEARCH_MODE || 'always').toLowerCase();
        const shouldSearchWeb = webSearchMode === 'always'
            || (webSearchMode === 'auto' && hasCurrentEventsQuery);
        
        if (shouldSearchWeb) {
            try {
                console.log(`Web search mode: ${webSearchMode}. Searching web...`);
                webSearchResults = await webSearch.getCurrentEventsContext(message, conversationHistory);
                if (webSearchResults.hasContext && webSearchResults.formatted) {
                    currentEventsContext = `\n\nCURRENT EVENTS CONTEXT FROM WEB SEARCH:\n${webSearchResults.formatted}\n\nUse this information about current events to provide relevant context when answering the question. Connect the sacred text's teachings to these contemporary situations.`;
                    console.log(`✅ Found ${webSearchResults.results.length} web search results`);
                } else {
                    currentEventsContext = `\n\nCURRENT EVENTS SEARCH NOTICE:\nWeb search returned no results. Answer using general background knowledge and the sacred texts. Do not claim real-time access or browsing; avoid definitive claims about very recent developments.`;
                    console.log(`⚠️ Web search returned no results`);
                }
            } catch (error) {
                console.error('Error fetching current events:', error.message);
                currentEventsContext = `\n\nCURRENT EVENTS SEARCH NOTICE:\nWeb search failed. Answer using general background knowledge and the sacred texts. Do not claim real-time access or browsing; avoid definitive claims about very recent developments.`;
            }
        } else if (hasCurrentEventsQuery) {
            currentEventsContext = `\n\nCURRENT EVENTS NOTICE:\nThis question concerns current events, but web search is disabled. Answer using general background knowledge and the sacred texts. Avoid definitive claims about very recent developments.`;
        }
        
        // Build conversation messages
        const messages = [
            {
                role: 'system',
                content: getSystemPrompt(book, formattedPassages, currentEventsContext)
            }
        ];
        
        // Add conversation history
        if (conversationHistory && Array.isArray(conversationHistory)) {
            conversationHistory.forEach(msg => {
                if (msg.role && msg.content) {
                    messages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    });
                }
            });
        }
        
        // Add current message with enhanced context
        let enhancedMessage = message;
        if (retrievedPassages.length > 0) {
            enhancedMessage += `\n\nPlease answer based on the relevant passages provided, and connect the teachings to any current events or contemporary situations mentioned in my question.`;
        }
        
        // Add explicit instruction for current events queries
        if (hasCurrentEventsQuery) {
            enhancedMessage += `\n\nIMPORTANT: This question involves current events. Use any provided web search context and connect it to the sacred text teachings. If no web context is available, answer from general background knowledge without claiming real-time access, and avoid definitive claims about very recent developments.`;
        }
        
        messages.push({
            role: 'user',
            content: enhancedMessage
        });
        
        // Call OpenAI API
        // Note: OpenAI's web_search tool is only available in Responses API (different endpoint)
        // We use Chat Completions API, so we rely on our custom web search + AI's training data
        // Use a cheaper, strong default model
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`Using model: ${model}`);
        
        const completionOptions = {
            model: model,
            messages: messages
        };

        const isGpt5 = model.toLowerCase().startsWith('gpt-5');
        if (isGpt5) {
            completionOptions.max_completion_tokens = 1500;
            delete completionOptions.temperature;
        } else {
            completionOptions.max_tokens = 1500;
            completionOptions.temperature = 0.7;
        }

        let completion;
        try {
            completion = await openai.chat.completions.create(completionOptions);
        } catch (err) {
            // Retry once if temperature is not supported by the model
            if (err?.error?.param === 'temperature' || /temperature/i.test(err?.message || '')) {
                const retryOptions = { ...completionOptions };
                delete retryOptions.temperature;
                if (isGpt5) {
                    retryOptions.max_completion_tokens = retryOptions.max_completion_tokens || 1500;
                    delete retryOptions.max_tokens;
                }
                completion = await openai.chat.completions.create(retryOptions);
            } else {
                throw err;
            }
        }
        
        const response = (completion?.choices?.[0]?.message?.content || '').trim();
        if (!response) {
            console.warn('OpenAI response was empty.');
        }
        
        // Extract references from response and also include references from retrieved passages
        const responseReferences = extractReferences(response, book);
        const passageReferences = retrievedPassages.map(p => p.reference);
        
        // Combine and deduplicate references
        const allReferences = [...new Set([...responseReferences, ...passageReferences])];
        
        // Return response
        res.json({
            response: response || 'I had trouble generating a response. Please try again.',
            references: allReferences.slice(0, 8)
        });
        
    } catch (error) {
        console.error('Error in /api/chat:', error);
        
        // Handle specific OpenAI errors
        if (error.response) {
            return res.status(error.response.status || 500).json({
                error: error.response.data?.error?.message || 'Error communicating with AI service'
            });
        }
        
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const bibleLoaded = ragSystem && ragSystem.passages.bible && ragSystem.passages.bible.length > 0;
    const quranLoaded = ragSystem && ragSystem.passages.quran && ragSystem.passages.quran.length > 0;
    const torahLoaded = ragSystem && ragSystem.passages.torah && ragSystem.passages.torah.length > 0;
    
    res.json({ 
        status: 'ok',
        openaiConfigured: !!openai,
        ragConfigured: !!ragSystem,
        booksLoaded: {
            bible: bibleLoaded,
            quran: quranLoaded,
            torah: torahLoaded
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`OpenAI configured: ${!!openai}`);
    console.log(`RAG system initialized: ${!!ragSystem}`);
    
    if (!openai) {
        console.warn('WARNING: OPENAI_API_KEY not set. API will not work without it.');
    }
    
    if (ragSystem) {
        console.log('RAG system ready. Books will be loaded on first request if data files exist.');
        console.log('Place holy book JSON files in the /data directory (bible.json, quran.json, torah.json)');
    }
});
