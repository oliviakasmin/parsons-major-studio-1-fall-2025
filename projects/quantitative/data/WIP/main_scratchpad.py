import pandas as pd
import os

df = pd.read_parquet("hf://datasets/RevolutionCrossroads/nara_revolutionary_war_pension_files/nara_pension_file_pages.parquet")

# Save the dataframe locally as parquet to avoid re-downloading
df.to_parquet('nara_pension_file_pages.parquet', engine='pyarrow')
print(f"Dataframe saved locally with {len(df)} rows and {len(df.columns)} columns")
print(f"File size: {os.path.getsize('nara_pension_file_pages.parquet') / (1024*1024):.2f} MB")

# save as csv
df.to_csv('nara_pension_file_pages.csv', index=False)


# parquet better for working with pandas
# csv better for working with other tools - export final version as csv or json for frontend likely