import re
import pandas as pd

# Pre-compile regex patterns for better performance
PATTERNS = {
    # Original patterns
    'vv_to_w': re.compile(r'\bvv'),
    'digit_1_to_I': re.compile(r'(?<=[A-Za-z])1|1(?=[A-Za-z])'),
    'digit_0_to_O': re.compile(r'(?<=[A-Za-z])0|0(?=[A-Za-z])'),
    'digit_5_to_S': re.compile(r'(?<=[A-Za-z])5|5(?=[A-Za-z])'),
    'digit_8_to_B': re.compile(r'(?<=[A-Za-z])8|8(?=[A-Za-z])'),
    'contractions': re.compile(r"'\s+([dst])\b"),
    'hyphenation': re.compile(r'(\w+)-\s*\n\s*(\w+)'),
    'multiple_spaces': re.compile(r'\s+'),
    'multiple_newlines': re.compile(r'\n\s*\n'),
    'sentence_breaks': re.compile(r'([.!?])\s*\n+\s*([A-Z])'),
    'space_before_punct': re.compile(r'\s+([,.!?;:])'),
    'space_after_punct': re.compile(r'([,.!?;:])\s*'),
    
    # New patterns for Revolutionary War documents
    'pipe_to_I': re.compile(r'\|'),
    'long_s': re.compile(r'ſ'),
    'double_vv': re.compile(r'vv'),
    'digit_6_to_G': re.compile(r'(?<=[A-Za-z])6|6(?=[A-Za-z])'),
    'digit_3_to_E': re.compile(r'(?<=[A-Za-z])3|3(?=[A-Za-z])'),
    'digit_7_to_T': re.compile(r'(?<=[A-Za-z])7|7(?=[A-Za-z])'),
    'broken_words': re.compile(r'(\w+)\s*\n\s*(\w+)'),
    'date_patterns': re.compile(r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})'),
    'pension_abbreviations': re.compile(r'\b(Rev|Revolution|Revolutionary)\s+War\b'),
    'state_abbreviations': re.compile(r'\b(Mass|Massachusetts|Ga|Georgia|Va|Virginia|Pa|Pennsylvania|N[YJ]|New\s+York|New\s+Jersey)\b'),
    'rank_abbreviations': re.compile(r'\b(Lt|Lieut|Lieutenant|Capt|Captain|Col|Colonel|Sgt|Sergeant|Pvt|Private)\b'),
    'common_ocr_errors': re.compile(r'\b(teh|adn|nad|taht|thier|recieve|occured|seperate)\b'),
    'quotation_marks': re.compile(r'["""]'),
    'apostrophe_fixes': re.compile(r"(\w)'(\w)"),
    'dash_normalization': re.compile(r'[—–]'),
    'parentheses_spacing': re.compile(r'\(\s+|\s+\)'),
    'colon_spacing': re.compile(r'(\w):(\w)'),
    'semicolon_spacing': re.compile(r'(\w);(\w)'),
    'comma_spacing': re.compile(r'(\w),(\w)'),
    'period_spacing': re.compile(r'(\w)\.(\w)'),
    'question_spacing': re.compile(r'(\w)\?(\w)'),
    'exclamation_spacing': re.compile(r'(\w)!(\w)')
}

