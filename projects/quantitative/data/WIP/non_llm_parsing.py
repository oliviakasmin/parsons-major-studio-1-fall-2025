# -*- coding: utf-8 -*-
"""
Deterministic parsing functions for Revolutionary War pension files.

This module contains all the deterministic (non-LLM) parsing functions
for extracting information from pension file titles and text content.

Functions:
  - parse_title_deterministic: Parse pension file titles
  - extract_dates_from_text: Extract dates from OCR/transcription text
  - choose_text: Select best text source (transcription vs OCR)
  - _parse_json_text: Parse JSON-serialized text columns
"""

from __future__ import annotations
import json
import re
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd


# ---------------------------------------------------------------------------
# Helpers: text preference
# ---------------------------------------------------------------------------

def _parse_json_text(text_value) -> str:
    """
    Parse JSON-serialized text (e.g., '["text content..."]') or return as-is.
    """
    if not text_value or pd.isna(text_value):
        return ""
    
    text_str = str(text_value).strip()
    if not text_str:
        return ""
    
    # Try to parse as JSON array
    try:
        parsed = json.loads(text_str)
        if isinstance(parsed, list) and len(parsed) > 0:
            # Concatenate all elements, not just the first one
            return " ".join(str(item) for item in parsed if item)
    except (json.JSONDecodeError, TypeError, IndexError):
        pass
    
    # Return as-is if not JSON or parsing fails
    return text_str

def choose_text(row: pd.Series) -> Tuple[str, str]:
    """
    Prefer 'transcriptionText' if present, else 'ocrText'.
    Handles JSON-serialized text columns.
    Returns (text, source_name).
    """
    tx = _parse_json_text(row.get("transcriptionText"))
    if tx:
        return tx, "transcriptionText"
    ox = _parse_json_text(row.get("ocrText"))
    return ox, "ocrText"


# ---------------------------------------------------------------------------
# Deterministic Title Parsing
# ---------------------------------------------------------------------------

_FILE_TYPE_MAP = {
    "S": "S",       # survivor/soldier
    "R": "R",       # rejected
    "W": "W",       # widow
    "T": "T",       # testament/trust
    "BLW": "BLW",   # bounty land warrant
    "B": "BLW",     # treat "B." leading token as BLW if it's "B. L. Wt."
    "OW": "OW",     # Old War
    "NA": "NA_ACC", # NA Accession placeholder
}

# compiled patterns for common title formats
_RE_SRWT = re.compile(r"\bFile\s+(?P<tok>[SRWT])\.\s*(?P<id>[A-Za-z0-9.,\- ]+?)(?:,|\s|$)", re.IGNORECASE)
_RE_BLW = re.compile(r"\bFile\s+(?:B\.?\s*L\.?\s*W(?:t\.?)?|BLW)\.?\s*(?P<id>[A-Za-z0-9\-]+)", re.IGNORECASE)
_RE_OW  = re.compile(r"\b(?:Old\s+War|OW)\b.*?\bFile\b\s*(?P<id>[A-Za-z0-9\-]+)", re.IGNORECASE)
_RE_ACC = re.compile(r"\bN\.?\s*A\.?\s*Acc(?:ession)?\b", re.IGNORECASE)

def _normalize_file_type(title: str) -> Tuple[str, Dict[str, Any]]:
    """
    Returns (file_type_category, info_obj), where info_obj includes:
      - matched_snippet
      - normalized_category
      - certainty (0..1)
      - raw_token
    If not confidently matched, category is "".
    """
    t = title or ""
    # Try S./R./W./T.
    m = _RE_SRWT.search(t)
    if m:
        tok = m.group("tok").upper()
        cat = _FILE_TYPE_MAP.get(tok, "")
        snippet = m.group(0).strip()
        info = {
            "matched_snippet": snippet,
            "normalized_category": cat or "",
            "certainty": 1.0 if cat else 0.6,
            "raw_token": tok + ".",
        }
        return (cat if info["certainty"] >= 0.75 else ""), info

    # Try BLW
    m = _RE_BLW.search(t)
    if m:
        tok = "BLW"
        cat = _FILE_TYPE_MAP.get(tok, "")
        snippet = m.group(0).strip()
        info = {
            "matched_snippet": snippet,
            "normalized_category": cat or "",
            "certainty": 1.0,
            "raw_token": "B. L. Wt./BLW",
        }
        return (cat if info["certainty"] >= 0.75 else ""), info

    # Try Old War
    m = _RE_OW.search(t)
    if m:
        tok = "OW"
        cat = _FILE_TYPE_MAP.get(tok, "")
        snippet = m.group(0).strip()
        info = {
            "matched_snippet": snippet,
            "normalized_category": cat or "",
            "certainty": 0.9,
            "raw_token": "Old War",
        }
        return (cat if info["certainty"] >= 0.75 else ""), info

    # NA Accession placeholder
    if _RE_ACC.search(t):
        tok = "NA"
        cat = _FILE_TYPE_MAP.get(tok, "")
        snippet = _RE_ACC.search(t).group(0)
        info = {
            "matched_snippet": snippet,
            "normalized_category": cat or "",
            "certainty": 0.85,
            "raw_token": "N A Acc",
        }
        return (cat if info["certainty"] >= 0.75 else ""), info

    # Not recognized
    return "", {
        "matched_snippet": "",
        "normalized_category": "",
        "certainty": 0.0,
        "raw_token": "",
    }

