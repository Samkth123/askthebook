/**
 * Web Search Module for Current Events
 * Supports multiple search providers
 */

const axios = require('axios');
const cheerio = require('cheerio');

class WebSearch {
    constructor() {
        // Search provider configuration
        this.providers = {
            duckduckgo: {
                name: 'DuckDuckGo',
                enabled: true,
                requiresKey: false
            },
            serpapi: {
                name: 'SerpAPI',
                enabled: !!process.env.SERPAPI_KEY,
                requiresKey: true,
                apiKey: process.env.SERPAPI_KEY
            },
            google: {
                name: 'Google Custom Search',
                enabled: !!process.env.GOOGLE_SEARCH_API_KEY && !!process.env.GOOGLE_SEARCH_ENGINE_ID,
                requiresKey: true,
                apiKey: process.env.GOOGLE_SEARCH_API_KEY,
                engineId: process.env.GOOGLE_SEARCH_ENGINE_ID
            }
        };
    }

    // Detect if query relates to current events
    isCurrentEventsQuery(query) {
        const currentEventsKeywords = [
            'iran', 'israel', 'palestine', 'gaza', 'ukraine', 'russia',
            'protest', 'regime', 'killing', 'violence', 'war', 'conflict',
            'current', 'today', 'recent', 'now', 'happening', 'latest',
            'news', 'breaking', 'crisis', 'revolution', 'uprising'
        ];
        
        const lowerQuery = query.toLowerCase();
        return currentEventsKeywords.some(keyword => lowerQuery.includes(keyword));
    }

