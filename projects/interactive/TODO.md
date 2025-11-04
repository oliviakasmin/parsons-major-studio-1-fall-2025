Tracking work for interactive section and updates to quantitative and qualitative portions

Larger changes
[]

Details
[] make svgs responsive sizes (ex. window.innerWidth)

Data
[] get 10,000 rows for LLM extracted amount

_IDEA for interactive section_
[] host data on huggingface

- start with whole dataset as is
- add column for application category (regex from title)
- add column for LLM extracted amount data (original object and then probably also 3 additonal columns for normalized amount, place and act date)
  [] create node.js backend that pulls live required data from huggingface rather than entire dataset (ie just get rows with LLM extracted data)
  [] create "API" calls to update fields on huggingface (ie. human_reviewed_amount, human_reviewed_place, human_reviewed_act)  
  [] add edit section extracted amount for users to correct what's there

Additional section - rejected
[] create model to analyze rejected files and come up with the reason why the application was rejected
[] update huggingface data to add new column
[] FE for showing this
[]

_Another idea_
[] host google colab model on hugging face? then allow people to run it from the FE

question for Thiago: on the FE I want users to be able to randomly choose a new file to analyze and let them run the LLM (basically adding more rows with the generated extraction), and then correct if it's wrong. How can I host the prompt to integrate this?

option 1: add feedback functionality to what currently have to "give feedback" - pro: probably valuable to the smithsonian team, con: basically SE not DV
option 2: develop a new model for the rejected applications
