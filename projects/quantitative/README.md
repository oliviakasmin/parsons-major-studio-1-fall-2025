## Widows of the Revolutionary War

Dataset: https://huggingface.co/datasets/RevolutionCrossroads/nara_revolutionary_war_pension_files

The Revolutionary War Pension Files dataset contains applications from widows of soldiers who fought, and this visualization aims to put a spotlight on this group of women. What percent of applicants each year were widows? Are there any patterns that emerge over time? What were their names and life situations? All files with titles containing "File W." refer to widows. The primary visualization type will be a timeseries with a stacked bar portion to denote the ratio of widow applications to all applications.

Relevant fields:

```
title
pageUrl
ocrText
[transcriptionText]
```

Sketch:

![widows_timeline](https://github.com/user-attachments/assets/96e1d977-4062-4a56-9280-ab20b744971f)




## Proof of Service for Revolutionary War Pension Applications

Dataset: https://huggingface.co/datasets/RevolutionCrossroads/nara_revolutionary_war_pension_files

Some files in the The Revolutionary War Pension Files dataset include portions of applications that appear to have spanned numerous correspondances. The title field includes an application reference number, and with this information we can piece together a full story and timeline of how each application played out. How long did it take for applications to be approved (or rejected)? How many correspondances did it take to get a final answer? The category denoted by the File letters in the title field will likely provide additional narrative context that can be included (ie "R" means the application/file was rejected). The primary visualization type will be a timeseries where each application shows the entire span of the correspondances and the date of each individual file.

Relevant fields:

```
title
pageUrl
ocrText
[transcriptionText]
```

Sketch:

![pension_timelines](https://github.com/user-attachments/assets/fe6fcb3b-3ebf-4c82-9a1a-b0bb5ac1d2d0)




## William Bache - Silhouettes 1803-1810

Dataset: https://huggingface.co/datasets/RevolutionCrossroads/si_us_revolutionary_era_collections

The Smithsonian collection includes silhouettes done by the artist William Bache, many of whom are of unidentified sitters, and some are named. This visualization allows for an exploration of the many sitters he portrayed, with a focus on a deeper look at the unidentified sitters who are more likely to be "normal" people (albeit still wealthy enough to pay for their likeness) as opposed to the famous people of that time. Some further themes to explore include gender, costume, and hats. This will primarily be an exploratory visualization to spotlight invididual and groupings of silhouettes, with some secondary visualizations (ie stacked bar) that denotes to the ratios of the groups selected.

Relevant fields:

```
objectType: {"Type": "Silhouette"}
indexed_names: ["Bache, William"]
indexed_object_types: ["Silhouettes"]
title
indexed_topics
mediaUrls
```

Example:

![NPG-S_NPG_2002_184_943](https://github.com/user-attachments/assets/12a35e55-8893-4943-a662-a88b4f95cb90)
https://ids.si.edu/ids/deliveryService?id=NPG-S_NPG_2002_184_943

Artist biography: https://npg.si.edu/bache/biography

Sketch:

![william_bache_silhouettes](https://github.com/user-attachments/assets/5c7e1fcb-7a5a-4635-aaed-c57b33880f2f)

