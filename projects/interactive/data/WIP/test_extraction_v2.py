import re
import json
from typing import Dict

def extract_pension_info_v2(text: str) -> Dict[str, any]:
    """Extract structured information including state/colony where award is granted."""
    
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
        'award_place': None,
        'award_granted_place': None  # State/colony where award is granted
    }
    
    # Clean text
    text_clean = text.replace('\n', ' ')
    text_clean = re.sub(r'\s+', ' ', text_clean)
    
    # 1. Award allowance amount
    match = re.search(r'at the rate of\s+(\d+(?:\.\d+)?)\s+Dollars', text_clean, re.I)
    if match:
        result['award_allowance_amount'] = float(match.group(1))
    
    # 2. Award date issued
    match = re.search(r'Certificate of Pension issued the\s+(\d+(?:st|nd|rd|th)?)\s+day of\s+(\w+)\s+(\d{4})', text_clean, re.I)
    if match:
        day = match.group(1).rstrip('stndrdth')
        result['award_date_issued'] = f"{match.group(2)} {day}, {match.group(3)}"
    
    # 3. Applicant name
    match = re.search(r'widow of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if match:
        result['applicant_name'] = match.group(1)
        result['soldier_name'] = match.group(1)
    else:
        match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+of\s+[A-Za-z\s]+\s+in the State of', text_clean)
        if match:
            result['applicant_name'] = match.group(1)
            result['soldier_name'] = match.group(1)
    
    # 4. Service information
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
    
    # 5. Act date
    match = re.search(r'Act\s+(\w+)\s+(\d+),?\s+(\d{4})', text_clean, re.I)
    if match:
        result['act_date'] = f"{match.group(1)} {match.group(2)}, {match.group(3)}"
    
    # 6. Award place (where sent)
    match = re.search(r'and sent to\s+([^,]+)', text_clean, re.I)
    if match:
        result['award_place'] = match.group(1).strip()
    
    # 7. Award granted place (state/colony on the roll)
    match = re.search(r'Inscribed on the Roll of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if not match:
        match = re.search(r'Roll of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text_clean)
    if match:
        result['award_granted_place'] = match.group(1)
    
    return result

# Test on samples
if __name__ == "__main__":
    print("Testing updated function with award_granted_place:")
    print("=" * 80)
    
    with open('allowance_phrase_samples2.json', 'r', encoding='utf-8') as f:
        samples = json.load(f)
    
    for i, sample in enumerate(samples[:5]):
        print(f"\nSample {i+1} (NAID: {sample['NAID']}):")
        print("-" * 40)
        extracted = extract_pension_info_v2(sample['allowance_phrase'])
        
        for key, value in extracted.items():
            if key == 'service_info':
                if any(extracted['service_info'].values()):
                    print(f"{key}:")
                    for sub_key, sub_value in value.items():
                        if sub_value:
                            print(f"  {sub_key}: {sub_value}")
            else:
                if value:
                    print(f"{key}: {value}")

