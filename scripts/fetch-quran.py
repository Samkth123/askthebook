#!/usr/bin/env python3
"""
Download full Quran from Al-Quran Cloud API (free, no API key needed)
Uses Pickthall translation (public domain, 1930)

Run: python3 scripts/fetch-quran.py
"""

import json
import os
import time
import urllib.request
import urllib.error
import ssl

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_url(url):
    """Fetch data from URL"""
    try:
        # Create unverified context for SSL (sandbox environments)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(url, context=ssl_context) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {url}")
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def download_quran():
    """Download all 114 surahs of the Quran"""
    print("Downloading full Quran from Al-Quran Cloud API...\n")
    passages = []
    
    base_url = "https://api.alquran.cloud/v1"
    
    # Get all 114 surahs
    for surah_num in range(1, 115):
        try:
            # Using Pickthall translation (public domain, 1930)
            url = f"{base_url}/surah/{surah_num}/en.pickthall"
            print(f"\rFetching Surah {surah_num}/114...", end='', flush=True)
            
            response = fetch_url(url)
            
            if response and response.get('code') == 200 and response.get('data'):
                surah = response['data']
                surah_name = surah.get('englishName') or surah.get('name', f'Surah {surah_num}')
                
                # Process each ayah (verse)
                for ayah in surah.get('ayahs', []):
                    # Clean HTML tags if any
                    text = ayah.get('text', '').replace('<i>', '').replace('</i>', '').strip()
                    text = ' '.join(text.split())  # Normalize whitespace
                    
                    passages.append({
                        "reference": f"{surah_name} {surah_num}:{ayah.get('numberInSurah', '')}",
                        "text": text,
                        "context": f"Surah {surah_name} (Chapter {surah_num})"
                    })
            
            # Small delay to avoid rate limiting
            time.sleep(0.2)
            
        except Exception as e:
            print(f"\nError fetching Surah {surah_num}: {e}")
    
    print(f"\n\nDownloaded {len(passages)} Quran verses")
    return passages

def main():
    try:
        passages = download_quran()
        
        if passages:
            file_path = os.path.join(DATA_DIR, 'quran.json')
            data = {"passages": passages}
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            file_size = os.path.getsize(file_path) / 1024 / 1024
            print(f"\n✅ Saved {len(passages)} passages to {file_path}")
            print(f"File size: {file_size:.2f} MB")
        else:
            print("No passages downloaded")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
