/**
 * Simple script to fetch full Quran from Al-Quran Cloud API
 * No API key required - completely free
 * 
 * Run: node scripts/fetch-quran.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

async function downloadQuran() {
    console.log('Downloading full Quran from Al-Quran Cloud API...\n');
    const passages = [];
    
    // Al-Quran Cloud API - free, no API key needed
    const baseUrl = 'https://api.alquran.cloud/v1';
    
    // Get all 114 surahs
    for (let surahNum = 1; surahNum <= 114; surahNum++) {
        try {
            // Using Pickthall translation (public domain, 1930)
            const url = `${baseUrl}/surah/${surahNum}/en.pickthall`;
            process.stdout.write(`\rFetching Surah ${surahNum}/114...`);
            
            const response = await httpGet(url);
            
            if (response.code === 200 && response.data) {
                const surah = response.data;
                const surahName = surah.englishName || surah.name;
                
                // Process each ayah (verse)
                surah.ayahs.forEach((ayah) => {
                    // Clean HTML tags if any
                    const text = ayah.text.replace(/<[^>]*>/g, '').trim();
                    
                    passages.push({
                        reference: `${surahName} ${surahNum}:${ayah.numberInSurah}`,
                        text: text,
                        context: `Surah ${surahName} (Chapter ${surahNum})`
                    });
                });
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`\nError fetching Surah ${surahNum}:`, error.message);
        }
    }
    
    console.log(`\n\nDownloaded ${passages.length} Quran verses`);
    return passages;
}

async function main() {
    try {
        const passages = await downloadQuran();
        
        if (passages.length > 0) {
            const filePath = path.join(DATA_DIR, 'quran.json');
            const data = { passages };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`\n✅ Saved ${passages.length} passages to ${filePath}`);
            console.log(`\nFile size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
        } else {
            console.error('No passages downloaded');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { downloadQuran };
