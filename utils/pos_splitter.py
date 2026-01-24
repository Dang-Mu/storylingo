import json
import glob
import os
import sys

# Check for spacy and install/load model
try:
    import spacy
except ImportError:
    print("Error: 'spacy' library is not installed.")
    print("Please install it running: pip install spacy")
    sys.exit(1)

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("SpaCy model 'en_core_web_sm' not found. Downloading now...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def process_sentences():
    # Define paths
    # Assuming this script is in /utils/, we go up one level to find /data/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data')
    output_path = os.path.join(base_dir, 'utils', 'pos_split_results.json')

    # Find all JSON files in data/
    json_pattern = os.path.join(data_dir, '*.json')
    files = glob.glob(json_pattern)

    if not files:
        print(f"No JSON files found in {data_dir}")
        return

    all_data = {}

    print(f"Processing {len(files)} files...")

    for file_path in files:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            continue

        sentences = content.get('sentences', [])
        analyzed_sentences = []

        for item in sentences:
            english_text = item.get('english', '')
            if not english_text:
                continue

            # NLP processing
            doc = nlp(english_text)

            # Dictionary to categorize words by POS
            # We map SpaCy coarse-grained tags to our keys
            pos_groups = {
                "noun": [],
                "verb": [],
                "adjective": [], # maps from ADJ
                "adverb": [],    # maps from ADV
                "pronoun": [],   # maps from PRON
                "preposition": [], # maps from ADP
                "others": []
            }

            for token in doc:
                if token.is_punct or token.is_space:
                    continue
                
                word = token.text
                pos = token.pos_

                if pos == "NOUN" or pos == "PROPN":
                    pos_groups["noun"].append(word)
                elif pos == "VERB" or pos == "AUX":
                    pos_groups["verb"].append(word)
                elif pos == "ADJ":
                    pos_groups["adjective"].append(word)
                elif pos == "ADV":
                    pos_groups["adverb"].append(word)
                elif pos == "PRON":
                    pos_groups["pronoun"].append(word)
                elif pos == "ADP":
                    pos_groups["preposition"].append(word)
                else:
                    pos_groups["others"].append(word)

            # Remove empty categories for cleaner output
            pos_groups = {k: v for k, v in pos_groups.items() if v}

            analyzed_sentences.append({
                "original_english": english_text,
                "original_korean": item.get('korean', ''),
                "pos_breakdown": pos_groups
            })

        all_data[filename] = {
            "title": content.get('title', ''),
            "analyzed_sentences": analyzed_sentences
        }

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully processed sentences. Results saved to: {output_path}")

if __name__ == "__main__":
    process_sentences()