def _split_after_id_segment(title: str) -> List[str]:
    """
    Try to split the title into segments after the file id so we
    can pick 'applicant name' and 'place' by comma positions.
    """
    t = title or ""
    # Look for the earliest of the patterns to locate id end
    matches: List[Tuple[int, int]] = []
    for rx in (_RE_SRWT, _RE_BLW, _RE_OW):
        m = rx.search(t)
        if m:
            matches.append(m.span())
    if not matches:
        # fallback: split all commas
        parts = [p.strip(" .") for p in t.split(",")]
        return [x for x in parts if x]

    start, end = sorted(matches, key=lambda x: x[0])[0]
    trailing = t[end:].strip()
    parts = [p.strip(" .") for p in trailing.split(",")]
    return [x for x in parts if x]

def parse_title_deterministic(title: str) -> Dict[str, Any]:
    """
    Deterministic parsing for the 'title' column.
    Returns a dict you can JSON-dump for 'parsed_title_json'.
    """
    title = title or ""
    file_type_category, info = _normalize_file_type(title)

    segments_after_id = _split_after_id_segment(title)
    applicant_from_title = segments_after_id[0] if segments_after_id else ""
    applicant_place_from_title = segments_after_id[1] if len(segments_after_id) > 1 else ""

    # crude intro: up to 'File' when present
    intro = title
    m_intro = re.search(r"^(.*?)(?=\bFile\b)", title)
    if m_intro:
        intro = m_intro.group(1).strip(" -;,:.")

    parsed = {
        "raw_title": title,
        "file_name_intro": intro,
        "file_type_category_detected": info.get("normalized_category", ""),
        "file_type_snippet": info.get("matched_snippet", ""),
        "file_type_certainty": info.get("certainty", 0.0),
        "applicant_from_title": applicant_from_title,
        "applicant_place_from_title": applicant_place_from_title,
    }
    return parsed


# ---------------------------------------------------------------------------
# Deterministic Date Extraction
# ---------------------------------------------------------------------------

def extract_dates_from_text(text: str) -> List[str]:
    """
    Extract dates from text content (OCR or transcription).
    
    Looks for dates in various formats:
    - Numeric: 1775, 1783, 1845, etc.
    - Written: "eighteen forty", "seventeen seventy-five", etc.
    - Mixed: "1845", "eighteen forty-five", etc.
    
    Only returns dates between 1700 and 1900.
    Returns all found dates (including duplicates).
    
    Args:
        text: The text to search for dates
        
    Returns:
        List of date strings found in the text
    """
    if not text or pd.isna(text):
        return []
    
    text_str = str(text).strip()
    if not text_str:
        return []
    
    dates_found = []
    
    # Pattern 1: Numeric years (1700-1900)
    numeric_pattern = r'\b(17[0-9]{2}|18[0-9]{2}|1900)\b'
    numeric_matches = re.findall(numeric_pattern, text_str)
    dates_found.extend(numeric_matches)
    
    # Pattern 2: Written years (e.g., "eighteen forty", "seventeen seventy-five")
    written_years = _extract_written_years(text_str)
    dates_found.extend(written_years)
    
    # Pattern 3: Mixed formats (e.g., "1845", "eighteen forty-five")
    mixed_years = _extract_mixed_years(text_str)
    dates_found.extend(mixed_years)
    
    # Filter to valid range and return all found dates
    valid_dates = []
    for date_str in dates_found:
        try:
            year = int(date_str)
            if 1700 <= year <= 1900:
                valid_dates.append(str(year))
        except (ValueError, TypeError):
            continue
    
    return valid_dates