def clean_up_text_fast(text):
    """
    Optimized version of clean_up_text with pre-compiled regex patterns.
    Enhanced for Revolutionary War pension documents.
    """
    if not text or pd.isna(text):
        return ''
    
    text = str(text)
    
    # Historical / OCR quirks - most common first
    text = PATTERNS['long_s'].sub('s', text)  # long s
    text = PATTERNS['pipe_to_I'].sub('I', text)  # | → I
    text = PATTERNS['double_vv'].sub('w', text)  # vv → w
    
    # Replace digits that look like letters (most common first)
    text = PATTERNS['digit_1_to_I'].sub('I', text)
    text = PATTERNS['digit_0_to_O'].sub('O', text)
    text = PATTERNS['digit_5_to_S'].sub('S', text)
    text = PATTERNS['digit_8_to_B'].sub('B', text)
    text = PATTERNS['digit_6_to_G'].sub('G', text)
    text = PATTERNS['digit_3_to_E'].sub('E', text)
    text = PATTERNS['digit_7_to_T'].sub('T', text)
    
    # Fix common OCR errors
    text = PATTERNS['common_ocr_errors'].sub(lambda m: {
        'teh': 'the', 'adn': 'and', 'nad': 'and', 'taht': 'that',
        'thier': 'their', 'recieve': 'receive', 'occured': 'occurred',
        'seperate': 'separate'
    }.get(m.group(), m.group()), text)
    
    # Normalize quotation marks
    text = PATTERNS['quotation_marks'].sub('"', text)
    
    # Fix apostrophes
    text = PATTERNS['apostrophe_fixes'].sub(r"\1'\2", text)
    
    # Normalize dashes
    text = PATTERNS['dash_normalization'].sub('-', text)
    
    # Fix spacing around punctuation
    text = PATTERNS['parentheses_spacing'].sub('(', text)
    text = PATTERNS['parentheses_spacing'].sub(')', text)
    text = PATTERNS['colon_spacing'].sub(r'\1: \2', text)
    text = PATTERNS['semicolon_spacing'].sub(r'\1; \2', text)
    text = PATTERNS['comma_spacing'].sub(r'\1, \2', text)
    text = PATTERNS['period_spacing'].sub(r'\1. \2', text)
    text = PATTERNS['question_spacing'].sub(r'\1? \2', text)
    text = PATTERNS['exclamation_spacing'].sub(r'\1! \2', text)
    
    # Fix broken words across lines
    text = PATTERNS['broken_words'].sub(r'\1\2', text)
    
    # Contraction fixes
    text = PATTERNS['contractions'].sub(r"'\1", text)
    
    # Hyphenation across line breaks
    text = PATTERNS['hyphenation'].sub(r'\1\2', text)
    
    # Standardize abbreviations (optional - can be commented out for speed)
    # text = PATTERNS['pension_abbreviations'].sub('Revolutionary War', text)
    # text = PATTERNS['state_abbreviations'].sub(lambda m: {
    #     'Mass': 'Massachusetts', 'Ga': 'Georgia', 'Va': 'Virginia',
    #     'Pa': 'Pennsylvania', 'NY': 'New York', 'NJ': 'New Jersey'
    # }.get(m.group(), m.group()), text)
    # text = PATTERNS['rank_abbreviations'].sub(lambda m: {
    #     'Lt': 'Lieutenant', 'Lieut': 'Lieutenant', 'Capt': 'Captain',
    #     'Col': 'Colonel', 'Sgt': 'Sergeant', 'Pvt': 'Private'
    # }.get(m.group(), m.group()), text)
    
    # Paragraph/spacing cleanup
    text = PATTERNS['multiple_spaces'].sub(' ', text)
    text = PATTERNS['multiple_newlines'].sub('\n\n', text)
    text = PATTERNS['sentence_breaks'].sub(r'\1\n\n\2', text)
    
    # Final punctuation spacing
    text = PATTERNS['space_before_punct'].sub(r'\1', text)
    text = PATTERNS['space_after_punct'].sub(r'\1 ', text)
    
    return text.strip()


def clean_ocr_batch(texts, progress_callback=None):
    """
    Clean a batch of OCR texts efficiently.
    
    Args:
        texts: List or Series of text strings
        progress_callback: Optional function to call with progress updates
    
    Returns:
        List of cleaned text strings
    """
    if isinstance(texts, pd.Series):
        texts = texts.tolist()
    
    cleaned_texts = []
    total = len(texts)
    
    for i, text in enumerate(texts):
        cleaned_texts.append(clean_up_text_fast(text))
        
        if progress_callback and (i + 1) % 100 == 0:
            progress_callback(i + 1, total)
    
    if progress_callback:
        progress_callback(total, total)
    
    return cleaned_texts


