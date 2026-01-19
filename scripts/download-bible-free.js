/**
 * Download Bible from free public domain sources
 * Uses multiple fallback methods to get complete Bible
 * 
 * Run: node scripts/download-bible-free.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Bible books in order with abbreviations
const BIBLE_BOOKS = [
    { name: 'Genesis', abbr: 'gen' },
    { name: 'Exodus', abbr: 'exo' },
    { name: 'Leviticus', abbr: 'lev' },
    { name: 'Numbers', abbr: 'num' },
    { name: 'Deuteronomy', abbr: 'deu' },
    { name: 'Joshua', abbr: 'jos' },
    { name: 'Judges', abbr: 'jud' },
    { name: 'Ruth', abbr: 'rut' },
    { name: '1 Samuel', abbr: '1sa' },
    { name: '2 Samuel', abbr: '2sa' },
    { name: '1 Kings', abbr: '1ki' },
    { name: '2 Kings', abbr: '2ki' },
    { name: '1 Chronicles', abbr: '1ch' },
    { name: '2 Chronicles', abbr: '2ch' },
    { name: 'Ezra', abbr: 'ezr' },
    { name: 'Nehemiah', abbr: 'neh' },
    { name: 'Esther', abbr: 'est' },
    { name: 'Job', abbr: 'job' },
    { name: 'Psalms', abbr: 'psa' },
    { name: 'Proverbs', abbr: 'pro' },
    { name: 'Ecclesiastes', abbr: 'ecc' },
    { name: 'Song of Solomon', abbr: 'sng' },
    { name: 'Isaiah', abbr: 'isa' },
    { name: 'Jeremiah', abbr: 'jer' },
    { name: 'Lamentations', abbr: 'lam' },
    { name: 'Ezekiel', abbr: 'ezk' },
    { name: 'Daniel', abbr: 'dan' },
    { name: 'Hosea', abbr: 'hos' },
    { name: 'Joel', abbr: 'jol' },
    { name: 'Amos', abbr: 'amo' },
    { name: 'Obadiah', abbr: 'oba' },
    { name: 'Jonah', abbr: 'jon' },
    { name: 'Micah', abbr: 'mic' },
    { name: 'Nahum', abbr: 'nam' },
    { name: 'Habakkuk', abbr: 'hab' },
    { name: 'Zephaniah', abbr: 'zep' },
    { name: 'Haggai', abbr: 'hag' },
    { name: 'Zechariah', abbr: 'zec' },
    { name: 'Malachi', abbr: 'mal' },
    { name: 'Matthew', abbr: 'mat' },
    { name: 'Mark', abbr: 'mrk' },
    { name: 'Luke', abbr: 'luk' },
    { name: 'John', abbr: 'jhn' },
    { name: 'Acts', abbr: 'act' },
    { name: 'Romans', abbr: 'rom' },
    { name: '1 Corinthians', abbr: '1co' },
    { name: '2 Corinthians', abbr: '2co' },
    { name: 'Galatians', abbr: 'gal' },
    { name: 'Ephesians', abbr: 'eph' },
    { name: 'Philippians', abbr: 'php' },
    { name: 'Colossians', abbr: 'col' },
    { name: '1 Thessalonians', abbr: '1th' },
    { name: '2 Thessalonians', abbr: '2th' },
    { name: '1 Timothy', abbr: '1ti' },
    { name: '2 Timothy', abbr: '2ti' },
    { name: 'Titus', abbr: 'tit' },
    { name: 'Philemon', abbr: 'phm' },
    { name: 'Hebrews', abbr: 'heb' },
    { name: 'James', abbr: 'jas' },
    { name: '1 Peter', abbr: '1pe' },
    { name: '2 Peter', abbr: '2pe' },
    { name: '1 John', abbr: '1jn' },
    { name: '2 John', abbr: '2jn' },
    { name: '3 John', abbr: '3jn' },
    { name: 'Jude', abbr: 'jud' },
    { name: 'Revelation', abbr: 'rev' }
];

function httpGet(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data); // Return raw if not JSON
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Method 1: Try Bible Gateway API (may require API key, but some endpoints are free)
async function downloadFromBibleGateway() {
    console.log('Attempting to download from Bible Gateway...');
    // Note: Bible Gateway has rate limits and may require API key for full access
    // This is a placeholder - actual implementation would need API key
    return [];
}

// Method 2: Use a public domain JSON source
async function downloadFromPublicDomain() {
    console.log('Downloading from public domain sources...');
    const passages = [];
    
    // Try to use a known public domain Bible JSON source
    // Many exist but URLs change - this is a template
    
    try {
        // Example: Some GitHub repos host public domain Bible JSON
        // You would need to find a stable source
        
        console.log('Note: Direct public domain JSON sources may vary.');
        console.log('Recommended: Use API.Bible free tier or download from Project Gutenberg');
        
        return passages;
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

async function main() {
    console.log('Bible Download Script\n');
    console.log('This script attempts to download the full Bible from free sources.\n');
    console.log('Options:');
    console.log('1. Use API.Bible (requires free API key) - See download-bible-api.js');
    console.log('2. Download from Project Gutenberg and parse manually');
    console.log('3. Use World English Bible JSON from public domain sources\n');
    
    console.log('For now, please:');
    console.log('1. Get a free API key from https://scripture.api.bible/');
    console.log('2. Run: node scripts/download-bible-api.js YOUR_API_KEY');
    console.log('\nOr see DOWNLOAD_GUIDE.md for manual download instructions.');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { downloadFromBibleGateway, downloadFromPublicDomain };
