# TODO put together a dictionary of accepted abbreviations for each state so if the place includes the abbreviation then it will be accepted

state_mapping = {
    'connecticut': ['connecticut', 'ct', 'conn', 'conn.', 'state of connecticut', 'connecticut county', 'ct.', 'hartford'],
    'delaware': ['delaware', 'de', 'state of delaware', 'de.'],
    'georgia': ['georgia', 'ga', 'state of georgia', 'ga.'],
    'maryland': ['maryland', 'md', 'state of maryland', 'md.'],
    'massachusetts': ['massachusetts', 'ma', 'mass', 'mass.', 'massachusette', 'massachusets', 'massachuset', 'state of massachusetts', 'dana, massachusetts', 'dighton, bristol, massachusetts', 'middleser', 'ma.', 'boston'],
    'new hampshire': ['new hampshire', 'nh', 'n.h', 'n.h.', 'state of new hampshire', 'hillsborough in the state of n.h', 'new hampshire co', 'n. hampshire', 'n. h.', 'nh', 'new-hampshire', 'n h', 'n.h.'],
    'new jersey': ['new jersey', 'nj', 'n.j', 'n.j.', 'state of new jersey', 'n jersey', 'n j', 'n.j.'],
    'new york': ['new york', 'ny', 'n.y', 'n.y.', 'state of new york', 'n york', 'n. york', 'rockland county ss', 'rockland county', 'hudson n york', 'new york co', 'n. y.', 'rochester n.y.', 'chenango', 'york', 'York Albany', 'albany'],
    'north carolina': ['north carolina', 'nc', 'n.c', 'n.c.', 'state of north carolina', 'randolph co. n. carolina', 'duplin co., north carolina', 'n c'],
    'pennsylvania': ['pennsylvania', 'pa', 'pa.', 'state of pennsylvania', 'penn', 'penna', 'philadelphia'],
    'rhode island': ['rhode island', 'ri', 'r.i', 'r.i.', 'state of rhode island', 'r island'],
    'south carolina': ['south carolina', 'sc', 's.c', 's.c.', 'state of south carolina', 'spartanbg., south carolina', 's. carolina'],
    'virginia': ['virginia', 'va', 'v.a', 'v.a.', 'state of virginia', 'shenandoah in the state of virginia', 'washington county, virginia', 'va.', 'richmond va', 'jefferson co. va', 'jefferson county, va'],
    'mississippi': ['mississippi', 'ms', 'state of mississippi', 'ms.'],
    'ohio': ['ohio', 'oh', 'state of ohio', 'oh.', 'clermont county, washington township'],
    'kentucky': ['kentucky', 'ky', 'state of kentucky', 'ky.'],
    'illinois': ['illinois', 'il', 'state of illinois', 'il.'],
    'iowa': ['iowa', 'ia', 'state of iowa', 'ia.'],
    'indiana': ['indiana', 'in', 'state of indiana', 'indiana madison', 'in.', 'ind.', 'ind'],
    'vermont': ['vermont', 'vt', 'state of vermont', 'windsor, vermont', 'vt.'],
    'tennessee': ['tennessee', 'tn', 'tn.', 'state of tennessee'], 
    'maine': ['maine', 'me', 'state of maine', 'me.', 'mame'],
    'alabama': ['alabama', 'al', 'state of alabama', 'al.'],
    'michigan': ['michigan', 'mi', 'state of michigan', 'mi.'],
    'missouri': ['missouri', 'mo', 'state of missouri', 'mo.'],
    'washington d.c.': ['washington d.c.', 'washington dc', 'washington d.c', 'washington dc.', 'washington d.c.', 'Washington City ', 'Washington County D.C. '],
}

# Create a reverse mapping from variations to standard state names (ONCE, globally)
reverse_state_mapping = {}
for standard_state, variations in state_mapping.items():
    for variation in variations:
        if variation.lower() not in reverse_state_mapping:
            reverse_state_mapping[variation.lower()] = standard_state

