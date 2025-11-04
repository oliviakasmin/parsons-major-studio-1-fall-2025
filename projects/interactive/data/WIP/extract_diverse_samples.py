import json
import re
from collections import Counter
import random

def analyze_text_diversity(text):
    """Analyze text for diversity indicators."""
    
    # Clean text
    text_clean = text.replace('\n', ' ').lower()
    
    # Extract key features for diversity analysis
    features = {
        'has_widow': 'widow of' in text_clean,
        'has_soldier_name': bool(re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+of\s+[A-Za-z\s]+\s+in the State of', text)),
        'has_amount': bool(re.search(r'(\d+(?:\.\d+)?)\s*\$|(\d+(?:\.\d+)?)\s+Dollars', text_clean)),
        'has_date': bool(re.search(r'(\d{4})', text)),
        'has_rank': bool(re.search(r'(private|sergeant|captain|colonel|drummer|musician)', text_clean)),
        'has_state': bool(re.search(r'in the State of\s+([A-Z][a-z]+)', text)),
        'has_act': bool(re.search(r'act\s+(\w+)\s+(\d+)', text_clean)),
        'has_semi_annual': bool(re.search(r'semi-?annual|semi-?anl', text_clean)),
        'has_per_annum': 'per annum' in text_clean,
        'has_per_month': 'per month' in text_clean,
        'has_certificate': 'certificate' in text_clean,
        'has_inscribed': 'inscribed' in text_clean,
        'has_roll': 'roll' in text_clean,
        'has_commenced': 'commence' in text_clean,
        'has_arrears': 'arrears' in text_clean,
        'has_revolutionary': 'revolutionary' in text_clean,
        'has_pension': 'pension' in text_clean,
        'has_war': 'war' in text_clean,
        'has_company': 'company' in text_clean,
        'has_regiment': 'regiment' in text_clean,
        'has_captain': 'captain' in text_clean,
        'has_colonel': 'colonel' in text_clean,
        'has_line': 'line' in text_clean,
        'has_service': 'service' in text_clean,
        'has_discharged': 'discharge' in text_clean,
        'has_enlisted': 'enlist' in text_clean,
        'has_continental': 'continental' in text_clean,
        'has_militia': 'militia' in text_clean,
        'has_army': 'army' in text_clean,
        'has_treasury': 'treasury' in text_clean,
        'has_auditor': 'auditor' in text_clean,
        'has_clerk': 'clerk' in text_clean,
        'has_justice': 'justice' in text_clean,
        'has_court': 'court' in text_clean,
        'has_sworn': 'sworn' in text_clean,
        'has_declaration': 'declaration' in text_clean,
        'has_affidavit': 'affidavit' in text_clean,
        'has_witness': 'witness' in text_clean,
        'has_notary': 'notary' in text_clean,
        'has_seal': 'seal' in text_clean,
        'has_signature': 'signature' in text_clean,
        'has_marriage': 'marriage' in text_clean or 'married' in text_clean,
        'has_death': 'death' in text_clean or 'died' in text_clean or 'deceased' in text_clean,
        'has_birth': 'birth' in text_clean or 'born' in text_clean,
        'has_age': bool(re.search(r'\b\d+\s+years?\s+old|\bage\s+\d+', text_clean)),
        'has_children': 'children' in text_clean or 'child' in text_clean,
        'has_heir': 'heir' in text_clean,
        'has_administrator': 'administrator' in text_clean,
        'has_executor': 'executor' in text_clean,
        'has_estate': 'estate' in text_clean,
        'has_property': 'property' in text_clean,
        'has_land': 'land' in text_clean,
        'has_bounty': 'bounty' in text_clean,
        'has_claim': 'claim' in text_clean,
        'has_application': 'application' in text_clean,
        'has_petition': 'petition' in text_clean,
        'has_letter': 'letter' in text_clean,
        'has_correspondence': 'correspondence' in text_clean,
        'has_document': 'document' in text_clean,
        'has_paper': 'paper' in text_clean,
        'has_record': 'record' in text_clean,
        'has_archive': 'archive' in text_clean,
        'has_register': 'register' in text_clean,
        'has_index': 'index' in text_clean,
        'has_volume': 'volume' in text_clean,
        'has_page': 'page' in text_clean,
        'has_book': 'book' in text_clean,
        'has_section': 'section' in text_clean,
        'has_chapter': 'chapter' in text_clean,
        'has_paragraph': 'paragraph' in text_clean,
        'has_sentence': 'sentence' in text_clean,
        'has_word': 'word' in text_clean,
        'has_character': 'character' in text_clean,
        'has_digit': bool(re.search(r'\d', text)),
        'has_punctuation': bool(re.search(r'[.,;:!?]', text)),
        'has_quotes': '"' in text or "'" in text,
        'has_parentheses': '(' in text and ')' in text,
        'has_brackets': '[' in text and ']' in text,
        'has_dashes': '-' in text,
        'has_underscores': '_' in text,
        'has_pipes': '|' in text,
        'has_ampersands': '&' in text,
        'has_asterisks': '*' in text,
        'has_hashes': '#' in text,
        'has_percent': '%' in text,
        'has_dollars': '$' in text,
        'has_commas': ',' in text,
        'has_periods': '.' in text,
        'has_semicolons': ';' in text,
        'has_colons': ':' in text,
        'has_exclamations': '!' in text,
        'has_questions': '?' in text,
        'text_length': len(text),
        'word_count': len(text.split()),
        'line_count': text.count('\n'),
        'segment_count': text.count('||') + 1,
        'has_multiple_amounts': len(re.findall(r'(\d+(?:\.\d+)?)\s*\$|(\d+(?:\.\d+)?)\s+Dollars', text_clean)) > 1,
        'has_multiple_dates': len(re.findall(r'(\d{4})', text)) > 1,
        'has_multiple_states': len(re.findall(r'in the State of\s+([A-Z][a-z]+)', text)) > 1,
        'has_multiple_names': len(re.findall(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+of\s+[A-Za-z\s]+\s+in the State of', text)) > 1,
    }
    
    return features

def calculate_diversity_score(features1, features2):
    """Calculate diversity score between two feature sets."""
    score = 0
    for key in features1:
        if key in features2:
            if features1[key] != features2[key]:
                score += 1
            # Also consider magnitude differences for numeric features
            if key in ['text_length', 'word_count', 'line_count', 'segment_count']:
                diff = abs(features1[key] - features2[key])
                score += min(diff / max(features1[key], features2[key], 1), 1)
    return score

def select_diverse_samples(samples, num_samples=10):
    """Select the most diverse samples using a greedy algorithm."""
    
    if len(samples) <= num_samples:
        return samples
    
    # Analyze all samples
    print("Analyzing text diversity...")
    analyzed_samples = []
    for i, sample in enumerate(samples):
        if i % 10 == 0:
            print(f"Analyzing sample {i+1}/{len(samples)}...")
        features = analyze_text_diversity(sample['allowance_phrase'])
        analyzed_samples.append((sample, features))
    
    # Start with a random sample
    selected = [random.choice(analyzed_samples)]
    remaining = [s for s in analyzed_samples if s not in selected]
    
    print("Selecting diverse samples...")
    while len(selected) < num_samples and remaining:
        best_sample = None
        best_score = -1
        
        for candidate in remaining:
            # Calculate minimum diversity score to already selected samples
            min_score = min(calculate_diversity_score(candidate[1], selected_sample[1]) 
                          for selected_sample in selected)
            
            if min_score > best_score:
                best_score = min_score
                best_sample = candidate
        
        if best_sample:
            selected.append(best_sample)
            remaining.remove(best_sample)
            print(f"Selected sample {len(selected)}/{num_samples} (diversity score: {best_score:.2f})")
    
    return [sample[0] for sample in selected]

def main():
    print("Loading samples from both JSON files...")
    
    # Load samples from both files
    all_samples = []
    
    with open('allowance_phrase_samples.json', 'r', encoding='utf-8') as f:
        samples1 = json.load(f)
        for sample in samples1:
            sample['source_file'] = 'allowance_phrase_samples.json'
        all_samples.extend(samples1)
    
    with open('allowance_phrase_samples_2.json', 'r', encoding='utf-8') as f:
        samples2 = json.load(f)
        for sample in samples2:
            sample['source_file'] = 'allowance_phrase_samples_2.json'
        all_samples.extend(samples2)
    
    print(f"Total samples loaded: {len(all_samples)}")
    print(f"From allowance_phrase_samples.json: {len(samples1)}")
    print(f"From allowance_phrase_samples_2.json: {len(samples2)}")
    
    # Select diverse samples
    diverse_samples = select_diverse_samples(all_samples, 10)
    
    # Save diverse samples
    output_file = 'diverse_allowance_samples.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(diverse_samples, f, indent=2, ensure_ascii=False)
    
    print(f"\nDiverse samples saved to {output_file}")
    print(f"Selected {len(diverse_samples)} diverse samples")
    
    # Show summary of selected samples
    print("\nSelected samples summary:")
    print("-" * 50)
    
    source_counts = Counter(sample['source_file'] for sample in diverse_samples)
    print(f"Source distribution: {dict(source_counts)}")
    
    # Show some statistics about the selected samples
    total_length = sum(len(sample['allowance_phrase']) for sample in diverse_samples)
    avg_length = total_length / len(diverse_samples)
    print(f"Average text length: {avg_length:.0f} characters")
    
    segment_counts = [sample['allowance_phrase'].count('||') + 1 for sample in diverse_samples]
    avg_segments = sum(segment_counts) / len(segment_counts)
    print(f"Average segments per sample: {avg_segments:.1f}")
    
    # Show NAIDs of selected samples
    naids = [sample['NAID'] for sample in diverse_samples]
    print(f"Selected NAIDs: {naids}")
    
    # Show a sample of the diversity
    print(f"\nSample diversity preview:")
    print("-" * 30)
    for i, sample in enumerate(diverse_samples[:3]):
        text = sample['allowance_phrase'][:200] + "..." if len(sample['allowance_phrase']) > 200 else sample['allowance_phrase']
        print(f"\nSample {i+1} (NAID: {sample['NAID']}, Source: {sample['source_file']}):")
        print(f"Text preview: {text}")

if __name__ == "__main__":
    main()
