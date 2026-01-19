const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

class RAGSystem {
    constructor(openaiClient) {
        this.openai = openaiClient;
        this.embeddings = {}; // Store embeddings by book
        this.passages = {}; // Store passages by book
        this.embeddingModel = 'text-embedding-3-small'; // Cost-effective embedding model
    }

    // Load holy book texts from JSON files
    async loadBook(bookName) {
        const bookPath = path.join(__dirname, 'data', `${bookName}.json`);
        
        if (!fs.existsSync(bookPath)) {
            console.warn(`No data file found for ${bookName}. Creating empty structure.`);
            this.passages[bookName] = [];
            this.embeddings[bookName] = [];
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
            this.passages[bookName] = data.passages || [];
            const expectedCount = this.passages[bookName].length;
            
            // Try to load cached embeddings FIRST (much faster)
            const cacheLoaded = this.loadEmbeddingsCache(bookName);
            const cachedCount = this.embeddings[bookName] ? this.embeddings[bookName].length : 0;
            
            // Only generate embeddings if cache doesn't exist or is incomplete
            if (expectedCount > 0) {
                if (!cacheLoaded) {
                    console.log(`No cache found for ${bookName}. Generating embeddings (${expectedCount} passages)...`);
                    console.log(`This will take a few minutes but only needs to be done once.`);
                    await this.generateEmbeddings(bookName);
                } else if (cachedCount !== expectedCount) {
                    console.log(`Cache incomplete for ${bookName} (${cachedCount}/${expectedCount} passages). Regenerating...`);
                    await this.generateEmbeddings(bookName);
                } else {
                    console.log(`✅ Using cached embeddings for ${bookName} (${cachedCount} passages)`);
                }
            }
            
            console.log(`Loaded ${this.passages[bookName].length} passages for ${bookName}`);
        } catch (error) {
            console.error(`Error loading ${bookName}:`, error);
            this.passages[bookName] = [];
            this.embeddings[bookName] = [];
        }
    }

    // Generate embeddings for all passages in a book
    async generateEmbeddings(bookName) {
        if (!this.passages[bookName] || this.passages[bookName].length === 0) {
            console.warn(`No passages to generate embeddings for ${bookName}`);
            return;
        }

        console.log(`Starting embedding generation for ${bookName}...`);
        this.embeddings[bookName] = [];
        const batchSize = 100; // Process in batches to avoid rate limits

        for (let i = 0; i < this.passages[bookName].length; i += batchSize) {
            const batch = this.passages[bookName].slice(i, i + batchSize);
            const texts = batch.map(p => p.text);
            
            try {
                const response = await this.openai.embeddings.create({
                    model: this.embeddingModel,
                    input: texts
                });

                batch.forEach((passage, index) => {
                    this.embeddings[bookName].push({
                        passage: passage,
                        embedding: response.data[index].embedding
                    });
                });

                console.log(`Generated embeddings for ${Math.min(i + batchSize, this.passages[bookName].length)}/${this.passages[bookName].length} passages`);
            } catch (error) {
                console.error(`Error generating embeddings for batch ${i}:`, error);
            }
        }

        // Save embeddings to cache file
        this.saveEmbeddingsCache(bookName);
    }

    // Save embeddings cache to disk
    saveEmbeddingsCache(bookName) {
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        const cachePath = path.join(cacheDir, `${bookName}_embeddings.json`);
        fs.writeFileSync(cachePath, JSON.stringify(this.embeddings[bookName], null, 2));
        console.log(`Saved embeddings cache for ${bookName}`);
    }

    // Load embeddings from cache
    loadEmbeddingsCache(bookName) {
        const cachePath = path.join(__dirname, 'cache', `${bookName}_embeddings.json`);
        
        if (fs.existsSync(cachePath)) {
            try {
                const cachedData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                
                // Validate cache structure
                if (Array.isArray(cachedData) && cachedData.length > 0) {
                    this.embeddings[bookName] = cachedData;
                    console.log(`Found cache file for ${bookName} (${cachedData.length} embeddings)`);
                    return true;
                } else {
                    console.warn(`Cache file for ${bookName} is empty or invalid format`);
                    return false;
                }
            } catch (error) {
                console.error(`Error loading embeddings cache for ${bookName}:`, error.message);
                return false;
            }
        } else {
            console.log(`No cache file found for ${bookName} at ${cachePath}`);
            return false;
        }
    }

    // Calculate cosine similarity between two vectors
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Search for relevant passages using semantic search
    async searchRelevantPassages(bookName, query, conversationHistory = [], topK = 5) {
        if (!this.embeddings[bookName] || this.embeddings[bookName].length === 0) {
            console.warn(`No embeddings found for ${bookName}. Returning empty results.`);
            return [];
        }

        // Build enhanced query with conversation context
        let enhancedQuery = query;
        if (conversationHistory && conversationHistory.length > 0) {
            const recentContext = conversationHistory
                .slice(-3) // Last 3 messages
                .map(msg => msg.content)
                .join(' ');
            enhancedQuery = `${recentContext} ${query}`;
        }

        // Get embedding for the query
        try {
            const queryResponse = await this.openai.embeddings.create({
                model: this.embeddingModel,
                input: enhancedQuery
            });

            const queryEmbedding = queryResponse.data[0].embedding;

            // Calculate similarity scores
            const similarities = this.embeddings[bookName].map((item, index) => ({
                passage: item.passage,
                similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
                index: index
            }));

            // Sort by similarity and return top K
            similarities.sort((a, b) => b.similarity - a.similarity);
            
            const topPassages = similarities
                .slice(0, topK)
                .filter(item => item.similarity > 0.3) // Minimum similarity threshold
                .map(item => item.passage);

            return topPassages;
        } catch (error) {
            console.error('Error in semantic search:', error);
            return [];
        }
    }

    // Format retrieved passages for inclusion in prompt
    formatPassagesForPrompt(passages) {
        if (!passages || passages.length === 0) {
            return '';
        }

        return passages.map((passage, index) => {
            return `[Passage ${index + 1}]
Reference: ${passage.reference}
Text: ${passage.text}
${passage.context ? `Context: ${passage.context}` : ''}`;
        }).join('\n\n');
    }

    // Get current events context using web search
    // This is now handled by the WebSearch class
    async getCurrentEventsContext(query, conversationHistory = []) {
        // Web search is handled separately in server.js
        // This method is kept for backward compatibility
        return '';
    }
}

module.exports = RAGSystem;
