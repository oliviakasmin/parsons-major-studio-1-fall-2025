state_mapping = {
    'connecticut': ['connecticut', 'ct', 'conn', 'conn.', 'state of connecticut', 'connecticut county', 'ct.', 'hartford'],
    'delaware': ['delaware', 'de', 'state of delaware', 'de.'],
    'georgia': ['georgia', 'ga', 'state of georgia', 'ga.'],
    'maryland': ['maryland', 'md', 'state of maryland', 'md.'],
    'massachusetts': ['massachusetts', 'ma', 'mass', 'mass.', 'state of massachusetts', 'dana, massachusetts', 'dighton, bristol, massachusetts', 'middleser', 'ma.'],
    'new hampshire': ['new hampshire', 'nh', 'n.h', 'n.h.', 'state of new hampshire', 'hillsborough in the state of n.h', 'new hampshire co', 'n.h', 'N. Hampshire', 'N. H.', 'NH', 'New-Hampshire'],
    'new jersey': ['new jersey', 'nj', 'n.j', 'n.j.', 'state of new jersey', 'n.j.', 'N Jersey', 'N J'],
    'new york': ['new york', 'ny', 'n.y', 'n.y.', 'state of new york', 'n york', 'rockland county ss', 'rockland county', 'hudson n york', 'new york co', 'n.y.', 'N. York', 'N. Y.'],
    'north carolina': ['north carolina', 'nc', 'n.c', 'n.c.', 'state of north carolina', 'randolph co. n. carolina', 'duplin co., north carolina', 'n.c.', 'N C'],
    'pennsylvania': ['pennsylvania', 'pa', 'pa.', 'state of pennsylvania', 'pa.', 'Penn'],
    'rhode island': ['rhode island', 'ri', 'r.i', 'r.i.', 'state of rhode island', 'r.i.', 'R Island'],
    'south carolina': ['south carolina', 'sc', 's.c', 's.c.', 'state of south carolina', 'spartanbg., south carolina', 's. carolina', 's.c.'],
    'virginia': ['virginia', 'va', 'v.a', 'v.a.', 'state of virginia', 'shenandoah in the state of virginia', 'washington county, virginia', 'va.'],
    'mississippi': ['mississippi', 'ms', 'state of mississippi', 'ms.'],
    'ohio': ['ohio', 'oh', 'state of ohio', 'oh.'],
    'kentucky': ['kentucky', 'ky', 'state of kentucky', 'ky.'],
    'illinois': ['illinois', 'il', 'state of illinois', 'il.'],
    'iowa': ['iowa', 'ia', 'state of iowa', 'ia.'],
    'indiana': ['indiana', 'in', 'state of indiana', 'indiana madison', 'in.'],
    'vermont': ['vermont', 'vt', 'state of vermont', 'windsor, vermont', 'vt.'],
    'tennessee': ['tennessee', 'tn', 'tn.', 'state of tennessee', ], 

    # Handle specific cases observed in unique values
    # 'squed susan county': ['virginia'], # Based on historical context and potential OCR errors
    # 'york': ['pennsylvania', 'new york'], # Ambiguous, keeping as is for now, might refine later.
    # 'state of tonopa'
}



# Create a reverse mapping from variations to standard state names
reverse_state_mapping = {}
for standard_state, variations in state_mapping.items():
    for variation in variations:
          # Prioritize standard state names if a variation could map to multiple (like 'york')
          if variation.lower() not in reverse_state_mapping:
                reverse_state_mapping[variation.lower()] = standard_state
          # else:
          #     print(f"Warning: Duplicate mapping for '{variation}'. Keeping first one found.")

print("State mapping dictionary created.")
# display(reverse_state_mapping)




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

    place_name_lower = place_name.lower()

    # Check for direct matches or known variations in the reverse mapping
    normalized_state = reverse_state_mapping.get(place_name_lower)

    # If found, return the standard state name
    if normalized_state is not None:
        return normalized_state
    else:
        # If no direct mapping, check if a standard state name is a substring
        for standard_state in state_mapping.keys():
            if standard_state in place_name_lower:
                return standard_state # Return the standard state name

        # If not found, return the original place name
        return place_name





# Apply the normalization function to the 'place' field
def apply_place_normalization(row):
    if row is not None and isinstance(row, dict):
        if 'place' in row:
            row['place'] = normalize_place(row['place'])
    return row

# df_sample_1000['extracted_pension_amount'] = df_sample_1000['extracted_pension_amount'].apply(apply_place_normalization)

# print("Place normalization applied to the 'extracted_pension_amount' column.")



# Extract 'place' values from the dictionaries, handling None values and missing keys
# place_values = df_sample_1000['extracted_pension_amount'].apply(
#     lambda x: x.get('place') if isinstance(x, dict) else None
# )

# Count the occurrences of each unique place value
# place_counts = place_values.value_counts(dropna=False)

# print("Counts of unique 'place' values after normalization:")
# Iterate and print all unique values and their counts
# for place, count in place_counts.items():
#     print(f"{place}: {count}")



# Apply the normalization function and extract the 'place' value for the new column
# df_sample_1000['normalized_pension_place'] = df_sample_1000['extracted_pension_amount'].apply(
#     lambda x: apply_place_normalization(x).get('place') if isinstance(x, dict) else None
# )

# Display the first few rows with the new column
# display(df_sample_1000[['priority_text', 'extracted_pension_amount', 'normalized_pension_place']].head())