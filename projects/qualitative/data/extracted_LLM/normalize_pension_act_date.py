import json
import pandas as pd

# Load the timeline data once
timeline_path = '/Users/oliviakasmin/Library/Mobile Documents/com~apple~CloudDocs/Documents/Data_Visualization_Parsons/Year_2/MajorStudio1/Code/parsons-major-studio-1-fall-2025/projects/quantitative/historical_research/timeline.json'

with open(timeline_path, 'r') as f:
    timeline = json.load(f)

# Build the known acts mapping once (outside the function for efficiency)
known_acts = {}
for event in timeline:
    if 'date' in event and event['date'] != 'archival-category':
        known_acts[event['date']] = {
            'context': event.get('historical_context', ''),
            'categories': event.get('relevant_categories', ''),
            'main_takeaway': event.get('main_takeaway', '')
        }


# Convert your pension_act_date to match timeline format (YYYY-MM-DD)
def convert_to_timeline_format(date_str):
    if pd.isna(date_str) or date_str is None or date_str == '':
        return None
    try:
        # Convert MM/DD/YYYY to YYYY-MM-DD
        return pd.to_datetime(date_str, format='%m/%d/%Y').strftime('%Y-%m-%d')
    except:
        return None


def get_known_act_date(date_str):
    """Convert date_str to timeline format and return the date if it's a known act"""
    if pd.isna(date_str) or date_str is None:
        return None
    
    # Convert to timeline format
    converted_date = convert_to_timeline_format(date_str)
    
    if converted_date is None:
        return None
    
    # Check if date exists in known acts
    if converted_date in known_acts:
        return converted_date
    
    return None