# Fetch and analyze data for Revolutionary War Pension Appplications

### Code notes

parquet and csv files are not committed because they're very large and can be re-generated from the original hugging face dataset

###### file '1_fetch_and_group_original_data.ipynb'

this fetches the original data from hugging face

a parquet is saved with this original data

it drops some metadata columns that aren't necessary for this project
it also groups by NAID to collapse each file relating to a single application into 1 row

a parquet is saved with this formatted data

###### file '2_run_set_categories.ipynb'

this fetches the parquet with grouped data (by NAID)

it then categorizes the rows by file_type (either pension application or a few other file types)

it then categorizes applications into various categories as defined by the NARA project

helper functions and category definitions in file 'set_categories.py'
