// ==UserScript==
// @name         NoNinite: Winget & Chocolatey Script Generator
// @namespace    https://github.com/SysAdminDoc/NoNinite
// @version      2.5.1
// @description  NoNinite is a userscript that transforms ninite.com. It keeps the familiar domain but replaces every function of the site adding more applications, customization tools, and using modern package managers (Winget and Chocolatey) instead of old-school Ninite installers.
// @author       Matthew Parker
// @match        https://ninite.com/
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/masonry/4.2.2/masonry.pkgd.min.js
// @require      https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
// ==/UserScript==

/* jshint esversion: 8 */

(async function () {
    'use strict';

    // ---------- Defaults (built-ins) ----------
    const defaultAppData = {}; // This will be populated from the fetched source

    const defaultPresets = [
        { name: "Fresh Windows Install", notes: "General user workstation", items: ["Chrome", "7-Zip", "VLC", "Spotify", "PowerShell 7", "Microsoft PowerToys", "Windows Terminal"] },
        { name: "Helpdesk Tools", notes: "Remote support and triage", items: ["AnyDesk", "TeamViewer", "7-Zip", "Everything", "Revo Uninstaller", "WizTree"] },
        { name: "Developer Workstation", notes: "Common dev stack", items: ["VS Code", "Git", "Node.js", "Python 3", "Windows Terminal", "Docker Desktop", "Notepad++", "WinSCP", "PuTTY"] },
        { name: "Remote Support Lite", notes: "Bare essentials", items: ["AnyDesk", "7-Zip", "Everything"] },
        { name: "Media/Streaming", notes: "Creators and streamers", items: ["VLC", "Audacity", "HandBrake", "ShareX"] },
        { name: "Privacy/Security", notes: "Hardening basics", items: ["Bitwarden", "KeePassXC", "VeraCrypt", "Firefox"] },
        { name: "IT Admin Work-from-a-USB", notes: "Portable-leaning toolbox for field work", items: ["7-Zip", "Everything", "Notepad++", "PuTTY", "WinSCP", "WizTree", "TreeSize Free", "ShareX", "Greenshot", "Firefox"] }
    ];

    // Quick Stacks: simple tag map (you can expand via Apps Manager later if desired)
    const defaultStacks = ["browsers", "dev", "remote", "media", "portable", "security"];
    const defaultAppTags = {
        "Chrome": ["browsers"], "Firefox": ["browsers", "security"], "Edge": ["browsers"], "Brave": ["browsers", "security"], "Opera": ["browsers"], "Vivaldi": ["browsers"],
        "VS Code": ["dev"], "Git": ["dev"], "Node.js": ["dev"], "Python 3": ["dev"], "Windows Terminal": ["dev"], "Docker Desktop": ["dev"], "Notepad++": ["dev", "portable"],
        "PuTTY": ["dev", "remote", "portable"], "WinSCP": ["dev", "remote", "portable"], "FileZilla": ["dev", "remote"],
        "AnyDesk": ["remote"], "TeamViewer": ["remote"], "VNC Viewer": ["remote"],
        "VLC": ["media"], "Audacity": ["media"], "HandBrake": ["media"], "ShareX": ["media", "portable"], "Greenshot": ["media", "portable"],
        "7-Zip": ["portable"], "Everything": ["portable"], "WizTree": ["portable"], "TreeSize Free": ["portable"],
        "Bitwarden": ["security"], "KeePassXC": ["security"], "VeraCrypt": ["security"]
    };

    // ---------- Persistent State ----------
    const state = loadState();

    function loadState() {
        const storedAppData = GM_getValue('appData');
        const appData = storedAppData && Object.keys(storedAppData).length > 0 ? storedAppData : structuredClone(defaultAppData);
        return {
            theme: GM_getValue('theme', 'dark'),
            hiddenElements: { '.navbar': true, '.homepage-introduction': true, '.footer': true },
            hiddenCategories: GM_getValue('hiddenCategories', {}),
            collapsedCategories: GM_getValue('collapsedCategories', {}),
            versions: GM_getValue('versions', {}),
            options: GM_getValue('options', {
                wingetScope: 'machine',
                wingetSilent: true,
                wingetDisableInteractivity: true,
                wingetAccept: true,
                chocoY: true,
                chocoNoProgress: true,
                bootstrap: true,
                enableWinget: true,
                enableChoco: true,
                enableStacks: true
            }),
            presets: GM_getValue('presets', structuredClone(defaultPresets)),
            appData,
            appTags: GM_getValue('appTags', structuredClone(defaultAppTags)),
            stacks: GM_getValue('stacks', structuredClone(defaultStacks)),
            editMode: GM_getValue('editMode', false)
        };
    }

    function saveState() {
        GM_setValue('theme', state.theme);
        GM_setValue('hiddenCategories', state.hiddenCategories);
        GM_setValue('collapsedCategories', state.collapsedCategories);
        GM_setValue('versions', state.versions);
        GM_setValue('options', state.options);
        GM_setValue('presets', state.presets);
        GM_setValue('appData', state.appData);
        GM_setValue('appTags', state.appTags);
        GM_setValue('stacks', state.stacks);
        GM_setValue('editMode', state.editMode);
    }

    // ---------- App Data Fetching ----------
    async function fetchAndProcessApps() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://raw.githubusercontent.com/ChrisTitusTech/winutil/refs/heads/main/config/applications.json',
                onload: function (response) {
                    try {
                        const rawData = JSON.parse(response.responseText);
                        const processedData = {}; // This will be the final categorized object.

                        // Iterate over each application key (e.g., "1password", "7zip")
                        for (const appKey in rawData) {
                            if (Object.hasOwnProperty.call(rawData, appKey)) {
                                const appInfo = rawData[appKey];
                                const category = appInfo.category || 'Uncategorized'; // Fallback category

                                // Ensure the category array exists in our processed data object
                                if (!processedData[category]) {
                                    processedData[category] = [];
                                }

                                // Create the app object in the format the script expects
                                const app = {
                                    name: appInfo.content || appKey, // Use 'content' for name, fallback to key
                                    wingetId: Array.isArray(appInfo.winget) ? appInfo.winget[0] : appInfo.winget,
                                    chocoId: appInfo.choco,
                                    link: appInfo.link || '#',
                                    description: appInfo.description || ''
                                };

                                // Only add the app if it has at least one valid package manager ID
                                if (app.wingetId || app.chocoId) {
                                    processedData[category].push(app);
                                }
                            }
                        }
                        resolve(processedData);
                    } catch (e) {
                        console.error('Error parsing application JSON:', e);
                        reject('Failed to parse application list.');
                    }
                },
                onerror: function (error) {
                    console.error('Error fetching application list:', error);
                    reject('Failed to fetch application list.');
                }
            });
        });
    }


    // ---------- Styles ----------
    GM_addStyle(`
    :root {
        --bg-dark: #121212; --bg-light: #f8f9fa;
        --panel-dark: #1e1e1e; --panel-light: #ffffff;
        --text-dark: #e0e0e0; --text-light: #212529;
        --accent: #007bff; --accent-hover: #0056b3;
        --border-dark: #333; --border-light: #dee2e6;
        --chip-bg-dark: rgba(255, 255, 255, 0.1); --chip-bg-light: #e9ecef;
        --highlight: #ffc107; --danger: #dc3545;
        --font-sans: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    }
    html, body { font-family: var(--font-sans); height: 100%; margin: 0; overflow-x: hidden; }
    body.dark-theme { background: var(--bg-dark) !important; color: var(--text-dark); }
    body.light-theme { background: var(--bg-light) !important; color: var(--text-light); }
    #pro-control-app-container { display: flex; flex-direction: column; min-height: 100vh; padding: 24px; }
    #app-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid var(--border-light); }
    body.dark-theme #app-header { border-color: var(--border-dark); }
    #app-title { font-size: 24px; font-weight: 600; }
    #main-content { display: flex; gap: 24px; flex: 1; margin-top: 24px; }
    #left-rail { width: 240px; flex: 0 0 240px; position: sticky; top: 24px; align-self: flex-start; }
    #main-rail { flex: 1; min-width: 0; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    #search-wrap { flex: 1; min-width: 300px; position: relative; }
    #global-search { width: 100%; padding: 10px 40px 10px 16px; border-radius: 8px; border: 1px solid var(--border-light); outline: none; transition: all 0.2s ease-in-out; }
    body.dark-theme #global-search { background: var(--panel-dark); color: var(--text-dark); border-color: var(--border-dark); }
    #global-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); }
    #search-hint { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; opacity: 0.6; }
    .btn { border-radius: 8px; font-weight: 600; padding: 10px 16px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s ease-in-out; }
    .primary-btn { background: var(--accent); color: #fff; }
    .primary-btn:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .primary-btn:disabled { background: #555; cursor: not-allowed; transform: none; box-shadow: none; }
    body.light-theme .primary-btn:disabled { background: #ccc; }
    .secondary-btn { border: 1px solid var(--border-light); background: transparent; }
    body.dark-theme .secondary-btn { border-color: var(--border-dark); color: var(--text-dark); }
    body.light-theme .secondary-btn { border-color: var(--border-light); color: var(--text-light); }
    .secondary-btn:hover { background: rgba(0,0,0,0.05); }
    body.dark-theme .secondary-btn:hover { background: rgba(255,255,255,0.05); }
    #selection-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .chip { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 16px; font-size: 13px; border: 1px solid transparent; }
    body.dark-theme .chip { background: var(--chip-bg-dark); }
    body.light-theme .chip { background: var(--chip-bg-light); }
    .chip .src { font-weight: 700; color: var(--accent); }
    .chip .rm { cursor: pointer; opacity: .7; font-size: 16px; line-height: 1; }
    .chip .rm:hover { opacity: 1; color: var(--danger); }
    .homepage-app-section { transition: all .3s; border-radius: 12px; padding: 20px; margin: 8px !important; width: calc(33.333% - 16px) !important; }
    body.dark-theme .homepage-app-section { background: var(--panel-dark); border: 1px solid var(--border-dark); }
    body.light-theme .homepage-app-section { background: var(--panel-light); border: 1px solid var(--border-light); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .category-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; gap: 8px; }
    .category-title-wrap { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; }
    .app-list { list-style: none; padding-left: 0; max-height: 1000px; overflow: hidden; transition: max-height .4s ease-in-out, margin .4s; margin-top: 16px; }
    .app-list.collapsed { max-height: 0; margin-top: 0 !important; }
    .app-item-label { display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; gap: 8px; transition: background-color 0.2s; }
    .app-item-label:hover, .app-item-label.kb-highlight { background: rgba(0, 123, 255, 0.1); }
    .app-left { display: flex; align-items: center; gap: 8px; }
    .app-delete { display: none; color: var(--danger); cursor: pointer; font-weight: 700; }
    .install-options label { margin-left: 8px; font-size: 13px; opacity: .9; }
    #pro-control-panel { position: fixed; right: 24px; bottom: 24px; display: flex; gap: 12px; z-index: 9999; }
    .control-btn { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--panel-light); border: 1px solid var(--border-light); cursor: pointer; transition: all .2s; }
    body.dark-theme .control-btn { background: var(--panel-dark); border-color: var(--border-dark); color: var(--text-dark); }
    .control-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity .3s; backdrop-filter: blur(5px); }
    .modal { width: 95%; max-width: 1100px; border-radius: 16px; overflow: hidden; transform: scale(.95); transition: transform .3s; display: flex; flex-direction: column; max-height: 90vh; }
    body.dark-theme .modal { background: var(--panel-dark); border: 1px solid var(--border-dark); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    body.light-theme .modal { background: var(--panel-light); border: 1px solid var(--border-light); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-light); }
    body.dark-theme .modal-header { border-color: var(--border-dark); }
    .modal-body { padding: 24px; overflow: auto; }
    .settings-modal-body { display: grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap: 24px; }
    .settings-group { display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border-light); padding: 16px; border-radius: 12px; }
    body.dark-theme .settings-group { border-color: var(--border-dark); }
    .settings-group h3 { margin: 0 0 8px 0; }
    .script-modal-body { padding: 0 24px 16px 24px; overflow: auto; }
    .script-output-wrap textarea { width: 100%; min-height: 250px; font-family: 'Fira Code', 'Consolas', monospace; font-size: 13px; border-radius: 8px; padding: 12px; border: 1px solid var(--border-light); }
    body.dark-theme .script-output-wrap textarea { background: #111; border-color: var(--border-dark); color: #f3f3f3; }
    .script-modal-footer { padding: 16px 24px; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid var(--border-light); }
    body.dark-theme .script-modal-footer { border-color: var(--border-dark); }
    #stacks { position: sticky; top: 24px; border: 1px solid var(--border-light); border-radius: 12px; padding: 16px; }
    body.dark-theme #stacks { border-color: var(--border-dark); background: var(--panel-dark); }
    body.light-theme #stacks { background: var(--panel-light); }
    #stacks h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
    #stacks label { display: flex; gap: 8px; align-items: center; margin: 8px 0; font-size: 14px; cursor: pointer; }
    .hidden { display: none !important; }
    #loading-indicator { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 20px; padding: 20px; background: var(--panel-dark); color: var(--text-dark); border-radius: 12px; z-index: 10001; }
    `);

    // ---------- UI Skeleton ----------
    function generateStacksHTML() {
        return `
      <div id="stacks">
        <h3>Quick Stacks</h3>
        ${state.stacks.map(tag => `
          <label><input type="checkbox" class="stack-filter" value="${escapeHtml(tag)}"> ${prettyTag(tag)}</label>
        `).join('')}
      </div>
    `;
    }

    const mainLayoutHTML = `
    <div id="loading-indicator">Loading Applications...</div>
    <div id="pro-control-app-container" style="display: none;">
      <header id="app-header">
        <h1 id="app-title">NoNinite Script Generator</h1>
        <div id="header-controls">
           <button id="open-apps-manager-btn" class="secondary-btn btn">Manage Apps</button>
           <button id="get-script-btn" class="primary-btn btn" disabled>Generate Scripts</button>
        </div>
      </header>
      <div id="main-content">
        ${state.options.enableStacks ? `<div id="left-rail">${generateStacksHTML()}</div>` : `<div id="left-rail" class="hidden"></div>`}
        <div id="main-rail">
          <div id="toolbar">
            <div id="search-wrap">
              <input id="global-search" type="text" placeholder="Search apps (/, ↑/↓ to navigate, Enter/Space to toggle)" autocomplete="off" />
              <span id="search-hint">/</span>
            </div>
             <div class="toolbar-row">
                <select id="preset-select" class="secondary-btn btn">
                  <option value="">Apply preset...</option>
                </select>
                <button id="manage-presets-btn" class="secondary-btn btn" title="Manage Presets">⚙️ Presets</button>
              </div>
          </div>
          <div id="selection-chips"></div>
          <div>
            <ul class="list-unstyled center-block js-masonry"></ul>
          </div>
        </div>
      </div>
    </div>
  `;

    const panelAndModalsHTML = `
    <div id="pro-control-panel">
      <button id="settings-btn" class="control-btn" title="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51-1z"></path></svg>
      </button>
      <button id="theme-toggle-btn" class="control-btn" title="Toggle Theme">
        <svg id="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <svg id="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>
    </div>

    <div class="modal-overlay settings-modal-overlay" style="display:none;opacity:0;">
      <div class="modal settings-modal">
        <div class="modal-header">
          <h2>Settings</h2>
          <button id="close-settings-modal-btn" class="control-btn" style="width:36px;height:36px;border-radius:50%;" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body settings-modal-body">
          <div class="settings-group" id="generator-options">
            <h3>Script & UI Options</h3>
            <label>Winget Scope:
              <select id="winget-scope" class="secondary-btn btn"><option value="machine">machine</option><option value="user">user</option></select>
            </label>
            <label><input type="checkbox" id="opt-winget-silent" checked> winget: --silent</label>
            <label><input type="checkbox" id="opt-winget-disable-interactivity" checked> winget: --disable-interactivity</label>
            <label><input type="checkbox" id="opt-winget-accept" checked> winget: accept agreements</label>
            <label><input type="checkbox" id="opt-choco-noninteractive" checked> choco: -y</label>
            <label><input type="checkbox" id="opt-choco-noprogress" checked> choco: --no-progress</label>
            <label><input type="checkbox" id="opt-bootstrap" checked> Generate PowerShell bootstrap (elevate, check tools)</label>
            <hr>
            <label><input type="checkbox" id="opt-enable-winget" checked> Enable Winget</label>
            <label><input type="checkbox" id="opt-enable-choco" checked> Enable Chocolatey</label>
            <small>At least one must be enabled.</small>
            <hr>
            <label><input type="checkbox" id="opt-enable-stacks" checked> Enable Quick Stacks sidebar</label>
            <label><input type="checkbox" id="opt-edit-mode"> Edit mode (inline red × deletes in app list)</label>
          </div>

          <div class="settings-group" id="presets-manager">
            <h3>Presets</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0;">
              <input id="preset-name" class="secondary-btn btn" placeholder="Preset name" style="flex:1;">
              <button id="add-preset-btn" class="primary-btn btn">Add/Update Preset</button>
            </div>
            <textarea id="preset-items" class="secondary-btn btn" placeholder="Items (comma-separated app names)" style="width:100%; min-height: 80px;"></textarea>
            <div><select id="preset-list" size="6" style="width:100%;" class="secondary-btn btn"></select></div>
            <div style="display:flex;gap:8px;margin-top:6px; flex-wrap: wrap;">
              <button id="delete-preset-btn" class="secondary-btn btn">Delete Selected</button>
              <button id="export-presets-btn" class="secondary-btn btn">Export</button>
              <button id="import-presets-btn" class="secondary-btn btn">Import</button>
            </div>
          </div>

          <div class="settings-group" id="config-io">
            <h3>Export / Import / Reset</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="export-config-btn" class="primary-btn btn">Export Config</button>
              <button id="import-config-btn" class="secondary-btn btn">Import Config</button>
              <button id="reset-config-btn" class="secondary-btn btn danger-link">Reset to Defaults</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay apps-modal-overlay" style="display:none;opacity:0;">
      <div class="modal apps-modal">
        <div class="modal-header">
          <h2>Apps Manager</h2>
          <button id="close-apps-modal-btn" class="control-btn" style="width:36px;height:36px;border-radius:50%;" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body apps-modal-body">
            </div>
      </div>
    </div>

    <div class="modal-overlay script-modal-overlay" style="display:none;opacity:0;">
      <div class="modal script-modal">
        <div class="modal-header">
          <h2 id="script-modal-title">Generated Script</h2>
          <button id="close-script-modal-btn" class="control-btn" style="width:36px;height:36px;border-radius:50%;" title="Close">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="script-modal-body">
          <div class="script-output-wrap">
            <h3>PowerShell Bootstrap</h3>
            <textarea id="ps-bootstrap-output" readonly></textarea>
            <h3>Plain Commands</h3>
            <textarea id="plain-commands-output" readonly></textarea>
          </div>
        </div>
        <div class="script-modal-footer">
          <div>
            <button id="copy-ps-btn" class="primary-btn btn">Copy Bootstrap</button>
            <button id="copy-plain-btn" class="secondary-btn btn">Copy Plain</button>
          </div>
          <button id="copy-script-btn" class="primary-btn btn">Copy Both</button>
        </div>
      </div>
    </div>
  `;

    // ---------- Build UI ----------
    function buildUI() {
        $('body').children().each(function () {
            if (!$(this).is('script')) $(this).hide();
        });

        $('body').prepend(mainLayoutHTML);
        $('body').append(panelAndModalsHTML);
    }

    // ---------- Theme ----------
    function applyTheme() {
        $('body').removeClass('dark-theme light-theme').addClass(state.theme + '-theme');
        $('#theme-icon-sun').toggle(state.theme === 'light');
        $('#theme-icon-moon').toggle(state.theme === 'dark');
    }

    // ---------- App Grid / Search / Stacks ----------
    let fuse;
    function buildFuseIndex() {
        const items = [];
        Object.entries(state.appData).forEach(([cat, apps]) => {
            apps.forEach(app => items.push({ category: cat, name: app.name, wingetId: app.wingetId || '', chocoId: app.chocoId || '' }));
        });
        fuse = new Fuse(items, { keys: ['name', 'wingetId', 'chocoId', 'category'], threshold: 0.35, includeScore: true });
    }

    function appHasAnySelectedStack(appName) {
        const checked = $('.stack-filter:checked').map((_, el) => $(el).val()).get();
        if (checked.length === 0) return true; // no stack filters means show all
        const tags = state.appTags[appName] || [];
        return tags.some(t => checked.includes(t));
    }

    function populateAppGrid() {
        const $container = $('.js-masonry');
        if (!$container.length) return;
        $container.empty();

        const showWinget = !!state.options.enableWinget;
        const showChoco = !!state.options.enableChoco;

        Object.entries(state.appData).forEach(([categoryName, apps]) => {
            let appItemsHTML = '';
            apps.forEach(app => {
                if (!appHasAnySelectedStack(app.name)) return;

                const wingetOption = (showWinget && app.wingetId) ? `<label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="winget" value="${escapeHtml(app.wingetId)}"> Winget</label>` : '';
                const chocoOption = (showChoco && app.chocoId) ? `<label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="choco" value="${escapeHtml(app.chocoId)}"> Choco</label>` : '';

                if (!wingetOption && !chocoOption) return;

                appItemsHTML += `
          <li>
            <div class="app-item-label" title="${escapeHtml(app.description || app.link || app.name)}">
              <div class="app-left">
                <span class="app-name" data-app="${escapeHtml(app.name)}">${escapeHtml(app.name)}</span>
                <span class="app-delete" data-cat="${escapeHtml(categoryName)}" data-app="${escapeHtml(app.name)}" title="Remove app">×</span>
              </div>
              <div class="install-options">
                ${wingetOption}
                ${chocoOption}
              </div>
            </div>
          </li>
        `;
            });

            if (!appItemsHTML.trim()) return;

            const isCollapsed = !!state.collapsedCategories[categoryName];
            const categoryHTML = `
        <li class="homepage-app-section" data-category="${escapeHtml(categoryName)}">
          <div class="category-header ${isCollapsed ? 'collapsed' : ''}">
            <div class="category-title-wrap">
              <h4>${escapeHtml(categoryName)}</h4>
            </div>
            <span class="toggle-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </div>
          <ul class="app-list ${isCollapsed ? 'collapsed' : ''}">${appItemsHTML}</ul>
        </li>`;
            $container.append(categoryHTML);
        });

        toggleEditModeUI(state.editMode);

        const $m = $('.js-masonry');
        if ($m.data('masonry')) {
            $m.masonry('reloadItems');
            $m.masonry('layout');
        } else {
            $m.masonry({ itemSelector: '.homepage-app-section', fitWidth: true, transitionDuration: '0.3s' });
        }
    }

    function toggleEditModeUI(on) {
        $('.app-delete').css('display', on ? 'inline-block' : 'none');
    }

    // ---------- Selection / chips ----------
    function getSelections() {
        const wingetApps = $('.app-checkbox[data-type="winget"]:checked').map((_, el) => $(el).val()).get();
        const chocoApps = $('.app-checkbox[data-type="choco"]:checked').map((_, el) => $(el).val()).get();
        const byApp = {};
        $('.app-checkbox:checked').each((_, el) => {
            const $el = $(el);
            const app = $el.data('app');
            const type = $el.data('type');
            const id = $el.val();
            if (!byApp[app]) byApp[app] = {};
            byApp[app][type] = id;
        });
        return { wingetApps, chocoApps, byApp };
    }

    function renderChips() {
        const { byApp } = getSelections();
        const $wrap = $('#selection-chips').empty();
        Object.entries(byApp).forEach(([app, sources]) => {
            Object.entries(sources).forEach(([src, id]) => {
                const key = `${src}:${id}`;
                const ver = state.versions[key] ? `@${state.versions[key]}` : '';
                const $chip = $(
                    `<span class="chip" title="${escapeHtml(id + ver)}">
            <span class="src">${src.toUpperCase()}</span> ${escapeHtml(app)}${escapeHtml(ver)}
            <span class="rm" aria-label="remove">×</span>
          </span>`
                );
                $chip.find('.rm').on('click', () => {
                    $(`.app-checkbox[data-type="${src}"][value="${cssEscape(id)}"]`).prop('checked', false).trigger('change');
                });
                $wrap.append($chip);
            });
        });
    }

    function updateGetButton() {
        const { wingetApps, chocoApps } = getSelections();
        const $button = $('#get-script-btn');

        let text = 'Select Apps';
        let mode = 'none';
        const selectionCount = wingetApps.length + chocoApps.length;

        if (selectionCount > 0) {
            text = `Generate Script (${selectionCount})`;
            mode = 'multi';
        }

        $button.text(text).prop('disabled', mode === 'none').data('mode', mode);
        renderChips();
        updateURLHash();
    }


    // ---------- Source preference considering disabled sources ----------
    function preferredSourceFor(app) {
        const enableW = !!state.options.enableWinget;
        const enableC = !!state.options.enableChoco;
        if (enableW && app.wingetId) return 'winget';
        if (enableC && app.chocoId) return 'choco';
        return null;
    }

    function appByName(name) {
        for (const apps of Object.values(state.appData)) {
            const f = apps.find(a => a.name.toLowerCase() === name.toLowerCase());
            if (f) return f;
        }
        return null;
    }

    // ---------- Search / keyboard ----------
    let kbIndex = -1, kbMatches = [];
    function clearHighlights() { $('.app-item-label').removeClass('kb-highlight'); }
    function highlightByName(name) {
        clearHighlights();
        const $el = $(`.app-name[data-app="${cssEscape(name)}"]`).closest('.app-item-label');
        if ($el.length) { $el.addClass('kb-highlight')[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
    function toggleFocused() {
        const item = kbMatches[kbIndex];
        if (!item) return;
        const row = $(`.app-name[data-app="${cssEscape(item.name)}"]`).closest('.app-item-label');
        const pref = (state.options.enableWinget && row.find('input[data-type="winget"]').get(0)) || row.find('input[data-type="choco"]').get(0);
        if (pref) {
            const $cb = $(pref);
            $cb.prop('checked', !$cb.is(':checked')).trigger('change');
        }
    }
    function doSearch(q) {
        if (!q) {
            kbMatches = [];
            kbIndex = -1;
            clearHighlights();
            populateAppGrid();
            return;
        }
        const res = fuse.search(q).slice(0, 50);
        const names = new Set(res.map(r => r.item.name));
        kbMatches = res.map(r => r.item);
        kbIndex = kbMatches.length ? 0 : -1;

        const $container = $('.js-masonry').empty();
        Object.entries(state.appData).forEach(([categoryName, apps]) => {
            let appItemsHTML = '';
            apps.forEach(app => {
                if (!names.has(app.name)) return;
                if (!appHasAnySelectedStack(app.name)) return;

                const wingetOption = (state.options.enableWinget && app.wingetId) ? `<label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="winget" value="${escapeHtml(app.wingetId)}"> Winget</label>` : '';
                const chocoOption = (state.options.enableChoco && app.chocoId) ? `<label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="choco" value="${escapeHtml(app.chocoId)}"> Choco</label>` : '';
                if (!wingetOption && !chocoOption) return;

                appItemsHTML += `
          <li>
            <div class="app-item-label" title="${escapeHtml(app.description || app.link || app.name)}">
              <div class="app-left">
                <span class="app-name" data-app="${escapeHtml(app.name)}">${escapeHtml(app.name)}</span>
              </div>
              <div class="install-options">
                ${wingetOption}
                ${chocoOption}
              </div>
            </div>
          </li>`;
            });

            if (!appItemsHTML.trim()) return;
            const catHTML = `
        <li class="homepage-app-section" data-category="${escapeHtml(categoryName)}">
          <div class="category-header">
            <div class="category-title-wrap"><h4>${escapeHtml(categoryName)}</h4></div>
          </div>
          <ul class="app-list">${appItemsHTML}</ul>
        </li>`;
            $container.append(catHTML);
        });

        if (kbMatches.length > 0) highlightByName(kbMatches[0].name);
        const $m = $('.js-masonry'); if ($m.data('masonry')) { $m.masonry('reloadItems'); $m.masonry('layout'); }
    }

    // ---------- URL share ----------
    function updateURLHash() {
        const { wingetApps, chocoApps } = getSelections();
        const params = new URLSearchParams();
        if (wingetApps.length) params.set('winget', wingetApps.join(','));
        if (chocoApps.length) params.set('choco', chocoApps.join(','));
        const h = params.toString();
        if (h) history.replaceState(null, '', `#${h}`); else history.replaceState(null, '', location.pathname + location.search);
    }
    function loadFromHash() {
        if (!location.hash) return;
        const sp = new URLSearchParams(location.hash.slice(1));
        const w = (sp.get('winget') || '').split(',').filter(Boolean);
        const c = (sp.get('choco') || '').split(',').filter(Boolean);
        w.forEach(id => $(`.app-checkbox[data-type="winget"][value="${cssEscape(id)}"]`).prop('checked', true));
        c.forEach(id => $(`.app-checkbox[data-type="choco"][value="${cssEscape(id)}"]`).prop('checked', true));
    }

    // ---------- Script generation ----------
    function buildPlainCommands({ wingetApps, chocoApps }) {
        const wopts = [];
        if (state.options.wingetAccept) { wopts.push('--accept-package-agreements', '--accept-source-agreements'); }
        if (state.options.wingetSilent) { wopts.push('--silent'); }
        if (state.options.wingetDisableInteractivity) { wopts.push('--disable-interactivity'); }
        if (state.options.wingetScope) { wopts.push(`--scope ${state.options.wingetScope}`); }

        const wingetParts = wingetApps.map(id => `--id "${id}"`);

        const chocoOpts = [];
        if (state.options.chocoY) chocoOpts.push('-y');
        if (state.options.chocoNoProgress) chocoOpts.push('--no-progress');

        const chocoParts = chocoApps;

        let plain = '';
        if (wingetParts.length && state.options.enableWinget) plain += `# Winget Install\nwinget install ${wopts.join(' ')} ${wingetParts.join(' ')}\n\n`;
        if (chocoParts.length && state.options.enableChoco) plain += `# Chocolatey Install\nchoco install ${chocoParts.join(' ')} ${chocoOpts.join(' ')}\n`;
        return plain.trim();
    }

    function buildBootstrapPS({ wingetApps, chocoApps }) {
        const plain = buildPlainCommands({ wingetApps, chocoApps });
        const lines = [
            `# Requires: PowerShell, Internet connectivity`,
            `# Elevate if not admin`,
            `if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {`,
            `  Start-Process PowerShell -Verb RunAs "-NoProfile -ExecutionPolicy Bypass -Command \`"& {Start-Transcript -Path .\\noninite-install.log -Append; & '$PSCommandPath'}\`"";`,
            `  exit;`,
            `}`,
            ``,
            `# Ensure Chocolatey (optional)`,
            `function Ensure-Chocolatey {`,
            `  if (Get-Command choco -ErrorAction SilentlyContinue) { return }`,
            `  Write-Host "Installing Chocolatey..." -ForegroundColor Cyan`,
            `  Set-ExecutionPolicy Bypass -Scope Process -Force;`,
            `  [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12;`,
            `  Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`,
            `}`,
            ``,
            `$needChoco = ${chocoApps.length > 0 && state.options.enableChoco ? '$true' : '$false'}`,
            `if ($needChoco) { Ensure-Chocolatey }`,
            ``,
            `# Run installs`,
            `Write-Host "Starting installs..." -ForegroundColor Green`,
            `${plain}`,
            ``,
            `Write-Host "Done." -ForegroundColor Green`
        ];
        return lines.join('\n');
    }

    function generateAndShowScript() {
        const { wingetApps, chocoApps } = getSelections();
        const plain = buildPlainCommands({ wingetApps, chocoApps });
        const ps = state.options.bootstrap ? buildBootstrapPS({ wingetApps, chocoApps }) : plain;
        $('#plain-commands-output').val(plain);
        $('#ps-bootstrap-output').val(ps);
        openOverlay('.script-modal-overlay', '.script-modal');
    }

    // ---------- Presets ----------
    function applyPreset(presetName) {
        const p = state.presets.find(x => x.name === presetName);
        if (!p) return;
        $('.app-checkbox').prop('checked', false);
        (p.items || []).forEach(itemName => {
            const app = appByName(itemName);
            if (!app) return;
            const src = preferredSourceFor(app);
            if (!src) return;
            const val = src === 'winget' ? app.wingetId : app.chocoId;
            $(`.app-checkbox[data-type="${src}"][value="${cssEscape(val)}"]`).prop('checked', true);
        });
        updateGetButton();
    }
    function refreshPresetSelects() {
        const $sel = $('#preset-select').empty().append(`<option value="">Apply preset...</option>`);
        state.presets.forEach(p => $sel.append(`<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`));
        const $list = $('#preset-list').empty();
        state.presets.forEach(p => $list.append(`<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`));
    }


    // ---------- Export / Import helpers ----------
    function buildExportConfig() {
        return {
            theme: state.theme,
            appData: state.appData,
            presets: state.presets,
            options: state.options,
            versions: state.versions,
            hiddenCategories: state.hiddenCategories,
            collapsedCategories: state.collapsedCategories,
            appTags: state.appTags,
            stacks: state.stacks
        };
    }
    function exportConfig() {
        const json = JSON.stringify(buildExportConfig(), null, 2);
        GM_setClipboard(json, 'text');
        alert('Configuration copied to clipboard!');
    }
    function importConfigFromPrompt() {
        const val = window.prompt('Paste exported JSON config here:');
        if (!val) return;
        try {
            const obj = JSON.parse(val);
            importConfigObject(obj);
            alert('Config imported.');
        } catch { alert('Invalid JSON.'); }
    }

    function importConfigObject(obj) {
        if (obj.appData) state.appData = obj.appData;
        if (obj.presets) state.presets = obj.presets;
        if (obj.options) state.options = { ...state.options, ...obj.options };
        if (obj.versions) state.versions = obj.versions;
        if (obj.hiddenCategories) state.hiddenCategories = obj.hiddenCategories;
        if (obj.collapsedCategories) state.collapsedCategories = obj.collapsedCategories;
        if (obj.theme) state.theme = obj.theme;
        if (obj.appTags) state.appTags = obj.appTags;
        if (obj.stacks) state.stacks = obj.stacks;
        saveState();
        applyTheme();
        rebuildStacksSidebar();
        populateAppGrid();
        buildFuseIndex();
        refreshPresetSelects();
        updateGetButton();
    }


    // ---------- Overlays ----------
    function openOverlay(overlaySel, modalSel) {
        const $ov = $(overlaySel), $md = $(modalSel);
        $ov.css('display', 'flex');
        setTimeout(() => {
            $ov.css('opacity', 1); $md.css('transform', 'scale(1)');
        }, 10);
    }
    function closeOverlay(overlaySel, modalSel) {
        const $ov = $(overlaySel), $md = $(modalSel);
        $ov.css('opacity', 0); $md.css('transform', 'scale(0.95)');
        setTimeout(() => $ov.css('display', 'none'), 300);
    }

    // ---------- Utils ----------
    function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
    function cssEscape(s) { return String(s).replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1'); }
    function prettyTag(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

    function rebuildStacksSidebar() {
        if (!state.options.enableStacks) {
            $('#left-rail').addClass('hidden').empty();
        } else {
            $('#left-rail').removeClass('hidden').html(generateStacksHTML());
        }
        // Re-attach listeners if needed for dynamically added content
        $('.stack-filter').on('change', () => {
             populateAppGrid();
             updateGetButton();
        });
    }

    // ---------- Init ----------
    $(document).ready(async function ($) {
        buildUI();
        applyTheme();

        try {
            const apps = await fetchAndProcessApps();
            state.appData = apps;
            saveState(); // Save the fetched apps for offline use
            $('#loading-indicator').hide();
            $('#pro-control-app-container').show();
        } catch (error) {
            $('#loading-indicator').text(error).css('color', 'red');
            // Attempt to load from storage if fetch fails
             if (Object.keys(state.appData).length > 0) {
                 $('#loading-indicator').hide();
                 $('#pro-control-app-container').show();
                 alert("Could not fetch the latest app list. Using the last saved version.");
             } else {
                 return; // Critical failure, cannot proceed
             }
        }


        populateAppGrid();
        buildFuseIndex();

        loadFromHash();
        updateGetButton();

        refreshPresetSelects();

        // Top bar actions
        $('#theme-toggle-btn').on('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveState(); });

        $('#settings-btn').on('click', () => openOverlay('.settings-modal-overlay', '.settings-modal'));
        $('#close-settings-modal-btn').on('click', () => closeOverlay('.settings-modal-overlay', '.settings-modal'));
        $('.settings-modal-overlay').on('click', function (e) { if (e.target === this) closeOverlay('.settings-modal-overlay', '.settings-modal'); });

        $('#open-apps-manager-btn').on('click', () => openOverlay('.apps-modal-overlay', '.apps-modal'));
        $('#close-apps-modal-btn').on('click', () => closeOverlay('.apps-modal-overlay', '.apps-modal'));
        $('.apps-modal-overlay').on('click', function (e) { if (e.target === this) closeOverlay('.apps-modal-overlay', '.apps-modal'); });


        // Manage presets quick access
        $('#manage-presets-btn').on('click', () => {
            openOverlay('.settings-modal-overlay', '.settings-modal');
            setTimeout(() => {
                const el = document.getElementById('presets-manager');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        });


        // Script modal actions
        $('#get-script-btn').on('click', generateAndShowScript);
        $('#close-script-modal-btn').on('click', () => closeOverlay('.script-modal-overlay', '.script-modal'));
        $('.script-modal-overlay').on('click', function (e) { if (e.target === this) closeOverlay('.script-modal-overlay', '.script-modal'); });

        $('#copy-ps-btn, #copy-plain-btn, #copy-script-btn').on('click', function() {
            const btnId = $(this).attr('id');
            let textToCopy = '';
            if (btnId === 'copy-ps-btn') textToCopy = $('#ps-bootstrap-output').val();
            else if (btnId === 'copy-plain-btn') textToCopy = $('#plain-commands-output').val();
            else textToCopy = `# Bootstrap\n${$('#ps-bootstrap-output').val()}\n\n# Plain\n${$('#plain-commands-output').val()}`;

            GM_setClipboard(textToCopy, 'text');
            const originalText = $(this).text();
            $(this).text('Copied!');
            setTimeout(() => $(this).text(originalText), 1500);
        });

        // Apply preset
        $('#preset-select').on('change', function () {
            const name = $(this).val();
            if (name) applyPreset(name);
            $(this).val('');
        });

        // Settings: script options & edit mode + enable toggles
        $('#winget-scope').val(state.options.wingetScope);
        $('#opt-winget-silent').prop('checked', state.options.wingetSilent);
        $('#opt-winget-disable-interactivity').prop('checked', state.options.wingetDisableInteractivity);
        $('#opt-winget-accept').prop('checked', state.options.wingetAccept);
        $('#opt-choco-noninteractive').prop('checked', state.options.chocoY);
        $('#opt-choco-noprogress').prop('checked', state.options.chocoNoProgress);
        $('#opt-bootstrap').prop('checked', state.options.bootstrap);
        $('#opt-enable-winget').prop('checked', state.options.enableWinget);
        $('#opt-enable-choco').prop('checked', state.options.enableChoco);
        $('#opt-enable-stacks').prop('checked', state.options.enableStacks);
        $('#opt-edit-mode').prop('checked', state.editMode);

        $('#generator-options').on('change', 'input, select', function (e) {
            state.options.wingetScope = $('#winget-scope').val();
            state.options.wingetSilent = $('#opt-winget-silent').is(':checked');
            state.options.wingetDisableInteractivity = $('#opt-winget-disable-interactivity').is(':checked');
            state.options.wingetAccept = $('#opt-winget-accept').is(':checked');
            state.options.chocoY = $('#opt-choco-noninteractive').is(':checked');
            state.options.chocoNoProgress = $('#opt-choco-noprogress').is(':checked');
            state.options.bootstrap = $('#opt-bootstrap').is(':checked');
            state.options.enableWinget = $('#opt-enable-winget').is(':checked');
            state.options.enableChoco = $('#opt-enable-choco').is(':checked');
            state.options.enableStacks = $('#opt-enable-stacks').is(':checked');
            state.editMode = $('#opt-edit-mode').is(':checked');

            if (!state.options.enableWinget && !state.options.enableChoco) {
                alert('At least one package manager (Winget/Choco) must be enabled.');
                $(this).prop('checked', true); // Re-check the box
                if($(this).attr('id') === 'opt-enable-winget') state.options.enableWinget = true;
                else state.options.enableChoco = true;
                return;
            }

            saveState();
            toggleEditModeUI(state.editMode);
            rebuildStacksSidebar();
            populateAppGrid();
        });

        // Quick Stacks filtering
        $(document).on('change', '.stack-filter', function () {
            populateAppGrid();
        });

        // Settings: Presets manager
        $('#preset-list').on('change', function() {
            const presetName = $(this).val();
            const preset = state.presets.find(p => p.name === presetName);
            if (preset) {
                $('#preset-name').val(preset.name);
                $('#preset-items').val((preset.items || []).join(', '));
            }
        });

        $('#add-preset-btn').on('click', () => {
            const name = $('#preset-name').val().trim();
            if (!name) return alert('Preset name required.');
            const items = $('#preset-items').val().split(',').map(s => s.trim()).filter(Boolean);
            const idx = state.presets.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
            if (idx >= 0) state.presets[idx].items = items;
            else state.presets.push({ name, items });
            saveState(); refreshPresetSelects();
            $('#preset-name, #preset-items').val('');
        });
        $('#delete-preset-btn').on('click', () => {
            const sel = $('#preset-list').val();
            if (!sel) return;
            state.presets = state.presets.filter(p => p.name !== sel);
            saveState(); refreshPresetSelects();
             $('#preset-name, #preset-items').val('');
        });
        $('#export-presets-btn').on('click', () => {
            GM_setClipboard(JSON.stringify(state.presets, null, 2), 'text');
            alert('Presets copied to clipboard.');
        });
        $('#import-presets-btn').on('click', () => {
             const val = window.prompt('Paste Presets JSON (array of {name, items}):');
            if (!val) return;
            try {
              const arr = JSON.parse(val);
              if (Array.isArray(arr)) { state.presets = arr; saveState(); refreshPresetSelects(); alert('Presets imported.'); }
              else alert('Invalid format.');
            } catch { alert('Invalid JSON.'); }
        });

        // Category collapse toggle
        $(document).on('click', '.category-header', function (e) {
            const categoryName = $(this).closest('.homepage-app-section').data('category');
            const isCollapsed = !state.collapsedCategories[categoryName];
            state.collapsedCategories[categoryName] = isCollapsed;
            $(this).toggleClass('collapsed', isCollapsed);
            $(this).siblings('.app-list').toggleClass('collapsed', isCollapsed);
            saveState();
            setTimeout(() => { $('.js-masonry').masonry('layout'); }, 350);
        });

        // Selection changes
        $(document).on('change', '.app-checkbox', updateGetButton);

        // Search keyboard helpers
        $(document).on('keydown', (e) => {
            const $input = $('#global-search');
            if (e.key === '/' && document.activeElement !== $input[0]) {
                e.preventDefault();
                $input.focus().select();
            } else if (document.activeElement === $input[0]) {
                if (kbMatches.length === 0) return;
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    kbIndex = (kbIndex + 1) % kbMatches.length;
                    highlightByName(kbMatches[kbIndex].name);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    kbIndex = (kbIndex - 1 + kbMatches.length) % kbMatches.length;
                    highlightByName(kbMatches[kbIndex].name);
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFocused();
                } else if (e.key === 'Escape') {
                    $input.val('').trigger('input');
                }
            }
        });

        // Live search input
        $(document).on('input', '#global-search', function () {
            doSearch(this.value.trim());
        });

        // Config Export/Import
        $('#export-config-btn').on('click', exportConfig);
        $('#import-config-btn').on('click', importConfigFromPrompt);
        $('#reset-config-btn').on('click', async function () {
            if (!confirm('This will delete all your custom presets and settings and fetch the latest default application list. Are you sure?')) return;
            // Clear local storage values
            GM_setValue('appData', null);
            GM_setValue('presets', null);
            GM_setValue('options', null);
            GM_setValue('versions', null);
            GM_setValue('hiddenCategories', null);
            GM_setValue('collapsedCategories', null);
            GM_setValue('appTags', null);
            GM_setValue('stacks', null);
            GM_setValue('editMode', null);

            alert('Configuration has been reset. The page will now reload to apply the changes.');
            location.reload();
        });
    });
})();
