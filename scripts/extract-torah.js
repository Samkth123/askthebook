/**
 * Extract Torah (first 5 books) from Bible JSON
 * Run after downloading Bible: node scripts/extract-torah.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TORAH_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];

function extractTorah() {
    const biblePath = path.join(DATA_DIR, 'bible.json');
    
    if (!fs.existsSync(biblePath)) {
        console.error('Error: bible.json not found. Please download the Bible first.');
        console.error('See DOWNLOAD_GUIDE.md for instructions.');
        process.exit(1);
    }
    
    console.log('Loading Bible...');
    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));
    
    console.log('Extracting Torah (first 5 books)...');
    const torahPassages = bibleData.passages.filter(passage => {
        const book = passage.reference.split(' ')[0];
        return TORAH_BOOKS.includes(book);
    });
    
    const torahPath = path.join(DATA_DIR, 'torah.json');
    const torahData = { passages: torahPassages };
    
    fs.writeFileSync(torahPath, JSON.stringify(torahData, null, 2));
    
    console.log(`✅ Extracted ${torahPassages.length} Torah passages`);
    console.log(`   Saved to: ${torahPath}`);
    console.log(`   Books: ${TORAH_BOOKS.join(', ')}`);
}

extractTorah();
