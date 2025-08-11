# NoNinite - Chocolatey Package Scanner & AI Enrichment Tool

This powerful userscript is a companion tool for the **[NoNinite](https://github.com/SysAdminDoc/NoNinite)** project. Its sole purpose is to generate the comprehensive, intelligent `packages.json` database that powers the main NoNinite script, transforming it from a simple package list into a rich, filterable, and user-friendly software discovery platform.

This tool automates the tedious process of gathering, categorizing, and cross-referencing thousands of software packages, ensuring the data used by NoNinite is always up-to-date and incredibly detailed.

---

## Features

- **Full Catalog Scanning**: Scans the entire Chocolatey Community Repository to build a complete list of all available packages.
- **Smart Updates**: After an initial full scan, you can run quick "update checks" to find new packages and refresh version information without losing previously gathered data.
- **Advanced AI Data Enrichment**: Leverages the Google Gemini API to intelligently analyze and add a rich layer of metadata to each package, including:
    - **Detailed Categorization**: `mainCategory`, `subCategories`, and `packageType`.
    - **User Profile Analysis**: Identifies the `targetAudience` and `setupComplexity`.
    - **Package Manager Intelligence**: Recommends the best installer (`Winget` or `Chocolatey`) with a reason and provides both install commands.
    - **Technical Details**: Determines `licenseType` (e.g., FOSS, Freeware), `requiresAdmin` status, and `unattendedInstallConfidence`.
    - **Relationship Metadata**: Finds `alternativeTo` and `relatedPackages` to enhance software discovery.
- **Resumable Processing**: The AI enrichment process can be safely stopped and resumed at any time, making it practical to process over 10,000 packages without losing progress.
- **Persistent Storage**: Remembers your package list and API key between sessions.
- **Single-File JSON Export**: Outputs a single, clean `chocolatey_packages_complete.json` file, ready to be used in the NoNinite project.

---

## How to Use

### Step 1: Installation & Setup

1.  **Install Userscript Manager**: Make sure you have a userscript manager like **[Tampermonkey](https://www.tampermonkey.net/)** installed in your browser.
2.  **Install the Script**: Install the `Chocolatey Package Scanner & Exporter` userscript.
3.  **Get a Gemini API Key**: This tool requires a Google Gemini API key for the AI enrichment features. You can get one for free from **[Google AI Studio](https://aistudio.google.com/app/apikey)**.

### Step 2: Performing the Initial Scan

1.  Navigate to the **[Chocolatey Community Packages](https://community.chocolatey.org/packages)** page.
2.  A blue search icon will appear in the bottom-right corner. Click it to open the **Scanner & AI Control** panel.
3.  Click the **Full Rescan** button. This will erase any old data and begin scanning every page of the Chocolatey repository. This process can take several minutes.
4.  Once complete, the status will update with the total number of packages found. Your local package list is now created.

### Step 3: Running the AI Enrichment

This is the most time-consuming part, but it only needs to be done once for the bulk of the packages.

1.  In the control panel, paste your **Gemini API Key** into the input field. The key is saved automatically.
2.  Click the **Enrich Data** button.
3.  The script will now process all scanned packages in batches, sending them to the AI for analysis. The progress bar will show the status.
    - **Note**: This process can take over an hour for the full catalog due to API rate limits. The script will automatically pause and retry as needed.
4.  **You can safely close the tab or browser.** The next time you open the panel, a **Resume** button will appear, allowing you to pick up exactly where you left off.

### Step 4: Exporting the Final Data

1.  Once the AI enrichment is 100% complete, click the **Export All to JSON** button.
2.  This will download the `chocolatey_packages_complete.json` file.
3.  You can now use this file as the primary data source for the main NoNinite userscript.

### Step 5: Keeping the Data Fresh (Maintenance)

Every few weeks, you can update your list without redoing the entire process:

1.  Open the control panel.
2.  Click the **Check for Updates** button.
3.  The script will quickly scan the first page of Chocolatey, add any new packages, and update the version/download info for existing ones while preserving all the AI data you've already generated.
4.  If new packages were found, you can run the **Enrich Data** or **Resume** process again to categorize only the new additions.
5.  Export the updated JSON file.

---

## Example Data Structure

The final output for each package is a rich, structured object designed for easy processing:

```json
{
  "name": "PowerToys",
  "version": "0.85.0",
  "downloads": "1234567",
  "description": "...",
  "tags": "powertoys, microsoft, utilities, admin",
  "slug": "microsoft-powertoys",
  "oneLiner": "A set of utilities for power users to tune their Windows experience.",
  "officialWebsite": "[https://github.com/microsoft/PowerToys](https://github.com/microsoft/PowerToys)",
  "categorization": {
    "mainCategory": "Utilities",
    "subCategories": ["System Enhancement", "Productivity"],
    "packageType": "System Tool",
    "uiKeywords": ["modern", "fluent design"]
  },
  "userProfile": {
    "targetAudience": ["Power User", "Developer"],
    "setupComplexity": "Simple"
  },
  "packageManagers": {
    "preference": "Winget",
    "preferenceReason": "Official Microsoft repository ensures timely updates.",
    "chocolatey": {
      "id": "powertoys",
      "command": "choco install powertoys"
    },
    "winget": {
      "id": "Microsoft.PowerToys",
      "command": "winget install --id Microsoft.PowerToys"
    }
  },
  "technicalDetails": {
    "licenseType": "FOSS",
    "requiresAdmin": true,
    "unattendedInstallConfidence": "High"
  },
  "metadata": {
    "alternativeTo": ["AutoHotkey (for some features)"],
    "relatedPackages": ["Windows Terminal", "VS Code"],
    "updateFrequency": "Frequently"
  }
}
