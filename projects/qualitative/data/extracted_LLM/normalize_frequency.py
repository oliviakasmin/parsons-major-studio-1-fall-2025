# Extract 'pension_frequency' values from the dictionaries, handling None values and missing keys
pension_frequency_values = df_sample_1000['extracted_pension_amount'].apply(
    lambda x: x.get('pension_frequency') if isinstance(x, dict) else None
)

# Count the occurrences of each unique pension_frequency value
pension_frequency_counts = pension_frequency_values.value_counts(dropna=False)

print("Counts of unique 'pension_frequency' values:")
# Iterate and print all unique values and their counts
for frequency, count in pension_frequency_counts.items():
    print(f"{frequency}: {count}")




def normalize_pension_frequency(frequency):
    """
    Normalizes pension frequency values to standard terms.

    Args:
        frequency: The pension frequency string.

    Returns:
        The normalized frequency string (lowercase), or None if the input is invalid
        or cannot be normalized.
    """
    if frequency is None or not isinstance(frequency, str):
        return None

    frequency_lower = frequency.lower()

    # Define a mapping of variations to standard terms
    frequency_mapping = {
        'annual': ['per annum', 'per anum', 'annual', 'per an', 'per ann', 'per ann.', 'per anm', 'per annund', 'per Annum', 'per An.', 'per An', 'per year', 'per Lennum', 'per An:', 'per An.', 'per An.', 'per An:'],
        'monthly': ['per month', 'per mo', 'per months'],
        'semi-annual': ['semi-annual', 'semi-annually', 'semiannual', 'semi-anl.', 'semi-anl', 'semi annually'],
        # Add other mappings if needed based on review
    }

    # Check for matches in the mapping
    for standard_term, variations in frequency_mapping.items():
        if frequency_lower in variations:
            return standard_term

    # Handle cases that might be 'null' or other non-standard forms not in mapping
    if frequency_lower in ['null', 'none', '']:
        return None

    # If no mapping found, return the original value or None, depending on desired strictness
    # Returning the original value for now to see what's not normalized
    return frequency

def apply_frequency_normalization(row):
    if row is not None and isinstance(row, dict):
        if 'pension_frequency' in row:
            row['pension_frequency'] = normalize_pension_frequency(row['pension_frequency'])
    return row

df_sample_1000['extracted_pension_amount'] = df_sample_1000['extracted_pension_amount'].apply(apply_frequency_normalization)

print("Pension frequency normalization applied to the 'extracted_pension_amount' column.")




# Extract 'pension_frequency' values from the dictionaries, handling None values and missing keys
pension_frequency_values = df_sample_1000['extracted_pension_amount'].apply(
    lambda x: x.get('pension_frequency') if isinstance(x, dict) else None
)

# Count the occurrences of each unique pension_frequency value
pension_frequency_counts = pension_frequency_values.value_counts(dropna=False)

print("Counts of unique 'pension_frequency' values:")
# Iterate and print all unique values and their counts
for frequency, count in pension_frequency_counts.items():
    print(f"{frequency}: {count}")