def normalize_place(place_name):
    """
    Normalizes a historical place name to a standard U.S. state name.

    Args:
        place_name: The historical place name string.

    Returns:
        The normalized state name (lowercase), or the original place_name
        if no mapping is found, or None if the input is invalid.
    """
    if place_name is None or not isinstance(place_name, str):
        return None

    place_name_lower = place_name.lower().strip()
    
    # First, try to extract state abbreviation from patterns like "City Va", "County, Va", "Co. Va", "Rochester N.Y.", etc.
    import re
    
    # Pattern to match state abbreviations anywhere in the string:
    state_abbrev_patterns = [
        r'\b([a-z])\.([a-z])\.?\s*$',   # Match "n.y." or "n.y" at end → extract n and y
        r'\b([a-z])\.([a-z])\s*$',      # Match "n.y " with space at end
        r'\b([a-z])\s+([a-z])\s*$',     # Match "n h" (space between, no periods) → extract nh
        r'\b([a-z]{2})\.?\s*$',         # Match "va" or "va." at end → extract va
        r'\bind\.?\s*$',                 # Match "ind." or "ind" at end
    ]
    
    for pattern in state_abbrev_patterns:
        match = re.search(pattern, place_name_lower)
        if match:
            # Reconstruct the abbreviation
            try:
                if len(match.groups()) == 2:
                    # Pattern like "n.y." matches two groups: 'n' and 'y'
                    abbrev = ''.join(match.groups())
                else:
                    # Pattern like "va." matches one group
                    abbrev = match.group(1)
                
                if abbrev and abbrev in reverse_state_mapping:
                    return reverse_state_mapping[abbrev]
            except (IndexError, AttributeError):
                # Skip this pattern if there's an issue
                continue

    # Check for "State of ..." patterns
    state_of_pattern = r'state of\s+(.+)$'
    state_of_match = re.search(state_of_pattern, place_name_lower)
    if state_of_match:
        state_part = state_of_match.group(1).strip()
        # Check if the extracted state part matches a known variation
        if state_part in reverse_state_mapping:
            return reverse_state_mapping[state_part]

    # Check for common state endings
    if place_name_lower.endswith('york') or 'n york' in place_name_lower or 'n. york' in place_name_lower:
        return 'new york'
    
    if place_name_lower.endswith('carolina') or 'n carolina' in place_name_lower or 'n. carolina' in place_name_lower:
        return 'north carolina'
    
    if place_name_lower.endswith('hampshire') or 'n h' in place_name_lower or 'n. h.' in place_name_lower:
        return 'new hampshire'

    # Check for district phrases like "in the district of Maine" or "of Maine"
    district_pattern = r'(?:in the )?district of ([a-z\s\']+)|of ([a-z\s\']+)\.?\s*$'
    district_match = re.search(district_pattern, place_name_lower)
    if district_match:
        district_state = (district_match.group(1) or district_match.group(2)).strip()
        if district_state in reverse_state_mapping:
            return reverse_state_mapping[district_state]

    # Try to find state by checking for close matches (for misspellings)
    from difflib import SequenceMatcher
    
    for standard_state in state_mapping.keys():
        # Check for substring match
        if standard_state in place_name_lower:
            return standard_state
        
        # Check for fuzzy match (similarity > 0.8) for potential misspellings
        similarity = SequenceMatcher(None, standard_state, place_name_lower).ratio()
        if similarity > 0.8:
            return standard_state

    # Check for direct matches or known variations in the reverse mapping
    normalized_state = reverse_state_mapping.get(place_name_lower)

    # If found, return the standard state name
    if normalized_state is not None:
        return normalized_state

    # If not found, return the original place name
    return place_name

def get_non_standard_places(df):
    # Get the standard state names (keys of state_mapping)
    standard_states = set(state_mapping.keys())

    # Get value counts
    value_counts = df['normalized_place'].value_counts(dropna=False)

    # Filter to show only values that aren't standard states
    non_standard = value_counts[~value_counts.index.isin(standard_states) | value_counts.index.isna()]

    print("Non-standard normalized place values (not in state_mapping):")
    return non_standard