def _extract_written_years(text: str) -> List[str]:
    """Extract written-out years from text."""
    # Word to number mapping
    word_to_num = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
        'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
        'eighty': 80, 'ninety': 90
    }
    
    years = []
    
    # Pattern for "eighteen forty", "seventeen seventy-five", etc.
    # Look for "seventeen" or "eighteen" followed by decade words
    pattern = r'\b(seventeen|eighteen|nineteen)\s+(hundred\s+and\s+)?(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(\s+and\s+)?(one|two|three|four|five|six|seven|eight|nine)?\b'
    
    matches = re.finditer(pattern, text.lower())
    for match in matches:
        century_word = match.group(1)
        decade_word = match.group(3)
        unit_word = match.group(5)
        
        # Convert century
        if century_word == 'seventeen':
            century = 1700
        elif century_word == 'eighteen':
            century = 1800
        elif century_word == 'nineteen':
            century = 1900
        else:
            continue
        
        # Convert decade
        decade = word_to_num.get(decade_word, 0)
        if decade == 0:
            continue
            
        # Convert units (if present)
        units = word_to_num.get(unit_word, 0) if unit_word else 0
        
        year = century + decade + units
        if 1700 <= year <= 1900:
            years.append(str(year))
    
    # Pattern for "eighteen and forty", "seventeen and seventy-five", etc.
    pattern2 = r'\b(seventeen|eighteen|nineteen)\s+and\s+(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(\s+and\s+)?(one|two|three|four|five|six|seven|eight|nine)?\b'
    
    matches2 = re.finditer(pattern2, text.lower())
    for match in matches2:
        century_word = match.group(1)
        decade_word = match.group(2)
        unit_word = match.group(4)
        
        # Convert century
        if century_word == 'seventeen':
            century = 1700
        elif century_word == 'eighteen':
            century = 1800
        elif century_word == 'nineteen':
            century = 1900
        else:
            continue
        
        # Convert decade
        decade = word_to_num.get(decade_word, 0)
        if decade == 0:
            continue
            
        # Convert units (if present)
        units = word_to_num.get(unit_word, 0) if unit_word else 0
        
        year = century + decade + units
        if 1700 <= year <= 1900:
            years.append(str(year))
    
    return years

def _extract_mixed_years(text: str) -> List[str]:
    """Extract mixed format years (e.g., '1845', 'eighteen forty-five')."""
    years = []
    
    # Pattern for "eighteen forty-five", "seventeen seventy-five", etc.
    pattern = r'\b(seventeen|eighteen|nineteen)\s+([0-9]{2})\b'
    
    matches = re.finditer(pattern, text.lower())
    for match in matches:
        century_word = match.group(1)
        year_suffix = match.group(2)
        
        # Convert century
        if century_word == 'seventeen':
            century = 1700
        elif century_word == 'eighteen':
            century = 1800
        elif century_word == 'nineteen':
            century = 1900
        else:
            continue
        
        try:
            year = century + int(year_suffix)
            if 1700 <= year <= 1900:
                years.append(str(year))
        except ValueError:
            continue
    
    return years

