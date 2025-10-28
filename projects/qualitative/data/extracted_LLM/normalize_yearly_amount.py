import pandas as pd

def normalize_yearly_amount(amount, frequency):
    """
    Calculate yearly amount based on payment amount and frequency
    """
    # Handle None, empty string, or invalid amounts
    if amount is None or amount == '' or pd.isna(amount):
        return None
    
    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return None
    
    if frequency == 'unknown':
        return None
    elif frequency == 'annual':
        return amount * 1
    elif frequency == 'semi-annual':
        return amount * 2
    elif frequency == 'monthly':
        return amount * 12
    else:  # unknown or other
        return None