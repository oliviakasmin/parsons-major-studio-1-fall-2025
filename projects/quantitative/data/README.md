# Revolutionary War Pension Applications Data Analysis

This project fetches and analyzes data for Revolutionary War Pension Applications from the National Archives.

## 📁 Project Structure

### Data Files

- **Parquet and CSV files** are not committed to the repository due to their large size
- These files can be regenerated from the original Hugging Face dataset

### Notebooks

#### Step 1: `1_fetch_and_group_original_data.ipynb`

- Fetches the original data from Hugging Face
- Saves the original data as a parquet file
- Drops unnecessary metadata columns for this project
- Groups data by NAID to collapse each file relating to a single application into one row
- Saves the formatted data as a parquet file

#### Step 2: `2_run_set_categories.ipynb`

- Loads the grouped data (by NAID) from the parquet file saved above in Step 1
- Categorizes each row based on its title into 2 new columns: `file_type` and `file_cat`
- `file_type`: most are pension applications, but there are a few other types of files including family records, affidavits, birth records, discharge certificates, etc.
- `file_cat`: applications are categorized into 6 known categories and the remaining are set to unknown, or non_application for the other file types

### Helper Files

#### `set_categories.py`

- Contains helper functions and category definitions based on the title column
- Defines the categorization logic for file types and application categories

## 🔄 Workflow

1. **Step 1 - Data Fetching & Grouping**: Download and clean the original dataset, then consolidate multiple file pages per application
2. **Step 2 - Categorization**: Apply file type and application category labels based on title analysis
3. **Analysis**: Ready for further analysis and visualization

## 📊 Data Categories

The project categorizes files into:

### File Types (`file_type` column) based on title analysis

- **revolutionary war pension and bounty land warrant application file** - Main pension application files
- **family record** - Family records and illustrated family records
- **microfilm target sheet** - Microfilm target sheets
- **other** - All other file types including discharge certificates, affidavits, etc.

### Application Categories (`file_cat` column) based on title analysis

- **soldier** - Survived soldiers (identified by 's', 'sur', 't')
- **rejected** - Rejected applications (identified by 'r', 'k', 'p', 'rej', 'rejected')
- **widow** - Widow applications (identified by 'w', 'wid')
- **bounty land warrant** - Bounty land warrant applications (identified by 'b', 'bl', 'wt', 'b l wt', 'bounty land', 'blwt')
- **old war** - Old war applications (identified by 'old act', 'old war', 'o w', 'ow')
- **nara archival administrative sheets** - NARA archival administrative sheets
- **unknown** - Applications with unclear or missing categorization, including files with N A Acc (National Archives Accession [number]) - usually appears when the pension file is not found and is a placeholder with a note such as "No pension file found for this veteran"
- **non_application** - Non-pension application file types
