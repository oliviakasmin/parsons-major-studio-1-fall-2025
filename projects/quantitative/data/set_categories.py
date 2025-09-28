# functions designed for df_grouped_NAID_sorted_title.parquet


# file type groupings - column 'file_type'
application_prefix = 'revolutionary war pension and bounty land warrant application file' 
family_record = 'family record' 
microfilm_target_sheet = 'microfilm target sheet'
other = 'other'

# application categories - column 'file_cat'
category_dict = {
    "soldier": ['s', 'sur', 't'], # soldier (survived)
    'rejected': ['r', 'k', 'p', 'rej', 'rejected'], # rejected
    "widow": ['w', 'wid'], # widow
    "bounty land warrant": ['b', 'bl', 'wt', 'b l wt', 'bounty land', 'blwt'], # bounty land warrant
    "old war": ['old act', 'old war', 'o w', 'ow'], # old war
    "N A Acc": ["n a acc no", "acc no"], # National Archives Accession [number]
    "nara archival administrative sheets": ["nara archival administrative sheets"], # not one of the important categories, but a common file type
}

# application categories - if no other category is found and one of these is found, set 'file_cat' to unknown
unknown_group = ["blank", "illegible", "ctf"]  # (ctf = certificate)

def run_categories(df):
    df = set_categories(df)
    df = set_application_categories(df)
    return df


def set_categories(df):
    # quick clean to help groupings
    df['title_prefix'] = df['title'].str.replace('-', ' ')

    # Set file_type based on matches (check specific ones first)
    df['file_type'] = ''
    
    # Check specific categories first (most specific to least specific)
    # Only set if they don't already have a category
    df.loc[(df['file_type'] == '') & df['title_prefix'].str.contains(family_record, case=False, na=False), 'file_type'] = family_record
    df.loc[(df['file_type'] == '') & df['title_prefix'].str.contains(microfilm_target_sheet, case=False, na=False), 'file_type'] = microfilm_target_sheet
    df.loc[(df['file_type'] == '') & df['title_prefix'].str.contains(application_prefix, case=False, na=False), 'file_type'] = application_prefix
    
    # Set any remaining blank file_type columns to "other"
    df.loc[df['file_type'] == '', 'file_type'] = other
    
    return df

# adds a new column 'title_modified' to the dataframe
def clean_title(df):
    # remove application_prefix from title and other small clean
    df['title_modified'] = (df['title']
        .str.replace('-', ' ')
        .str.lower()
        .str.replace(application_prefix + 's', application_prefix, case=False, regex=False)
        .str.replace(application_prefix, '', regex=True)
    )
    
    # Remove common words
    words = ["for", "file", "see"]
    for word in words:
        df['title_modified'] = df['title_modified'].str.replace(word, '', regex=False)
    
    # Simplify punctuation
    punctuation = [',', '.', '!', '?', ':', ';', '-', '_', '(', ')', '[', ']', '{', '}', '\'', '\"', '/', '\\', '|', '`', '~', '=', '+', '*', '#', '@', '%', '$', '^', '&']
    for punct in punctuation:
        df['title_modified'] = df['title_modified'].str.replace(punct, ' ', regex=False)
    
    # Replace multiple consecutive spaces with a single space
    df['title_modified'] = df['title_modified'].str.replace(' +', ' ', regex=True)
    
    return df


# set category for application files and otherwist set to non_application
def set_application_categories(df):
    df = clean_title(df)

    df['file_cat'] = ''

    # if file_type is not application_prefix, set file_cat to non_application
    if (df['file_type'] != application_prefix).any():
        df.loc[df['file_type'] != application_prefix, 'file_cat'] = 'non_application'

    # we only want to apply the category dictionary to application files
    mask_non_app = df['file_cat'] != 'non_application'

    # Handle "nara archival administrative sheets" separately first since it doesn't follow the space pattern
    nara_admin_pattern = category_dict['nara archival administrative sheets'][0]
    mask_nara_admin = df['title_modified'].str.contains(nara_admin_pattern, case=False, na=False)
    df.loc[mask_nara_admin & mask_non_app, 'file_cat'] = 'nara archival administrative sheets'

    # Multiple category method - append categories (allowing duplicates during iteration)
    for key, values in category_dict.items():
        for value in values:
            if value:
                pattern = f' {value} '
                mask = df['title_modified'].str.contains(pattern, na=False) 
                # Append category to existing file_cat (allowing duplicates) as long as file_cat is not non_application
                df.loc[mask & mask_non_app, 'file_cat'] = df.loc[mask & mask_non_app, 'file_cat'] + f'{key}||'

    # Clean up trailing separators, remove duplicates, and sort alphabetically
    df['file_cat'] = df['file_cat'].str.rstrip('||').apply(
        lambda x: '||'.join(sorted(list(set(x.split('||'))))) if x else x
    )

    mask_empty = df['file_cat'] == ''

    # If df['file_cat'] is empty and contains one of the defined unknown values, set to unknown
    for value in unknown_group:
        value_mask = df['title_modified'].str.contains(value, case=False, na=False, regex=False)
        df.loc[mask_empty & value_mask & mask_non_app, 'file_cat'] = 'unknown'   

    # and if file_cat is still empty (the rest appear to be names and empty), then also set to unknown
    df.loc[mask_empty & mask_non_app, 'file_cat'] = 'unknown'

    # drop title_modified column
    df = df.drop(columns=['title_modified'])

    return df