def identify_application_dates(text: str, extracted_dates: List[str], file_type_category: str = "") -> Dict[str, Any]:
    """
    Identify which extracted dates are likely related to application filing.
    
    Uses deterministic patterns and historical context to identify dates:
    - Application dates: typically 1818+ (when pension acts were passed)
    - Service dates: 1775-1783 for Revolutionary War (unless Old War file type)
    - Old War service dates: 1790s-1810s for post-Revolutionary conflicts
    
    Args:
        text: The original text content
        extracted_dates: List of dates already extracted from the text
        file_type_category: File type category (S, R, W, T, BLW, OW, NA_ACC)
        
    Returns:
        Dict with:
        - application_dates: List of dates likely related to applications
        - service_dates: List of dates likely related to military service
        - other_dates: List of dates that don't fit clear patterns
        - confidence_scores: Dict mapping dates to confidence scores (0-1)
    """
    if not text or not extracted_dates:
        return {
            'application_dates': [],
            'service_dates': [],
            'other_dates': extracted_dates,
            'confidence_scores': {}
        }
    
    text_lower = text.lower()
    application_dates = []
    service_dates = []
    other_dates = []
    confidence_scores = {}
    
    # Patterns that strongly indicate application filing (based on real data analysis)
    application_patterns = [
        # High-confidence patterns (score 3)
        r'personally\s+appeared.*?(\d{4})',
        r'sworn\s+and\s+subscribed.*?(\d{4})',
        r'declaration.*?(\d{4})',
        r'justice\s+of\s+the\s+peace.*?(\d{4})',
        r'county\s+court.*?(\d{4})',
        r'before\s+me.*?(\d{4})',
        
        # Medium-confidence patterns (score 2)
        r'on\s+this\s+\d+\s+day\s+of\s+\w+\s+(\d{4})',
        r'this\s+\d+\s+day\s+of\s+\w+\s+(\d{4})',
        r'filed.*?(\d{4})',
        r'application.*?(\d{4})',
        r'made\s+application.*?(\d{4})',
        r'applied.*?(\d{4})',
        r'petition.*?(\d{4})',
        r'declared.*?(\d{4})',
        r'subscribed.*?(\d{4})',
        r'witness.*?(\d{4})',
        r'according\s+to\s+law.*?(\d{4})',
        r'clerk.*?(\d{4})',
        r'office.*?(\d{4})',
        r'pension\s+act.*?(\d{4})',
        r'act\s+of\s+congress.*?(\d{4})',
        
        # Additional patterns found in data
        r'court\s+of\s+common\s+pleas.*?(\d{4})',
        r'circuit\s+court.*?(\d{4})',
        r'probate\s+court.*?(\d{4})',
        r'orphans\s+court.*?(\d{4})',
        r'court\s+of\s+record.*?(\d{4})',
        r'notary\s+public.*?(\d{4})',
        r'commissioner.*?(\d{4})',
        r'administrator.*?(\d{4})',
        r'executor.*?(\d{4})',
        r'guardian.*?(\d{4})',
        r'widow.*?(\d{4})',
        r'heir.*?(\d{4})',
        r'next\s+of\s+kin.*?(\d{4})',
        r'pension\s+application.*?(\d{4})',
        r'pension\s+claim.*?(\d{4})',
        r'bounty\s+land.*?(\d{4})',
        r'warrant.*?(\d{4})'
    ]
    
    # Patterns that indicate military service (based on real data analysis)
    service_patterns = [
        # High-confidence service patterns (score 3)
        r'enlisted.*?(\d{4})',
        r'served.*?(\d{4})',
        r'discharged.*?(\d{4})',
        r'revolutionary\s+war.*?(\d{4})',
        r'continental\s+army.*?(\d{4})',
        
        # Medium-confidence service patterns (score 2)
        r'service.*?(\d{4})',
        r'regiment.*?(\d{4})',
        r'company.*?(\d{4})',
        r'captain.*?(\d{4})',
        r'colonel.*?(\d{4})',
        r'war.*?(\d{4})',
        r'battle.*?(\d{4})',
        r'campaign.*?(\d{4})',
        r'army.*?(\d{4})',
        r'soldier.*?(\d{4})',
        r'military.*?(\d{4})',
        r'revolutionary.*?(\d{4})',
        r'continental.*?(\d{4})',
        
        # Additional service patterns
        r'private.*?(\d{4})',
        r'corporal.*?(\d{4})',
        r'sergeant.*?(\d{4})',
        r'lieutenant.*?(\d{4})',
        r'major.*?(\d{4})',
        r'general.*?(\d{4})',
        r'volunteer.*?(\d{4})',
        r'militia.*?(\d{4})',
        r'fought.*?(\d{4})',
        r'engaged.*?(\d{4})',
        r'wounded.*?(\d{4})',
        r'killed.*?(\d{4})',
        r'died.*?(\d{4})',
        r'buried.*?(\d{4})'
    ]
    
    # Define historical date ranges
    is_old_war = file_type_category == 'OW'
    
    # Check each extracted date
    for date in extracted_dates:
        year = int(date)
        confidence = 0.0
        date_type = 'other'
        
        # Historical context analysis
        is_revolutionary_war_period = 1775 <= year <= 1783
        is_old_war_period = 1790 <= year <= 1815
        is_application_period = year >= 1818
        
        # Look for application patterns around this date with weighted scoring
        app_pattern_scores = {
            # High-confidence patterns (score 3)
            r'personally\s+appeared.*?(\d{4})': 3,
            r'sworn\s+and\s+subscribed.*?(\d{4})': 3,
            r'declaration.*?(\d{4})': 3,
            r'justice\s+of\s+the\s+peace.*?(\d{4})': 3,
            r'county\s+court.*?(\d{4})': 3,
            r'before\s+me.*?(\d{4})': 3,
            
            # Medium-confidence patterns (score 2)
            r'on\s+this\s+\d+\s+day\s+of\s+\w+\s+(\d{4})': 2,
            r'this\s+\d+\s+day\s+of\s+\w+\s+(\d{4})': 2,
            r'filed.*?(\d{4})': 2,
            r'application.*?(\d{4})': 2,
            r'made\s+application.*?(\d{4})': 2,
            r'applied.*?(\d{4})': 2,
            r'petition.*?(\d{4})': 2,
            r'declared.*?(\d{4})': 2,
            r'subscribed.*?(\d{4})': 2,
            r'witness.*?(\d{4})': 2,
            r'according\s+to\s+law.*?(\d{4})': 2,
            r'clerk.*?(\d{4})': 2,
            r'office.*?(\d{4})': 2,
            r'pension\s+act.*?(\d{4})': 2,
            r'act\s+of\s+congress.*?(\d{4})': 2,
        }
        
        app_score = 0
        for pattern, score in app_pattern_scores.items():
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                if match.group(1) == date:
                    app_score += score
                    date_type = 'application'
        
        if app_score > 0:
            # Calculate confidence based on pattern score and historical context
            base_confidence = min(0.3 + (app_score * 0.2), 0.9)  # 0.5 to 0.9
            if is_application_period:
                confidence = max(confidence, base_confidence + 0.1)  # Boost for 1818+
            else:
                confidence = max(confidence, base_confidence)

        # Look for service patterns around this date with weighted scoring
        service_pattern_scores = {
            # High-confidence service patterns (score 3)
            r'enlisted.*?(\d{4})': 3,
            r'served.*?(\d{4})': 3,
            r'discharged.*?(\d{4})': 3,
            r'revolutionary\s+war.*?(\d{4})': 3,
            r'continental\s+army.*?(\d{4})': 3,
            
            # Medium-confidence service patterns (score 2)
            r'service.*?(\d{4})': 2,
            r'regiment.*?(\d{4})': 2,
            r'company.*?(\d{4})': 2,
            r'captain.*?(\d{4})': 2,
            r'colonel.*?(\d{4})': 2,
            r'war.*?(\d{4})': 2,
            r'battle.*?(\d{4})': 2,
            r'campaign.*?(\d{4})': 2,
            r'army.*?(\d{4})': 2,
            r'soldier.*?(\d{4})': 2,
            r'military.*?(\d{4})': 2,
            r'revolutionary.*?(\d{4})': 2,
            r'continental.*?(\d{4})': 2,
        }
        
        service_score = 0
        for pattern, score in service_pattern_scores.items():
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                if match.group(1) == date:
                    service_score += score
                    if confidence < 0.8:  # Don't override strong application patterns
                        date_type = 'service'
        
        if service_score > 0 and confidence < 0.8:
            # Calculate confidence based on pattern score and historical context
            base_confidence = min(0.2 + (service_score * 0.15), 0.8)  # 0.35 to 0.8
            if is_old_war and is_old_war_period:
                confidence = max(confidence, base_confidence + 0.2)  # Boost for Old War
            elif not is_old_war and is_revolutionary_war_period:
                confidence = max(confidence, base_confidence + 0.2)  # Boost for Revolutionary War
            else:
                confidence = max(confidence, base_confidence)
        
        # Additional heuristics with historical context
        if confidence == 0.0:
            # Check if date appears near common application words
            date_context_pattern = rf'\b{date}\b'
            date_matches = list(re.finditer(date_context_pattern, text_lower))
            
            for match in date_matches:
                start = max(0, match.start() - 100)
                end = min(len(text_lower), match.end() + 100)
                context = text_lower[start:end]
                
                # Count application-related words in context
                app_words = ['appeared', 'declaration', 'sworn', 'filed', 'application', 'petition', 'justice', 'court']
                service_words = ['enlisted', 'served', 'discharged', 'regiment', 'company', 'war', 'battle', 'army']
                
                app_count = sum(1 for word in app_words if word in context)
                service_count = sum(1 for word in service_words if word in context)
                
                if app_count > service_count and app_count > 0:
                    # Boost confidence for application period
                    base_confidence = 0.4
                    if is_application_period:
                        confidence = base_confidence + 0.2  # 0.6
                    else:
                        confidence = base_confidence  # 0.4
                    date_type = 'application'
                elif service_count > app_count and service_count > 0:
                    # Boost confidence based on historical context
                    base_confidence = 0.3
                    if is_old_war and is_old_war_period:
                        confidence = base_confidence + 0.3  # 0.6
                    elif not is_old_war and is_revolutionary_war_period:
                        confidence = base_confidence + 0.3  # 0.6
                    else:
                        confidence = base_confidence  # 0.3
                    date_type = 'service'
        
        # Historical context overrides - be more inclusive
        if confidence == 0.0:
            # If no pattern match, use historical context as fallback
            if is_application_period and year >= 1818:
                confidence = 0.5  # Increased from 0.3
                date_type = 'application'
            elif is_old_war and is_old_war_period:
                confidence = 0.4
                date_type = 'service'
            elif not is_old_war and is_revolutionary_war_period:
                confidence = 0.4
                date_type = 'service'
        
        # Categorize the date with selective thresholds but fallback strategy
        if date_type == 'application' and confidence > 0.4:  # Selective threshold for pattern-based
            application_dates.append(date)
        elif date_type == 'service' and confidence > 0.3:
            service_dates.append(date)
        else:
            # Fallback strategy: if no strong patterns found, use historical context
            if year >= 1818:
                # Default 1818+ dates to application if no strong service patterns
                if date_type != 'service' or confidence < 0.5:
                    application_dates.append(date)
                    confidence_scores[date] = 0.3  # Lower confidence for fallback
                else:
                    service_dates.append(date)
                    confidence_scores[date] = confidence
            elif 1775 <= year <= 1783:
                # Default Revolutionary War period to service
                service_dates.append(date)
                confidence_scores[date] = 0.4  # Higher confidence for historical context
            elif is_old_war and 1790 <= year <= 1815:
                # Old War period dates
                service_dates.append(date)
                confidence_scores[date] = 0.4
            else:
                # Everything else goes to other
                other_dates.append(date)
        
        # Only assign confidence if not already assigned
        if date not in confidence_scores:
            confidence_scores[date] = confidence
    
    return {
        'application_dates': application_dates,
        'service_dates': service_dates,
        'other_dates': other_dates,
        'confidence_scores': confidence_scores
    }


