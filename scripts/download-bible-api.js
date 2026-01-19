/**
 * Download Bible using API.Bible REST API
 * 
 * Usage: node scripts/download-bible-api.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.BIBLE_API_KEY || process.argv[2];
if (!API_KEY) {
    console.error('Missing API key.');
    console.error('Provide it via env var or CLI:');
    console.error('  BIBLE_API_KEY=your_key node scripts/download-bible-api.js');
    console.error('  node scripts/download-bible-api.js your_key');
    process.exit(1);
}
// Try both endpoints - user said https://rest.api.bible
const API_BASE = 'https://api.scripture.api.bible/v1'; // Standard endpoint
const API_BASE_ALT = 'https://rest.api.bible'; // Alternative endpoint
const DATA_DIR = path.join(__dirname, '..', 'data');

// Bible books with their API abbreviations
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

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'api-key': API_KEY
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
        
        // Set timeout
        options.timeout = 30000;
    });
}

async function getBibleId() {
    // Get list of Bibles and find KJV
    // Try both endpoints
    const endpoints = [API_BASE, API_BASE_ALT];
    
    for (const base of endpoints) {
        try {
            const url = `${base}/bibles`;
            const response = await httpGet(url);
            
            // Look for KJV (King James Version)
            const kjv = response.data.find(b => 
                b.name.includes('King James') || 
                b.abbreviation === 'KJV' ||
                b.id === 'de4e12af7f28f599-02' // Known KJV ID
            );
            
            if (kjv) {
                console.log(`Found Bible: ${kjv.name} (${kjv.id})`);
                return kjv.id;
            }
            
            // Fallback to first available Bible
            if (response.data && response.data.length > 0) {
                console.log(`Using Bible: ${response.data[0].name} (${response.data[0].id})`);
                return response.data[0].id;
            }
        } catch (error) {
            console.warn(`Trying alternative endpoint...`);
            continue;
        }
    }
    
    // If both endpoints fail, use default
    console.warn(`Could not fetch Bible list, using default KJV ID`);
    return 'de4e12af7f28f599-02'; // Default KJV ID
}

async function downloadBible() {
    console.log('Downloading Bible from API.Bible...\n');
    
    const bibleId = await getBibleId();
    const passages = [];
    
    // Determine which endpoint works
    let workingBase = API_BASE;
    try {
        await httpGet(`${API_BASE}/bibles`);
    } catch (e) {
        console.log('Trying alternative endpoint...');
        workingBase = API_BASE_ALT;
    }
    
    for (let i = 0; i < BIBLE_BOOKS.length; i++) {
        const book = BIBLE_BOOKS[i];
        process.stdout.write(`\rFetching ${book.name} (${i+1}/${BIBLE_BOOKS.length})...`);
        
        try {
            // Get chapters for this book
            const chaptersUrl = `${workingBase}/bibles/${bibleId}/books/${book.abbr}/chapters`;
            const chaptersResponse = await httpGet(chaptersUrl);
            
            if (!chaptersResponse.data || chaptersResponse.data.length === 0) {
                console.error(`\nNo chapters found for ${book.name}`);
                continue;
            }
            
            // Get verses for each chapter
            for (const chapter of chaptersResponse.data) {
                const chapterNum = chapter.number;
                const versesUrl = `${workingBase}/bibles/${bibleId}/chapters/${chapter.id}/verses?content-type=text&include-notes=false&include-titles=false`;
                
                try {
                    const versesResponse = await httpGet(versesUrl);
                    
                    if (versesResponse.data && versesResponse.data.verses) {
                        for (const verse of versesResponse.data.verses) {
                            // Clean HTML tags
                            const text = verse.content
                                .replace(/<[^>]*>/g, '')
                                .replace(/\s+/g, ' ')
                                .trim();
                            
                            passages.push({
                                reference: `${book.name} ${chapterNum}:${verse.number}`,
                                text: text,
                                context: `From ${book.name} chapter ${chapterNum}`
                            });
                        }
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 150));
                } catch (err) {
                    console.error(`\nError fetching ${book.name} ${chapterNum}:`, err.message);
                }
            }
        } catch (error) {
            console.error(`\nError fetching ${book.name}:`, error.message);
        }
    }
    
    console.log(`\n\nDownloaded ${passages.length} Bible verses`);
    return passages;
}

async function main() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        
        const passages = await downloadBible();
        
        if (passages.length > 0) {
            const filePath = path.join(DATA_DIR, 'bible.json');
            fs.writeFileSync(filePath, JSON.stringify({ passages }, null, 2));
            
            const fileSize = fs.statSync(filePath).size / 1024 / 1024;
            console.log(`\n✅ Saved ${passages.length} passages to ${filePath}`);
            console.log(`File size: ${fileSize.toFixed(2)} MB`);
            
            // Extract Torah
            console.log('\nExtracting Torah...');
            const torahPassages = passages.filter(p => {
                const book = p.reference.split(' ')[0];
                return ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'].includes(book);
            });
            
            const torahPath = path.join(DATA_DIR, 'torah.json');
            fs.writeFileSync(torahPath, JSON.stringify({ passages: torahPassages }, null, 2));
            console.log(`✅ Saved ${torahPassages.length} Torah passages to ${torahPath}`);
        } else {
            console.error('No passages downloaded');
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { downloadBible };
