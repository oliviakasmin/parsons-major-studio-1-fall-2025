# Visualization Data

This directory contains processed data files and analysis results for frontend visualizations of Revolutionary War pension application data.

## 📁 Files

### Data Files

- **`viz_categories.ipynb`** - Jupyter notebook containing the complete analysis pipeline
  - Category counting and analysis
  - Page count calculations
  - Statistical analysis of category relationships
  - Visualization generation

### JSON Output Files

- **`category_count_dict.json`** - Detailed category data; primary data for frontend viz

  - Count of applications per category
  - NAIDs for each category (pipe-separated strings)
  - Page counts for each category (pipe-separated strings)
  - Average page counts per category

- **`category_analysis_summary.json`** - High-level analysis and statistics; use tbd

  - Overview of single vs. multiple category applications
  - Category count distribution with percentages
  - Correlation analysis between categories and page counts
  - Top single categories and combinations
  - Statistical summaries

## 📊 Key Insights

### Category Distribution

- **95.7%** of applications have a single category
- **3.9%** have 2 categories
- **0.4%** have 3+ categories

### Most Common Categories

1. **Soldier** - 44.5% of applications
2. **Widow** - 30.9% of applications
3. **Rejected** - 13.7% of applications
4. **Bounty Land Warrant** - 3.9% of applications

### Category vs. Page Count Relationship

- **Very weak correlation** (0.019) between number of categories and page count
- Applications with multiple categories don't necessarily have more pages
- Average pages: 27.7 (1 category), 30.3 (2 categories), 24.7 (3 categories)

## 🔧 Data Format

### String Format

NAIDs and page counts are stored as pipe-separated strings for efficiency:

```json
"NAIDs": "12345||67890||11111",
"page_count": "5||3||7"
```

## 📝 Notes

- All percentages are calculated from the total number of pension application files (excluding non-application files)
- Statistical analysis excludes applications with zero categories
- Page counts are calculated from the number of pageObjectId entries per application
