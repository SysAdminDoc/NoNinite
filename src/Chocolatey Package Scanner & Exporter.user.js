// ==UserScript==
// @name         Chocolatey Package Scanner & Exporter
// @namespace    http://tampermonkey.net/
// @version      2025-08-15
// @description  Scans Chocolatey packages, enriches data with a resumable AI process, supports smart updates, and provides a single-file export.
// @author       Matthew Parker
// @match        https://community.chocolatey.org/packages*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      community.chocolatey.org
// @connect      generativelanguage.googleapis.com
// @require      https://kit.fontawesome.com/a076d05399.js
// ==/UserScript==

(function() {
    'use strict';

    // --- STYLES ---
    GM_addStyle(`
        :root {
            --panel-bg-dark: #2c3e50; --panel-bg-light: #ecf0f1;
            --text-dark: #ecf0f1; --text-light: #2c3e50;
            --accent-color: #3498db; --accent-hover: #2980b9;
            --success-color: #2ecc71; --success-hover: #27ae60;
            --danger-color: #e74c3c; --danger-hover: #c0392b;
            --warning-color: #f39c12; --warning-hover: #f1c40f;
            --secondary-color: #95a5a6; --secondary-hover: #7f8c8d;
            --info-color: #3498db; --info-hover: #2980b9;
            --border-color-dark: #4a627a; --border-color-light: #bdc3c7;
        }
        .scanner-panel { position: fixed; bottom: 20px; right: 20px; z-index: 9999; }
        .scanner-btn {
            background-color: var(--accent-color); color: white; border: none; border-radius: 50%;
            width: 60px; height: 60px; font-size: 24px; cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s;
            display: flex; align-items: center; justify-content: center;
        }
        .scanner-btn:hover { background-color: var(--accent-hover); transform: scale(1.1); }
        .scanner-modal {
            display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%;
            overflow: auto; background-color: rgba(0,0,0,0.6); animation: fadeIn 0.5s;
        }
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
        .scanner-modal-content {
            position: relative; margin: 5% auto; padding: 25px; width: 95%; max-width: 750px;
            border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); animation: slideIn 0.5s;
        }
        @keyframes slideIn { from {transform: translateY(-50px); opacity: 0;} to {transform: translateY(0); opacity: 1;} }
        .dark-theme { background-color: var(--panel-bg-dark); color: var(--text-dark); border: 1px solid var(--border-color-dark); }
        .light-theme { background-color: var(--panel-bg-light); color: var(--text-light); border: 1px solid var(--border-color-light); }
        .scanner-modal-header {
            display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color-dark);
        }
        .light-theme .scanner-modal-header { border-bottom-color: var(--border-color-light); }
        .scanner-modal-header h2 { margin: 0; font-weight: 300; }
        .scanner-modal-header h2 i { margin-right: 10px; }
        .header-controls { display: flex; align-items: center; gap: 20px; }
        .close-btn { font-size: 32px; font-weight: bold; cursor: pointer; line-height: 1; transition: color 0.2s; }
        .close-btn:hover { color: var(--danger-color); }
        .theme-switch { cursor: pointer; font-size: 20px; }
        .scanner-modal-body { padding-top: 20px; }
        .action-btn {
            padding: 12px 22px; margin: 5px; border: none; border-radius: 8px; cursor: pointer;
            font-size: 16px; font-weight: 500; transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .action-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .action-btn i { margin-right: 8px; }
        .action-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .scan-btn { background: linear-gradient(145deg, var(--danger-color), var(--danger-hover)); color: white; }
        .update-btn { background: linear-gradient(145deg, var(--accent-color), var(--accent-hover)); color: white; }
        .ai-btn { background: linear-gradient(145deg, var(--warning-color), var(--warning-hover)); color: #2c3e50; }
        .resume-btn { background: linear-gradient(145deg, var(--info-color), var(--info-hover)); color: white; }
        .export-btn { background: linear-gradient(145deg, var(--success-color), var(--success-hover)); color: white; }
        .control-group { margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid var(--border-color-dark); }
        .light-theme .control-group { border-color: var(--border-color-light); }
        .control-group h3 { margin-top: 0; }
        #scan-results, #ai-results { margin-top: 15px; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.1); font-style: italic; }
        .light-theme #scan-results, .light-theme #ai-results { background-color: rgba(255,255,255,0.5); }
        .progress-bar-container { width: 100%; background-color: #555; border-radius: 5px; overflow: hidden; height: 10px; margin-top: 10px; display: none; }
        .progress-bar { width: 0%; height: 100%; background-color: var(--warning-color); transition: width 0.3s ease; }
        .input-field {
            padding: 8px 12px; border-radius: 5px; border: 1px solid var(--border-color-dark);
            background-color: rgba(0,0,0,0.2); color: var(--text-dark);
        }
        .light-theme .input-field {
            border-color: var(--border-color-light); background-color: white; color: var(--text-light);
        }
    `);

    // --- HTML ELEMENTS ---
    const scannerPanel = document.createElement('div');
    scannerPanel.className = 'scanner-panel';
    scannerPanel.innerHTML = '<button class="scanner-btn" title="Open Package Scanner"><i class="fas fa-search-plus"></i></button>';
    document.body.appendChild(scannerPanel);

    const modal = document.createElement('div');
    modal.className = 'scanner-modal';
    modal.innerHTML = `
        <div class="scanner-modal-content dark-theme">
            <div class="scanner-modal-header">
                <h2><i class="fas fa-cogs"></i> Scanner & AI Control</h2>
                <div class="header-controls">
                    <span class="theme-switch" title="Toggle Light/Dark Mode"><i class="fas fa-sun"></i></span>
                    <span class="close-btn" title="Close">&times;</span>
                </div>
            </div>
            <div class="scanner-modal-body">
                <div class="control-group">
                    <h3>1. Scan Packages</h3>
                    <p>Update your local package list or perform a full rescan.</p>
                    <button class="action-btn update-btn" disabled><i class="fas fa-sync-alt"></i> Check for Updates</button>
                    <button class="action-btn scan-btn"><i class="fas fa-trash-alt"></i> Full Rescan</button>
                    <div id="scan-results">Ready to scan.</div>
                </div>

                <div class="control-group">
                    <h3>2. AI Data Enrichment</h3>
                     <p>Adds categories and attempts to find Winget IDs. Requires a Gemini API Key. Process is resumable.</p>
                     <label>Gemini API Key: <input type="password" id="api-key-input" class="input-field" style="width: 300px;"></label>
                    <br>
                    <button class="action-btn ai-btn" disabled><i class="fas fa-magic"></i> Categorize</button>
                    <button class="action-btn resume-btn" style="display: none;"><i class="fas fa-play-circle"></i> Resume</button>
                    <div id="ai-results">Waiting for scan to complete.</div>
                    <div class="progress-bar-container"><div class="progress-bar"></div></div>
                </div>

                <div class="control-group">
                    <h3>3. Export Data</h3>
                    <p>Export the entire collection of processed data to a single JSON file.</p>
                    <button class="action-btn export-btn" disabled><i class="fas fa-file-export"></i> Export All to JSON</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // --- VARIABLES & STATE ---
    let packageData = [];
    let isCategorizing = false;
    const scannerBtn = document.querySelector('.scanner-btn');
    const modalContent = document.querySelector('.scanner-modal-content');
    const closeBtn = document.querySelector('.close-btn');
    const themeSwitch = document.querySelector('.theme-switch');
    const scanBtn = document.querySelector('.scan-btn');
    const updateBtn = document.querySelector('.update-btn');
    const scanResults = document.getElementById('scan-results');
    const aiBtn = document.querySelector('.ai-btn');
    const resumeBtn = document.querySelector('.resume-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const aiResults = document.getElementById('ai-results');
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const progressBar = document.querySelector('.progress-bar');
    const exportBtn = document.querySelector('.export-btn');

    // --- PERSISTENT STORAGE ---
    function loadState() {
        packageData = GM_getValue('packageData', []);
        apiKeyInput.value = GM_getValue('apiKey', '');
        updateUIState();
    }

    function saveState() {
        GM_setValue('packageData', packageData);
        GM_setValue('apiKey', apiKeyInput.value);
    }

    function updateUIState() {
        const unprocessedCount = packageData.filter(p => !p.mainCategory).length;
        const processedCount = packageData.length - unprocessedCount;

        if (packageData.length > 0) {
            scanResults.textContent = `Loaded ${packageData.length} packages from previous session.`;
            aiBtn.disabled = false;
            exportBtn.disabled = false;
            updateBtn.disabled = false;
            if (unprocessedCount > 0 && processedCount > 0) {
                resumeBtn.style.display = 'inline-block';
                aiBtn.style.display = 'none';
                aiResults.textContent = `${processedCount} packages already categorized. Resume to process the remaining ${unprocessedCount}.`;
            } else {
                resumeBtn.style.display = 'none';
                aiBtn.style.display = 'inline-block';
                aiResults.textContent = unprocessedCount === 0 ? 'All packages are already categorized.' : 'Ready to categorize.';
            }
        } else {
            scanResults.textContent = 'Ready to perform a full scan.';
            aiResults.textContent = 'Waiting for scan to complete.';
            aiBtn.disabled = true;
            exportBtn.disabled = true;
            updateBtn.disabled = true;
            resumeBtn.style.display = 'none';
        }
    }


    // --- CORE FUNCTIONS ---

    function fetchPage(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: (response) => response.status >= 200 && response.status < 300 ? resolve(new DOMParser().parseFromString(response.responseText, "text/html")) : reject(new Error(`Failed to fetch page: ${response.statusText}`)),
                onerror: (error) => reject(new Error(`Request failed: ${error}`))
            });
        });
    }

    function extractDataFromDoc(doc) {
        const data = [];
        doc.querySelectorAll('.package-list-view > li').forEach(pkg => {
            const nameElement = pkg.querySelector('h5 a');
            if (!nameElement) return;

            const nameText = nameElement.innerText.trim();
            const versionElement = pkg.querySelector('h5 a span');
            const version = versionElement ? versionElement.innerText.trim() : 'N/A';
            const badges = Array.from(pkg.querySelectorAll('.badge')).map(b => b.innerText.toLowerCase());

            data.push({
                name: nameText.replace(version, '').trim(),
                version,
                downloads: (pkg.querySelector('.badge.rounded-pill.border')?.innerText.replace(/\D/g, '') || '0'),
                description: (pkg.querySelector('p.package-list-align')?.innerText.replace(/Keep Reading$/, '').trim() || 'N/A'),
                installCommand: (pkg.querySelector('input[type="text"]')?.value || 'N/A'),
                iconUrl: (pkg.querySelector('.package-icon img')?.src || 'N/A'),
                tags: Array.from(pkg.querySelectorAll('.package-tag')).map(tag => tag.innerText.trim()).join(', '),
                isPrerelease: badges.some(b => b.includes('prerelease')),
                isDeprecated: badges.some(b => b.includes('deprecated')),
                isUnofficial: badges.some(b => b.includes('unofficial')),
            });
        });
        return data;
    }

    async function fullRescan() {
        if (!confirm("Starting a full rescan will erase all previously scanned and categorized data. This is recommended only if you suspect major changes or issues. Continue?")) {
            return;
        }
        packageData = []; // Clear previous data
        saveState(); // Persist the cleared data

        scanBtn.disabled = true;
        updateBtn.disabled = true;
        aiBtn.disabled = true;
        exportBtn.disabled = true;
        scanResults.textContent = 'Starting full rescan...';

        let currentPage = 1;
        let hasNextPage = true;
        const baseUrl = new URL(window.location.href);

        while (hasNextPage) {
            scanResults.textContent = `Scanning page ${currentPage}... Found ${packageData.length} packages.`;
            baseUrl.searchParams.set('page', currentPage);
            try {
                const doc = await fetchPage(baseUrl.href);
                const newData = extractDataFromDoc(doc);
                packageData.push(...newData);
                hasNextPage = newData.length > 0 && !!doc.querySelector('a.page-link i.fa-forward');
                if (hasNextPage) currentPage++;
            } catch (error) {
                scanResults.textContent = `Error on page ${currentPage}: ${error.message}. Stopping scan.`;
                hasNextPage = false;
            }
        }

        saveState();
        scanBtn.disabled = false;
        updateBtn.disabled = false;
        updateUIState();
    }

    async function checkForUpdates() {
        scanBtn.disabled = true;
        updateBtn.disabled = true;
        scanResults.textContent = 'Checking for updates on page 1...';

        try {
            const baseUrl = new URL(window.location.href);
            baseUrl.searchParams.set('page', 1);
            const doc = await fetchPage(baseUrl.href);
            const firstPagePackages = extractDataFromDoc(doc);

            let newCount = 0;
            let updatedCount = 0;

            firstPagePackages.forEach(newPage => {
                const existingIndex = packageData.findIndex(oldPage => oldPage.name === newPage.name);
                if (existingIndex !== -1) {
                    // Package exists, check for updates
                    const oldPage = packageData[existingIndex];
                    if (oldPage.version !== newPage.version || oldPage.downloads !== newPage.downloads) {
                        // Preserve AI data
                        const aiData = { mainCategory: oldPage.mainCategory, subCategories: oldPage.subCategories, wingetId: oldPage.wingetId };
                        packageData[existingIndex] = { ...newPage, ...aiData };
                        updatedCount++;
                    }
                } else {
                    // New package
                    packageData.unshift(newPage); // Add to the beginning of the list
                    newCount++;
                }
            });

            scanResults.textContent = `Update check complete. Found ${newCount} new packages and updated ${updatedCount} existing packages.`;
            saveState();
        } catch (error) {
            scanResults.textContent = `Error checking for updates: ${error.message}`;
        }

        scanBtn.disabled = false;
        updateBtn.disabled = false;
        updateUIState();
    }

    // --- AI ENRICHMENT FUNCTIONS ---

    function callGeminiAPI(apiKey, prompt) {
        return new Promise((resolve, reject) => {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "mainCategory": { "type": "STRING", "description": "A single, broad category like 'Developer Tools', 'Utilities', 'Browsers', 'Media', 'Security'." },
                            "subCategories": { "type": "ARRAY", "items": { "type": "STRING" }, "description": "An array of more specific sub-categories." },
                            "wingetId": { "type": "STRING", "description": "The most likely Winget ID for the package. Return 'N/A' if unsure." }
                        },
                        required: ["mainCategory", "subCategories", "wingetId"]
                    }
                }
            };

            GM_xmlhttpRequest({
                method: 'POST',
                url: API_URL,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
                responseType: 'json',
                onload: function(response) {
                    if (response.status === 200) {
                        const responseBody = response.response;
                        const text = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            try { resolve(JSON.parse(text)); } catch (e) { reject({ type: 'ParseError', message: 'Failed to parse AI response.', details: text }); }
                        } else { reject({ type: 'ApiResponseError', message: 'AI response was empty or malformed.', details: responseBody }); }
                    } else { reject({ type: 'HttpError', status: response.status, message: `API returned status ${response.status}. Check API key.`, details: response.response }); }
                },
                onerror: function(error) { reject({ type: 'NetworkError', message: 'Network request failed.', details: error }); }
            });
        });
    }

    async function callGeminiWithBackoff(apiKey, prompt, maxRetries = 5) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                return await callGeminiAPI(apiKey, prompt);
            } catch (error) {
                if (error.status === 429 && attempt < maxRetries - 1) {
                    attempt++;
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    aiResults.textContent = `Rate limit hit. Retrying in ${Math.round(delay/1000)}s...`;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else { throw error; }
            }
        }
        throw new Error("Max retries exceeded for AI request.");
    }

    async function enrichDataWithAI() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) { alert("Please enter a Gemini API Key."); return; }
        if (isCategorizing) return;

        isCategorizing = true;
        aiBtn.disabled = true; resumeBtn.disabled = true; scanBtn.disabled = true; updateBtn.disabled = true; exportBtn.disabled = true;
        progressBarContainer.style.display = 'block';

        const packagesToProcess = packageData.map((pkg, index) => ({ ...pkg, originalIndex: index }))
                                             .filter(pkg => !pkg.mainCategory || pkg.mainCategory === "Error");
        const totalToProcess = packagesToProcess.length;
        if (totalToProcess === 0) {
            aiResults.textContent = "All packages are already categorized.";
            isCategorizing = false;
            updateUIState();
            return;
        }

        let processedCount = 0;

        for (const pkg of packagesToProcess) {
            const progress = ((processedCount + 1) / totalToProcess) * 100;
            progressBar.style.width = `${progress}%`;
            aiResults.textContent = `Processing ${processedCount + 1} of ${totalToProcess}: ${pkg.name}`;

            const prompt = `Analyze the following software package and return its categorization and most likely Winget ID.
                - Name: "${pkg.name}" - Description: "${pkg.description}" - Tags: "${pkg.tags}"
                Provide: 1. A single, broad 'mainCategory'. 2. An array of specific 'subCategories'. 3. The most probable Winget Package ID (or "N/A").`;
            try {
                const result = await callGeminiWithBackoff(apiKey, prompt);
                packageData[pkg.originalIndex].mainCategory = result.mainCategory || "Uncategorized";
                packageData[pkg.originalIndex].subCategories = result.subCategories || [];
                packageData[pkg.originalIndex].wingetId = result.wingetId || "N/A";
            } catch (error) {
                console.error(`Failed to process package "${pkg.name}":`, error);
                packageData[pkg.originalIndex].mainCategory = "Error";
                packageData[pkg.originalIndex].subCategories = [error.message || "Unknown error"];
                packageData[pkg.originalIndex].wingetId = "Error";
                if (error.status === 400 || error.status === 403) {
                    aiResults.textContent = `Critical API Error: ${error.message}. Please check your API key. Aborting.`;
                    isCategorizing = false;
                    updateUIState();
                    return;
                }
            } finally {
                processedCount++;
                saveState(); // Save after each package
            }
        }

        aiResults.textContent = "AI enrichment complete. You can now export the enhanced data.";
        isCategorizing = false;
        updateUIState();
    }

    // --- EXPORT FUNCTIONS ---

    function exportData() {
        if (packageData.length === 0) return;
        const jsonContent = JSON.stringify(packageData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'chocolatey_packages_complete.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`Exported ${packageData.length} packages to a single JSON file.`);
    }

    // --- EVENT LISTENERS ---
    scannerBtn.addEventListener('click', () => {
        loadState();
        modal.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    themeSwitch.addEventListener('click', () => {
        modalContent.classList.toggle('dark-theme');
        modalContent.classList.toggle('light-theme');
        const icon = themeSwitch.querySelector('i');
        icon.className = modalContent.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    });
    window.addEventListener('click', (event) => { if (event.target == modal) modal.style.display = 'none'; });

    scanBtn.addEventListener('click', fullRescan);
    updateBtn.addEventListener('click', checkForUpdates);
    aiBtn.addEventListener('click', enrichDataWithAI);
    resumeBtn.addEventListener('click', enrichDataWithAI);
    exportBtn.addEventListener('click', exportData);
    apiKeyInput.addEventListener('change', saveState);

    // Initial load
    loadState();

})();
