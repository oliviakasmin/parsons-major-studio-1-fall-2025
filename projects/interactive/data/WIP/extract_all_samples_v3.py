import re
import json
from typing import Dict, List

def extract_pension_info_v4(text: str) -> Dict[str, any]:
    """Extract structured information from a single text segment."""
    
    result = {
        'award_allowance_amount': None,
        'award_date_issued': None,
        'applicant_name': None,
        'soldier_name': None,
        'service_info': {
            'service_place': None,
            'rank': None,
            'company_commanded_by': None,
            'line': None,
            'service_duration': None
        },
        'act_date': None,
        'payment_frequency': None,  # New field for annual/semi-annual
        'full_text': text,
        'award_granted_place': None
    }
    
    # Clean text
    text_clean = text.replace('\n', ' ')
    text_clean = re.sub(r'\s+', ' ', text_clean)
    
    # 1. Award allowance amount - check for both $ and Dollars
    amount_patterns = [
        r'at the rate of\s+(\d+(?:\.\d+)?)\s*\$',  # $ symbol
        r'at the rate of\s+(\d+(?:\.\d+)?)\s+Dollars',  # Dollars word
        r'(\d+(?:\.\d+)?)\s*\$',  # Just $ symbol
        r'(\d+(?:\.\d+)?)\s+Dollars',  # Just Dollars word
        r'rate of\s+(\d+(?:\.\d+)?)\s*\$',
        r'rate of\s+(\d+(?:\.\d+)?)\s+Dollars'
    ]
    
    for pattern in amount_patterns:
        match = re.search(pattern, text_clean, re.I)
        if match:
            result['award_allowance_amount'] = float(match.group(1))
            break
    
    # 2. Payment frequency analysis
    frequency_patterns = [
        (r'per annum', 'annual'),
        (r'per year', 'annual'),
        (r'annually', 'annual'),
        (r'semi-?annual', 'semi-annual'),
        (r'semi-?anl', 'semi-annual'),
        (r'semi-?anl\.', 'semi-annual'),
        (r'per month', 'monthly'),
        (r'monthly', 'monthly')
    ]
    
    for pattern, frequency in frequency_patterns:
        if re.search(pattern, text_clean, re.I):
            result['payment_frequency'] = frequency
            break
    
    # 3. Award date issued
    match = re.search(r'Certificate of Pension issued the\s+(\d+(?:st|nd|rd|th)?)\s+day of\s+(\w+)\s+(\d{4})', text_clean, re.I)
    if match:
        day = match.group(1).rstrip('stndrdth')
        result['award_date_issued'] = f"{match.group(2)} {day}, {match.group(3)}"
    
    # 4. Applicant name
    match = re.search(r'widow of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if match:
        result['applicant_name'] = match.group(1)
        result['soldier_name'] = match.group(1)
    else:
        match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+of\s+[A-Za-z\s]+\s+in the State of', text_clean)
        if match:
            result['applicant_name'] = match.group(1)
            result['soldier_name'] = match.group(1)
    
    # 5. Service information
    match = re.search(r'who was a\s+(Private|Sergeant|Captain|Colonel|Drummer|Musician)', text_clean, re.I)
    if match:
        result['service_info']['rank'] = match.group(1)
    
    match = re.search(r'for(?:\s+the\s+term\s+of)?\s+(\d+\s+(?:months?|years?))', text_clean, re.I)
    if match:
        result['service_info']['service_duration'] = match.group(1)
    
    match = re.search(r'in the State of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if match:
        result['service_info']['service_place'] = match.group(1)
    
    match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+line', text_clean)
    if match:
        result['service_info']['line'] = match.group(1)
    
    # 6. Act date
    match = re.search(r'Act\s+(\w+)\s+(\d+),?\s+(\d{4})', text_clean, re.I)
    if match:
        result['act_date'] = f"{match.group(1)} {match.group(2)}, {match.group(3)}"
    
    # 7. Award granted place (state/colony on the roll)
    match = re.search(r'Inscribed on the Roll of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if not match:
        match = re.search(r'Roll of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if match:
        result['award_granted_place'] = match.group(1)
    
    return result

def split_and_extract_pension_info(full_text: str) -> List[Dict[str, any]]:
    """Split text by || markers and extract info from each segment."""
    
    # Split by || markers
    segments = full_text.split('||')
    
    results = []
    for i, segment in enumerate(segments):
        if segment.strip():  # Only process non-empty segments
            extracted = extract_pension_info_v4(segment.strip())
            extracted['segment_number'] = i + 1  # Track which segment this came from
            results.append(extracted)
    
    return results

# Process all samples and save results
if __name__ == "__main__":
    print("Processing all samples with || splitting and payment frequency analysis...")
    
    # Load the sample data
    with open('allowance_phrase_samples.json', 'r', encoding='utf-8') as f:
        samples = json.load(f)
    
    print(f"Processing {len(samples)} samples...")
    
    # Extract data from all samples
    all_extracted_data = []
    total_segments = 0
    
    for i, sample in enumerate(samples):
        if i % 5 == 0:
            print(f"Processing sample {i+1}/{len(samples)}...")
        
        # Split by || and extract from each segment
        segments_data = split_and_extract_pension_info(sample['allowance_phrase'])
        
        # Add NAID to each segment
        for segment_data in segments_data:
            segment_data['NAID'] = sample['NAID']
            all_extracted_data.append(segment_data)
            total_segments += 1
    
    # Save results to JSON file
    output_file = 'extracted_pension_data_v3.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_extracted_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nExtraction complete! Results saved to {output_file}")
    print(f"Original samples: {len(samples)}")
    print(f"Total segments processed: {total_segments}")
    print(f"Average segments per sample: {total_segments/len(samples):.1f}")
    
    # Show summary statistics
    print("\nSummary statistics:")
    print("-" * 50)
    
    # Count non-null values for each field
    fields_to_check = [
        'award_allowance_amount', 'award_date_issued', 'applicant_name', 
        'soldier_name', 'act_date', 'award_granted_place', 'payment_frequency'
    ]
    
    for field in fields_to_check:
        count = sum(1 for item in all_extracted_data if item.get(field) is not None)
        print(f"{field}: {count}/{total_segments} ({count/total_segments*100:.1f}%)")
    
    # Service info fields
    service_fields = ['service_place', 'rank', 'line', 'service_duration']
    for field in service_fields:
        count = sum(1 for item in all_extracted_data if item.get('service_info', {}).get(field) is not None)
        print(f"service_info.{field}: {count}/{total_segments} ({count/total_segments*100:.1f}%)")
    
    print(f"\nfull_text: {total_segments}/{total_segments} (100.0%) - All segments include full text")
    
    # Payment frequency breakdown
    print("\nPayment frequency breakdown:")
    print("-" * 30)
    frequency_counts = {}
    for item in all_extracted_data:
        freq = item.get('payment_frequency')
        if freq:
            frequency_counts[freq] = frequency_counts.get(freq, 0) + 1
    
    for freq, count in sorted(frequency_counts.items()):
        print(f"{freq}: {count} segments ({count/total_segments*100:.1f}%)")
    
    # Show sample of results
    print(f"\nSample of first 3 segments:")
    print("-" * 40)
    for i, item in enumerate(all_extracted_data[:3]):
        print(f"\nSegment {i+1} (NAID: {item['NAID']}, Segment: {item['segment_number']}):")
        for key, value in item.items():
            if key not in ['full_text'] and value is not None:
                if key == 'service_info':
                    service_data = {k: v for k, v in value.items() if v is not None}
                    if service_data:
                        print(f"  {key}: {service_data}")
                else:
                    print(f"  {key}: {value}")