# ---------------------------------------------------------------------------
# Main Processing Function
# ---------------------------------------------------------------------------

def process_deterministic_only(df: pd.DataFrame) -> pd.DataFrame:
    """
    Process a dataframe using only deterministic parsing (no LLM).
    
    Adds columns:
      - parsed_title_json (deterministic)
      - applicant_from_title
      - applicant_place_from_title
      - file_type_category
      - file_type_category_info
      - extracted_dates_json (deterministic)
      - extracted_dates (simple list of dates)
      - application_dates (dates likely related to application filing)
      - service_dates (dates likely related to military service)
      - other_dates (dates that don't fit clear patterns)
      - date_confidence_scores (confidence scores for date classification)
      
    Args:
        df: Input dataframe with 'title', 'ocrText', 'transcriptionText' columns
        
    Returns:
        Dataframe with added deterministic parsing columns
    """
    df = df.copy()
    
    # Initialize new columns
    df['parsed_title_json'] = None
    df['applicant_from_title'] = None
    df['applicant_place_from_title'] = None
    df['file_type_category'] = None
    df['file_type_category_info'] = None
    df['extracted_dates_json'] = None
    df['extracted_dates'] = None
    df['application_dates'] = None
    df['service_dates'] = None
    df['other_dates'] = None
    df['date_confidence_scores'] = None
    
    # Process titles deterministically
    def process_title_row(title):
        title = str(title or "")
        parsed = parse_title_deterministic(title)
        file_type_category, info = _normalize_file_type(title)
        return {
            'parsed_json': json.dumps(parsed, ensure_ascii=False),
            'applicant_from_title': parsed.get("applicant_from_title", ""),
            'applicant_place_from_title': parsed.get("applicant_place_from_title", ""),
            'file_type_category': file_type_category if info.get("certainty", 0.0) >= 0.75 else "",
            'file_type_info': json.dumps(info, ensure_ascii=False)
        }
    
    print("Processing titles deterministically...")
    title_results = df['title'].apply(process_title_row)
    
    df["parsed_title_json"] = [r['parsed_json'] for r in title_results]
    df["applicant_from_title"] = [r['applicant_from_title'] for r in title_results]
    df["applicant_place_from_title"] = [r['applicant_place_from_title'] for r in title_results]
    df["file_type_category"] = [r['file_type_category'] for r in title_results]
    df["file_type_category_info"] = [r['file_type_info'] for r in title_results]
    
    # Process dates deterministically
    def process_dates_row(row):
        text, _ = choose_text(row)
        dates = extract_dates_from_text(text)
        # Sort dates by year (convert to int for sorting, then back to string)
        sorted_dates = sorted(dates, key=lambda x: int(x) if x.isdigit() else 0)
        
        # Get file type category for historical context
        file_type_category = row.get('file_type_category', '')
        
        # Classify dates by type with historical context
        date_classification = identify_application_dates(text, sorted_dates, file_type_category)
        
        return {
            'extracted_dates_json': json.dumps(sorted_dates, ensure_ascii=False),
            'extracted_dates': sorted_dates,
            'application_dates': date_classification['application_dates'],
            'service_dates': date_classification['service_dates'],
            'other_dates': date_classification['other_dates'],
            'date_confidence_scores': json.dumps(date_classification['confidence_scores'], ensure_ascii=False)
        }
    
    print("Processing dates deterministically...")
    dates_results = df.apply(process_dates_row, axis=1)
    
    df["extracted_dates_json"] = [r['extracted_dates_json'] for r in dates_results]
    df["extracted_dates"] = [r['extracted_dates'] for r in dates_results]
    df["application_dates"] = [r['application_dates'] for r in dates_results]
    df["service_dates"] = [r['service_dates'] for r in dates_results]
    df["other_dates"] = [r['other_dates'] for r in dates_results]
    df["date_confidence_scores"] = [r['date_confidence_scores'] for r in dates_results]
    
    return df


