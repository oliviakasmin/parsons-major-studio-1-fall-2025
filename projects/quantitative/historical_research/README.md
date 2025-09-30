# 📜 Revolutionary War Pension Acts JSON Timeline

## Overview

JSON generated with help from ChatGPT based on primary and secondary sources mentioned below.

data: `timeline.json`

This dataset is a structured JSON timeline of Revolutionary War pension and bounty-land legislation, widow eligibility expansions, and archival filing categories. Each entry includes:

- **date** – the act or archival marker date (or `"archival-category"` where no specific law applies)
- **historical_context** – concise background on the act or filing system
- **relevant_quotes** – direct excerpts from the primary sources, with page references
- **relevant_categories** – which filing categories ("Soldier," "Widow," "Rejected," "Bounty land warrant," "Old War," "N A Acc (National Archives Accession [number])") the act relates to
- **main_takeaway** – the historical significance of the act or category
- **category_applicability_note** – notes on how the archival filing system applied
- **highlight** – whether this is a major turning point (`true` / `false`)

---

## Sources Used

1. **National Archives Microfilm Publication M804 pamphlet**  
   _Revolutionary War Pension and Bounty-Land Warrant Application Files_ (Record Group 15).
   - Primary source for all **dates, acts, quotes, and page references**.
   - Basis for identifying survivor, widow, rejected, “Old War,” and bounty-land categories.

2. **National Park Service (NPS) article**  
   _[What Might You Find in the Revolutionary War Pension Files](https://www.nps.gov/articles/000/what-might-you-find-in-the-revolutionary-war-pension-files.htm)_.
   - Used to cross-check and refine key entries.
   - Confirmed the importance of the Four Acts (1818, 1820, 1828, 1832).
   - Added nuance: **1832 Act** included militia eligibility; **1836 Act** described widows as those married before the end of the Revolutionary War (1783).

---

## Key Highlights

- **1776–1780**: Earliest disability pensions and widow/orphan provisions
- **1792**: Federal continuation of invalid pensions
- **1818, 1820, 1828, 1832**: The **Four Acts** that defined Revolutionary War pensions
- **1836**: First broad general widow law
- **1855**: Major expansion of bounty-land eligibility

---

## ⚖️ Methodology Note for JSON

The JSON timeline was created directly from the **M804 pamphlet**, with **exact quoted text and page references** included for each entry. Only minor refinements were added from the **NPS article** to clarify scope (militia eligibility under 1832; widow definition under 1836). No other sources were used, and no information was inferred beyond these documents.
