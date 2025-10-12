# Smithsonian API Image Downloader

This Node.js script fetches image metadata from the Smithsonian Open Access API, filters and processes the results, and saves them to a local JSON file for later use (such as downloading images).

## How It Works

- **Environment Setup:**  
  - Requires Node.js and the `request` and `dotenv` packages (`npm install request dotenv`).
  - Store your Smithsonian API key in a `.env` file as `API_KEY="your_key"`.  
  - Make sure `.env` is in your `.gitignore`.

- **API Search:**  
  - The script builds a search query for portraits with images from the Freer Gallery (`unit_code:"FSG"`).
  - It paginates results if there are more than 1000 objects.

- **Filtering & Mapping:**  
  - Only objects with valid image URLs and date information are kept.
  - For each valid object, the script constructs a simplified object with `objectID`, `title`, `primaryImage` (with size parameter), and a safe filename.

- **Saving Results:**  
  - After a short timer (default 5 seconds), the script writes all results to `data.json`.
  - You can increase the timer if API calls take longer.

## Usage

1. Install dependencies:
   ```
   npm install request dotenv
   ```
2. Add your API key to `.env`:
   ```
   API_KEY="your_key"
   ```
3. Run the script:
   ```
   node your_script.js
   ```
4. After the timer, check `data.json` for your results.

## References

- Smithsonian API Docs: https://edan.si.edu/openaccess/apidocs/
- dotenv: https://www.npmjs.com/package/dotenv
- request: https://www.npmjs.com/package/request