def clean_up_text_minimal(text):
    """
    Minimal cleaning for maximum speed - only the most essential fixes.
    Use when processing very large datasets.
    """
    if not text or pd.isna(text):
        return ''
    
    text = str(text)
    
    # Only the most critical fixes for speed
    text = text.replace('ſ', 's')  # long s
    text = text.replace('|', 'I')  # | → I
    text = text.replace('vv', 'w')  # vv → w
    
    # Most common digit-to-letter conversions
    text = re.sub(r'(?<=[A-Za-z])1|1(?=[A-Za-z])', 'I', text)
    text = re.sub(r'(?<=[A-Za-z])0|0(?=[A-Za-z])', 'O', text)
    text = re.sub(r'(?<=[A-Za-z])5|5(?=[A-Za-z])', 'S', text)
    
    # Basic spacing cleanup
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    return text.strip()


def clean_for_amounts(text):
    """
    Minimal cleaning specifically optimized for extracting dollar amounts and acre amounts.
    Only fixes the most critical OCR errors that would break number recognition.
    """
    if not text or pd.isna(text):
        return ''
    
    text = str(text)
    
    # Only fix OCR errors that would break number/amount recognition
    text = text.replace('ſ', 's')  # long s
    text = text.replace('|', 'I')  # | → I (but preserve in numbers)
    text = text.replace('vv', 'w')  # vv → w
    
    # Fix digits that look like letters ONLY when they would break number patterns
    # Don't convert digits that are clearly part of numbers
    text = re.sub(r'(?<=[A-Za-z])1(?=[A-Za-z])', 'I', text)  # 1 between letters
    text = re.sub(r'(?<=[A-Za-z])0(?=[A-Za-z])', 'O', text)  # 0 between letters
    text = re.sub(r'(?<=[A-Za-z])5(?=[A-Za-z])', 'S', text)  # 5 between letters
    text = re.sub(r'(?<=[A-Za-z])8(?=[A-Za-z])', 'B', text)  # 8 between letters
    
    # Fix common OCR errors that affect amount recognition
    text = text.replace('teh', 'the')
    text = text.replace('adn', 'and')
    text = text.replace('nad', 'and')
    
    # Normalize spaces but preserve number formatting
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def extract_amounts(text):
    """
    Extract dollar amounts and acre amounts from OCR text.
    Returns a dictionary with 'dollars' and 'acres' lists.
    """
    if not text or pd.isna(text):
        return {'dollars': [], 'acres': []}
    
    # Clean text minimally for amount extraction
    cleaned_text = clean_for_amounts(text)
    
    # Patterns for dollar amounts
    dollar_patterns = [
        r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)',  # $123.45, $1,234.56
        r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?',  # 123.45 dollars
        r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\$',  # 123.45 $
        r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*per\s+annum',  # 123.45 per annum
        r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*per\s+year',  # 123.45 per year
        r'rate\s+of\s+(\d+(?:,\d{3})*(?:\.\d{2})?)',  # rate of 123.45
        r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*cents?',  # 123.45 cents
    ]
    
    # Patterns for acre amounts
    acre_patterns = [
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?',  # 123 acres, 123.5 acres
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*ac\b',  # 123 ac
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?\s+of\s+land',  # 123 acres of land
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?\s+granted',  # 123 acres granted
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?\s+entitled',  # 123 acres entitled
        r'warrant\s+for\s+(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?',  # warrant for 123 acres
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*acres?\s+of\s+bounty',  # 123 acres of bounty
    ]
    
    dollars = []
    acres = []
    
    # Extract dollar amounts
    for pattern in dollar_patterns:
        matches = re.findall(pattern, cleaned_text, re.IGNORECASE)
        for match in matches:
            try:
                # Clean and convert to float
                amount = float(match.replace(',', ''))
                if amount > 0:  # Only positive amounts
                    dollars.append(amount)
            except ValueError:
                continue
    
    # Extract acre amounts
    for pattern in acre_patterns:
        matches = re.findall(pattern, cleaned_text, re.IGNORECASE)
        for match in matches:
            try:
                # Clean and convert to float
                amount = float(match.replace(',', ''))
                if amount > 0:  # Only positive amounts
                    acres.append(amount)
            except ValueError:
                continue
    
    return {'dollars': dollars, 'acres': acres}