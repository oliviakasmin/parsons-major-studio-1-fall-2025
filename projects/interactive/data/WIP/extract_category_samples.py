import json
import pandas as pd
import random

# Categories to sample from
categories = [
    'soldier',
    'rejected',
    'widow',
    'bounty land warrant',
    'old war',
    'N A Acc',
]

# Load category data with NAIDs
print("Loading category data...")
with open('../viz_data/category_count_dict.json', 'r', encoding='utf-8') as f:
    category_data = json.load(f)

# Load the parquet file with application details
print("Loading application data...")
df = pd.read_parquet('../../../quantitative/data/df_grouped_NAID_sorted_title_categories.parquet')

# Set random seed for reproducibility
random.seed(42)

# Dictionary to store samples
samples = {}

# Extract 10 samples from each category
print("\nExtracting samples from each category...")
for category in categories:
    if category not in category_data:
        print(f"Warning: Category '{category}' not found in data")
        continue
    
    # Get NAIDs for this category (pipe-separated string)
    naids_str = category_data[category].get('NAIDs', '')
    naids = [naid for naid in naids_str.split('||') if naid.strip()]
    
    # Sample 10 NAIDs (or all if less than 10)
    sample_size = min(10, len(naids))
    sampled_naids = random.sample(naids, sample_size)
    
    # Get application details for these NAIDs
    category_samples = []
    for naid in sampled_naids:
        app_data = df[df['NAID'] == naid]
        if not app_data.empty:
            row = app_data.iloc[0]
            category_samples.append({
                'NAID': naid,
                'title': row.get('title', ''),
                'file_cat': row.get('file_cat', ''),
                'file_type': row.get('file_type', ''),
                'naraURL': row.get('naraURL', '') if 'naraURL' in row else '',
                'pageURL': row.get('pageURL', '') if 'pageURL' in row else '',
            })
    
    samples[category] = category_samples
    print(f"  {category}: {len(category_samples)} samples")

# Find applications with multiple categories
print("\nFinding applications with multiple categories...")
multi_category_samples = []

# Filter for applications that have multiple categories in file_cat
df_multi = df[df['file_cat'].str.contains('||', na=False, regex=False)]

# Focus on combinations like "widow||bounty land warrant" or other combinations
print("  Looking for widow + bounty land warrant combinations...")
widow_blw = df_multi[df_multi['file_cat'].str.contains('widow', case=False, na=False) & 
                     df_multi['file_cat'].str.contains('bounty land warrant', case=False, na=False)]

if len(widow_blw) > 0:
    # Sample up to 5 examples
    sample_size = min(5, len(widow_blw))
    sampled = widow_blw.sample(n=sample_size, random_state=42)
    for _, row in sampled.iterrows():
        multi_category_samples.append({
            'NAID': row['NAID'],
            'title': row.get('title', ''),
            'file_cat': row.get('file_cat', ''),
            'file_type': row.get('file_type', ''),
            'categories': row.get('file_cat', '').split('||'),
            'naraURL': row.get('naraURL', '') if 'naraURL' in row else '',
            'pageURL': row.get('pageURL', '') if 'pageURL' in row else '',
        })
    print(f"  Found {len(multi_category_samples)} widow + bounty land warrant examples")

# Also find other multi-category combinations
print("  Looking for other multi-category combinations...")
other_multi = df_multi[~df_multi['file_cat'].str.contains('widow', case=False, na=False) | 
                       ~df_multi['file_cat'].str.contains('bounty land warrant', case=False, na=False)]

if len(other_multi) > 0:
    sample_size = min(5, len(other_multi))
    sampled = other_multi.sample(n=sample_size, random_state=42)
    for _, row in sampled.iterrows():
        multi_category_samples.append({
            'NAID': row['NAID'],
            'title': row.get('title', ''),
            'file_cat': row.get('file_cat', ''),
            'file_type': row.get('file_type', ''),
            'categories': row.get('file_cat', '').split('||'),
            'naraURL': row.get('naraURL', '') if 'naraURL' in row else '',
            'pageURL': row.get('pageURL', '') if 'pageURL' in row else '',
        })
    print(f"  Found {len(multi_category_samples) - len([s for s in multi_category_samples if 'widow' in s.get('file_cat', '').lower() and 'bounty' in s.get('file_cat', '').lower()])} other multi-category examples")

# Combine all samples
output = {
    'single_category_samples': samples,
    'multi_category_samples': multi_category_samples,
}

# Save to JSON
output_file = 'category_samples_10_per_category.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\n✓ Samples saved to {output_file}")
print(f"\nSummary:")
print(f"  Single category samples: {sum(len(v) for v in samples.values())} total")
print(f"  Multi-category samples: {len(multi_category_samples)}")

# Print a preview
print("\nPreview of samples:")
print("=" * 80)
for category, category_samples in samples.items():
    print(f"\n{category.upper()} ({len(category_samples)} samples):")
    for i, sample in enumerate(category_samples[:3], 1):  # Show first 3
        print(f"  {i}. NAID: {sample['NAID']}")
        print(f"     Title: {sample['title'][:100]}...")
        print(f"     Categories: {sample['file_cat']}")

if multi_category_samples:
    print(f"\nMULTI-CATEGORY SAMPLES ({len(multi_category_samples)} examples):")
    for i, sample in enumerate(multi_category_samples[:3], 1):  # Show first 3
        print(f"  {i}. NAID: {sample['NAID']}")
        print(f"     Title: {sample['title'][:100]}...")
        print(f"     Categories: {sample['file_cat']}")
        print(f"     Category list: {sample['categories']}")