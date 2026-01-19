/**
 * Script to download and convert full holy books to JSON format
 * Uses public domain sources and free APIs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Bible books in order
const BIBLE_BOOKS = [
    // Old Testament
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
    'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah',
    'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    // New Testament
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
    'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

// Torah books (first 5 books of Bible)
const TORAH_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];

// Quran Surah names
const QURAN_SURAHS = [
    'Al-Fatiha', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Ma\'idah',
    'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
    'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
    'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
    'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
    'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
    'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
    'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
    'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
    'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
    'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
    'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
    'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
    'At-Tahrim', 'Al-Mulk', 'An-Naba', 'An-Nazi\'at', 'Abasa',
    'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
    'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
    'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
    'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-\'Adiyat',
    'Al-Qari\'ah', 'At-Takathur', 'Al-\'Asr', 'Al-Humazah', 'Al-Fil',
    'Quraysh', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
    'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
];

// Helper function to make HTTP requests
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${url}`));
                }
            });
        }).on('error', reject);
    });
}

// Download Bible using API.Bible (free tier) or alternative
async function downloadBible() {
    console.log('Downloading Bible...');
    const passages = [];
    
    // Using a free Bible API - API.Bible or alternative
    // For now, we'll use a public domain source that provides JSON
    
    try {
        // Try API.Bible (requires free API key, but we can use public domain sources)
        // Alternative: Use World English Bible from public domain sources
        
        // Using a simpler approach: fetch from a public domain JSON source
        // Note: You may need to get an API key from api.bible or use another source
        
        console.log('Fetching Bible from public domain source...');
        
        // For now, let's create a script that processes a structured text file
        // Users can download KJV from Project Gutenberg and we'll parse it
        
        // Alternative: Use Bible Gateway's public domain versions via their API
        // Or use a pre-processed JSON from a public domain source
        
        console.log('Note: Full Bible download requires either:');
        console.log('1. API key from api.bible (free tier available)');
        console.log('2. Download KJV from Project Gutenberg and parse');
        console.log('3. Use World English Bible JSON from public domain sources');
        
        // We'll provide a function to process if user has the text file
        return passages;
        
    } catch (error) {
        console.error('Error downloading Bible:', error);
        return [];
    }
}

// Download Quran using Al-Quran API (free, no key required)
async function downloadQuran() {
    console.log('Downloading Quran...');
    const passages = [];
    
    try {
        // Using Al-Quran Cloud API (free, no API key needed)
        const baseUrl = 'https://api.alquran.cloud/v1';
        
        console.log('Fetching Quran from Al-Quran Cloud API...');
        
        // Get all surahs (114 surahs)
        for (let surahNum = 1; surahNum <= 114; surahNum++) {
            try {
                const url = `${baseUrl}/surah/${surahNum}/en.pickthall`;
                console.log(`Fetching Surah ${surahNum}/${114}...`);
                
                const response = await httpGet(url);
                const data = JSON.parse(response);
                
                if (data.code === 200 && data.data) {
                    const surah = data.data;
                    const surahName = surah.englishName || QURAN_SURAHS[surahNum - 1];
                    
                    // Process each ayah (verse)
                    surah.ayahs.forEach((ayah) => {
                        passages.push({
                            reference: `${surahName} ${surahNum}:${ayah.numberInSurah}`,
                            text: ayah.text,
                            context: `Surah ${surahName} (Chapter ${surahNum})`
                        });
                    });
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error(`Error fetching Surah ${surahNum}:`, error.message);
            }
        }
        
        console.log(`Downloaded ${passages.length} Quran verses`);
        return passages;
        
    } catch (error) {
        console.error('Error downloading Quran:', error);
        return [];
    }
}

// Extract Torah from Bible data (first 5 books)
function extractTorah(biblePassages) {
    console.log('Extracting Torah from Bible...');
    
    const torahPassages = biblePassages.filter(passage => {
        const book = passage.reference.split(' ')[0];
        return TORAH_BOOKS.includes(book);
    });
    
    console.log(`Extracted ${torahPassages.length} Torah passages`);
    return torahPassages;
}

// Save passages to JSON file
function saveToJSON(bookName, passages) {
    const filePath = path.join(DATA_DIR, `${bookName}.json`);
    const data = { passages };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved ${passages.length} passages to ${filePath}`);
}

// Main function
async function main() {
    console.log('Starting holy book download...\n');
    
    // Download Quran (free API, no key needed)
    const quranPassages = await downloadQuran();
    if (quranPassages.length > 0) {
        saveToJSON('quran', quranPassages);
    }
    
    // For Bible and Torah, we need to handle differently
    // Since full Bible APIs often require keys, we'll provide instructions
    console.log('\n=== BIBLE & TORAH DOWNLOAD ===');
    console.log('For Bible and Torah, you have these options:\n');
    console.log('Option 1: Use API.Bible (Free tier available)');
    console.log('  1. Sign up at https://scripture.api.bible/');
    console.log('  2. Get your API key');
    console.log('  3. Run: node scripts/download-bible-api.js YOUR_API_KEY\n');
    
    console.log('Option 2: Download from Project Gutenberg');
    console.log('  1. Download KJV from https://www.gutenberg.org/ebooks/10');
    console.log('  2. Run: node scripts/parse-bible-gutenberg.js\n');
    
    console.log('Option 3: Use pre-processed JSON');
    console.log('  Download World English Bible JSON from public domain sources\n');
    
    // If user wants, we can create a helper script for API.Bible
    console.log('Creating Bible download helper script...');
    createBibleDownloadScript();
}

// Create a helper script for Bible download using API.Bible
function createBibleDownloadScript() {
    const scriptContent = `/**
 * Download Bible using API.Bible
 * Requires free API key from https://scripture.api.bible/
 * 
 * Usage: node scripts/download-bible-api.js YOUR_API_KEY
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.argv[2];
if (!API_KEY) {
    console.error('Please provide API.Bible API key:');
    console.error('Usage: node scripts/download-bible-api.js YOUR_API_KEY');
    console.error('Get free key at: https://scripture.api.bible/');
    process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const BIBLE_BOOKS = [
    'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jud', 'rut', '1sa', '2sa',
    '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro',
    'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo',
    'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal',
    'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph',
    'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas',
    '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev'
];

const BOOK_NAMES = {
    'gen': 'Genesis', 'exo': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers', 'deu': 'Deuteronomy',
    'jos': 'Joshua', 'jud': 'Judges', 'rut': 'Ruth', '1sa': '1 Samuel', '2sa': '2 Samuel',
    '1ki': '1 Kings', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles',
    'ezr': 'Ezra', 'neh': 'Nehemiah', 'est': 'Esther', 'job': 'Job', 'psa': 'Psalms',
    'pro': 'Proverbs', 'ecc': 'Ecclesiastes', 'sng': 'Song of Solomon', 'isa': 'Isaiah',
    'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezk': 'Ezekiel', 'dan': 'Daniel',
    'hos': 'Hosea', 'jol': 'Joel', 'amo': 'Amos', 'oba': 'Obadiah', 'jon': 'Jonah',
    'mic': 'Micah', 'nam': 'Nahum', 'hab': 'Habakkuk', 'zep': 'Zephaniah',
    'hag': 'Haggai', 'zec': 'Zechariah', 'mal': 'Malachi',
    'mat': 'Matthew', 'mrk': 'Mark', 'luk': 'Luke', 'jhn': 'John', 'act': 'Acts',
    'rom': 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', 'gal': 'Galatians',
    'eph': 'Ephesians', 'php': 'Philippians', 'col': 'Colossians', '1th': '1 Thessalonians',
    '2th': '2 Thessalonians', '1ti': '1 Timothy', '2ti': '2 Timothy', 'tit': 'Titus',
    'phm': 'Philemon', 'heb': 'Hebrews', 'jas': 'James', '1pe': '1 Peter', '2pe': '2 Peter',
    '1jn': '1 John', '2jn': '2 John', '3jn': '3 John', 'jud': 'Jude', 'rev': 'Revelation'
};

function httpGet(url, apiKey) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'api-key': apiKey
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(\`HTTP \${res.statusCode}\`));
                }
            });
        }).on('error', reject);
    });
}

async function downloadBible() {
    const passages = [];
    const bibleId = 'de4e12af7f28f599-02'; // KJV Bible ID
    
    for (let i = 0; i < BIBLE_BOOKS.length; i++) {
        const bookId = BIBLE_BOOKS[i];
        const bookName = BOOK_NAMES[bookId];
        console.log(\`Fetching \${bookName} (\${i+1}/\${BIBLE_BOOKS.length})...\`);
        
        try {
            const url = \`https://api.scripture.api.bible/v1/bibles/\${bibleId}/books/\${bookId}/chapters\`;
            const chapters = await httpGet(url, API_KEY);
            
            for (const chapter of chapters.data) {
                const chapterNum = chapter.number;
                const versesUrl = \`https://api.scripture.api.bible/v1/bibles/\${bibleId}/chapters/\${chapter.id}/verses\`;
                
                try {
                    const verses = await httpGet(versesUrl, API_KEY);
                    
                    for (const verse of verses.data) {
                        passages.push({
                            reference: \`\${bookName} \${chapterNum}:\${verse.number}\`,
                            text: verse.content.replace(/<[^>]*>/g, '').trim(),
                            context: \`From \${bookName} chapter \${chapterNum}\`
                        });
                    }
                    
                    await new Promise(r => setTimeout(r, 100));
                } catch (err) {
                    console.error(\`Error fetching \${bookName} \${chapterNum}:\`, err.message);
                }
            }
        } catch (error) {
            console.error(\`Error fetching \${bookName}:\`, error.message);
        }
    }
    
    return passages;
}

async function main() {
    console.log('Downloading Bible from API.Bible...\\n');
    const passages = await downloadBible();
    
    if (passages.length > 0) {
        const filePath = path.join(DATA_DIR, 'bible.json');
        fs.writeFileSync(filePath, JSON.stringify({ passages }, null, 2));
        console.log(\`\\nSaved \${passages.length} passages to \${filePath}\`);
        
        // Extract Torah
        const torahPassages = passages.filter(p => {
            const book = p.reference.split(' ')[0];
            return ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'].includes(book);
        });
        
        const torahPath = path.join(DATA_DIR, 'torah.json');
        fs.writeFileSync(torahPath, JSON.stringify({ passages: torahPassages }, null, 2));
        console.log(\`Saved \${torahPassages.length} Torah passages to \${torahPath}\`);
    }
}

main().catch(console.error);
`;

    const scriptPath = path.join(__dirname, 'download-bible-api.js');
    fs.writeFileSync(scriptPath, scriptContent);
    console.log('Created: scripts/download-bible-api.js');
}

// Run main function
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { downloadBible, downloadQuran, extractTorah };