    // Search using DuckDuckGo HTML (free, no API key needed)
    async searchDuckDuckGo(query, maxResults = 5) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; AskTheHolyBook/1.0)'
        };
        const results = [];

        const tryParse = (html, selectors) => {
            const $ = cheerio.load(html);
            selectors.forEach(({ linkSel, snippetSel }) => {
                if (results.length >= maxResults) return;
                $(linkSel).each((i, el) => {
                    if (results.length >= maxResults) return;
                    const title = $(el).text().trim();
                    const url = $(el).attr('href');
                    if (!title || !url) return;
                    let snippet = '';
                    if (snippetSel) {
                        const snippetEl = $(el).closest('div').find(snippetSel).first();
                        snippet = snippetEl.text().trim();
                    }
                    results.push({
                        title,
                        snippet: snippet || 'No description available.',
                        url,
                        source: 'DuckDuckGo'
                    });
                });
            });
        };

        try {
            // Primary: DuckDuckGo HTML
            const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const htmlResponse = await axios.get(htmlUrl, { timeout: 10000, headers });
            tryParse(htmlResponse.data, [
                { linkSel: 'a.result__a', snippetSel: '.result__snippet' }
            ]);
        } catch (error) {
            console.error('DuckDuckGo HTML search error:', error.message);
        }

        if (results.length < maxResults) {
            try {
                // Fallback: DuckDuckGo lite
                const liteUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
                const liteResponse = await axios.get(liteUrl, { timeout: 10000, headers });
                tryParse(liteResponse.data, [
                    { linkSel: 'a.result-link', snippetSel: '.result-snippet' }
                ]);
            } catch (error) {
                console.error('DuckDuckGo lite search error:', error.message);
            }
        }

        return results.slice(0, maxResults);
    }

    // Search using SerpAPI (requires API key)
    async searchSerpAPI(query, maxResults = 5) {
        if (!this.providers.serpapi.enabled) {
            return [];
        }

        try {
            const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${this.providers.serpapi.apiKey}`;
            
            const response = await axios.get(url, { timeout: 10000 });
            const data = response.data;
            
            if (data.organic_results && data.organic_results.length > 0) {
                return data.organic_results.slice(0, maxResults).map(result => ({
                    title: result.title,
                    snippet: result.snippet,
                    url: result.link,
                    source: 'SerpAPI'
                }));
            }
            
            return [];
        } catch (error) {
            console.error('SerpAPI search error:', error.message);
            return [];
        }
    }

    // Search using Google Custom Search (requires API key)
    async searchGoogle(query, maxResults = 5) {
        if (!this.providers.google.enabled) {
            return [];
        }

        try {
            const url = `https://www.googleapis.com/customsearch/v1?key=${this.providers.google.apiKey}&cx=${this.providers.google.engineId}&q=${encodeURIComponent(query)}&num=${maxResults}`;
            
            const response = await axios.get(url, { timeout: 10000 });
            const data = response.data;
            
            if (data.items && data.items.length > 0) {
                return data.items.map(item => ({
                    title: item.title,
                    snippet: item.snippet,
                    url: item.link,
                    source: 'Google'
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Google search error:', error.message);
            return [];
        }
    }

    // Main search function - tries multiple providers
    async search(query, maxResults = 5) {
        console.log(`Searching web for: ${query}`);
        
        // Try providers in order of preference
        let results = [];
        let lastError = null;
        
        // Try SerpAPI first (best results)
        if (this.providers.serpapi.enabled) {
            try {
                results = await this.searchSerpAPI(query, maxResults);
                if (results.length > 0) {
                    console.log(`✅ Found ${results.length} results from SerpAPI`);
                    return results;
                }
            } catch (error) {
                lastError = error;
                console.log(`SerpAPI search failed: ${error.message}`);
            }
        }
        
        // Try Google Custom Search
        if (this.providers.google.enabled) {
            try {
                results = await this.searchGoogle(query, maxResults);
                if (results.length > 0) {
                    console.log(`✅ Found ${results.length} results from Google`);
                    return results;
                }
            } catch (error) {
                lastError = error;
                console.log(`Google search failed: ${error.message}`);
            }
        }
        
        // Fallback to DuckDuckGo (always available)
        try {
            results = await this.searchDuckDuckGo(query, maxResults);
            if (results.length > 0) {
                console.log(`✅ Found ${results.length} results from DuckDuckGo`);
                return results;
            }
        } catch (error) {
            lastError = error;
            console.log(`DuckDuckGo search failed: ${error.message}`);
        }
        
        console.log(`⚠️ No search results found from any provider${lastError ? ` (last error: ${lastError.message})` : ''}`);
        return [];
    }

    // Format search results for AI prompt
    formatSearchResults(results) {
        if (!results || results.length === 0) {
            return '';
        }

        return results.map((result, index) => {
            return `[News/Current Event ${index + 1}]
Title: ${result.title}
Summary: ${result.snippet}
Source: ${result.url}`;
        }).join('\n\n');
    }

    // Enhanced search specifically for current events context
    async getCurrentEventsContext(query, conversationHistory = []) {
        // Build enhanced search query
        let searchQuery = query;
        
        // Add context from conversation if relevant
        if (conversationHistory && conversationHistory.length > 0) {
            const recentMessages = conversationHistory
                .slice(-2)
                .map(msg => msg.content)
                .join(' ');
            
            // Extract key terms for search
            const keyTerms = this.extractKeyTerms(query + ' ' + recentMessages);
            if (keyTerms.length > 0) {
                searchQuery = keyTerms.join(' ');
            }
        }
        
        // Search for current events with fallback queries
        const queriesToTry = [searchQuery];
        if (searchQuery !== query) {
            queriesToTry.push(query);
        }
        queriesToTry.push(`${query} latest`, `${query} news`);
        const seen = new Set();

        for (const q of queriesToTry) {
            const trimmed = q.trim();
            if (!trimmed || seen.has(trimmed)) continue;
            seen.add(trimmed);
            const results = await this.search(trimmed, 3);
            if (results.length > 0) {
                return {
                    hasContext: true,
                    results: results,
                    formatted: this.formatSearchResults(results)
                };
            }
        }

        return {
            hasContext: false,
            results: [],
            formatted: ''
        };
    }

    // Extract key terms from text for better search queries
    extractKeyTerms(text) {
        // Remove common words and extract meaningful terms
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'where', 'when', 'why', 'how', 'who', 'which', 'this', 'that', 'these', 'those'];
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word));
        
        // Return unique words, limit to 5 most relevant
        return [...new Set(words)].slice(0, 5);
    }
}

module.exports = WebSearch;