if __name__ == "__main__":
    # Test the deterministic processing
    import pandas as pd
    
    print("Loading full dataset...")
    df = pd.read_parquet('nara_pension_file_pages_by_naid.parquet')
    print(f"Loaded {len(df)} rows")
    
    # Process first 1,000 rows
    subset_df = df.head(1000)
    print(f"Processing first 1,000 rows...")
    
    # Process deterministically
    processed_df = process_deterministic_only(subset_df)
    
    print("\nResults:")
    print(f"File type categories: {processed_df['file_type_category'].value_counts().to_dict()}")
    print(f"Total dates extracted: {sum(len(dates) for dates in processed_df['extracted_dates'])}")
    print(f"Rows with dates: {(processed_df['extracted_dates'].apply(len) > 0).sum()}")
    
    # Count date types
    app_dates_count = sum(len(dates) for dates in processed_df['application_dates'])
    service_dates_count = sum(len(dates) for dates in processed_df['service_dates'])
    other_dates_count = sum(len(dates) for dates in processed_df['other_dates'])
    print(f"Application dates: {app_dates_count}")
    print(f"Service dates: {service_dates_count}")
    print(f"Other dates: {other_dates_count}")
    
    # Show some examples
    print("\nSample results:")
    for i in range(min(3, len(processed_df))):
        row = processed_df.iloc[i]
        print(f"Row {i}:")
        print(f"  Title: {row['title'][:60]}...")
        print(f"  File type: {row['file_type_category']}")
        print(f"  Total dates: {len(row['extracted_dates'])}")
        if len(row['extracted_dates']) > 0:
            print(f"    Application: {row['application_dates']}")
            print(f"    Service: {row['service_dates']}")
            print(f"    Other: {row['other_dates']}")
        print()
    
    # Save the processed dataframe
    output_file = 'nara_pension_file_pages_titles_dates_parsed_first_1000.parquet'
    processed_df.to_parquet(output_file)
    print(f"\n💾 Saved processed data to: {output_file}")
    print(f"📊 Final shape: {processed_df.shape}")