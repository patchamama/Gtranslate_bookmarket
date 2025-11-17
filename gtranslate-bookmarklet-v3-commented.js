/**
 * Google Translate Bookmarklet Enhanced - Version 3.0
 *
 * MAJOR CHANGES IN V3.0:
 * - Complete translation to English (UI, messages, variables)
 * - Persistent sort order in localStorage
 * - Real-time search/filter functionality
 * - Individual word deletion with × button
 * - Auto-refresh after all actions
 * - Using eval() injection for guaranteed button functionality
 * - New localStorage key: gtranslateSortMode
 *
 * ARCHITECTURE:
 * - IIFE (Immediately Invoked Function Expression) pattern
 * - Blob URL + eval() injection for CSP compliance
 * - Event handlers using onclick (injected context, not inline HTML)
 * - Persistent sort mode across sessions
 */

javascript:(function() {
    'use strict';

    /**
     * STORAGE KEYS
     * All localStorage keys used by the application
     */
    const STORAGE_KEYS = {
        WORD: 'gtranslateMemoryWord',          // Last searched word
        PARAMS: 'gtranslateMemoryParams',      // Last sl/tl/text params
        HISTORY: 'gtranslateHistory',           // History array (JSON)
        LAST_DIALOG: 'gtranslateLastDialog',   // Last dialog timestamp
        SORT_MODE: 'gtranslateSortMode'        // Current sort mode (NEW in v3.0)
    };

    /**
     * SUPPORTED LANGUAGES
     * Language rotation: DE → EN → ES → DE
     */
    const LANGUAGES = ['de', 'en', 'es'];

    /**
     * GOOGLE TRANSLATE URL CONSTANTS
     */
    const TRANSLATE_BASE_URL = 'https://translate.google.com/';
    const TRANSLATE_DOMAIN = 'translate.google.com';

    /**
     * Get next language in rotation, skipping source language
     * Ensures target language is never the same as source
     *
     * @param {string} currentLang - Current target language
     * @param {string} sourceLang - Source language to skip
     * @returns {string} Next language in rotation
     */
    function getNextLanguage(currentLang, sourceLang) {
        const currentIndex = LANGUAGES.indexOf(currentLang);
        let nextIndex = (currentIndex + 1) % LANGUAGES.length;
        let nextLang = LANGUAGES[nextIndex];

        // Skip if next language equals source language
        if (nextLang === sourceLang) {
            nextIndex = (nextIndex + 1) % LANGUAGES.length;
            nextLang = LANGUAGES[nextIndex];
        }

        return nextLang;
    }

    /**
     * Get saved translation parameters from localStorage
     * Returns default values if not found
     *
     * @returns {Object} {sl, tl, text}
     */
    function getSavedParams() {
        const saved = localStorage.getItem(STORAGE_KEYS.PARAMS);
        if (!saved) {
            return { sl: 'de', tl: 'en', text: '' };
        }
        return JSON.parse(saved);
    }

    /**
     * Save translation parameters to localStorage
     *
     * @param {string} sl - Source language
     * @param {string} tl - Target language
     * @param {string} text - Search term
     */
    function saveParams(sl, tl, text) {
        const params = { sl, tl, text };
        localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(params));
        localStorage.setItem(STORAGE_KEYS.WORD, text);
    }

    /**
     * Get translation history from localStorage
     *
     * @returns {Array} History array (empty array if not found)
     */
    function getHistory() {
        const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
        return history ? JSON.parse(history) : [];
    }

    /**
     * Add entry to translation history
     * Prevents consecutive duplicates (same word + languages)
     *
     * @param {string} word - Word to add
     * @param {string} sl - Source language
     * @param {string} tl - Target language
     */
    function addToHistory(word, sl, tl) {
        if (!word || word.trim() === '') return;

        const history = getHistory();
        const entry = {
            word: word.trim(),
            sl: sl,
            tl: tl,
            timestamp: new Date().toISOString()
        };

        // Prevent consecutive duplicates
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            if (lastEntry.word === entry.word &&
                lastEntry.sl === entry.sl &&
                lastEntry.tl === entry.tl) {
                return; // Skip duplicate
            }
        }

        history.push(entry);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }

    /**
     * Build Google Translate URL with parameters
     * Uses URLSearchParams for proper encoding
     *
     * @param {string} sl - Source language
     * @param {string} tl - Target language
     * @param {string} text - Text to translate
     * @returns {string} Complete URL
     */
    function buildTranslateURL(sl, tl, text) {
        const params = new URLSearchParams({
            sl: sl,
            tl: tl,
            text: text,
            op: 'translate'
        });
        return TRANSLATE_BASE_URL + '?' + params.toString();
    }

    /**
     * Check if currently on Google Translate domain
     *
     * @returns {boolean}
     */
    function isOnGoogleTranslate() {
        return window.location.hostname.includes(TRANSLATE_DOMAIN);
    }

    /**
     * Navigate to URL
     * Uses location.href if on GT domain, otherwise opens new window
     *
     * @param {string} url - URL to navigate to
     */
    function navigateToURL(url) {
        if (isOnGoogleTranslate()) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    }

    /**
     * Check if initial dialog should be shown
     * Shows once per day
     *
     * @returns {boolean}
     */
    function shouldShowDialog() {
        const history = getHistory();
        if (history.length === 0) {
            return true; // Always show for first use
        }

        const lastDialog = localStorage.getItem(STORAGE_KEYS.LAST_DIALOG);
        if (!lastDialog) {
            return true;
        }

        const lastDate = new Date(lastDialog);
        const today = new Date();

        // Check if different day
        if (lastDate.getFullYear() !== today.getFullYear() ||
            lastDate.getMonth() !== today.getMonth() ||
            lastDate.getDate() !== today.getDate()) {
            return true;
        }

        return false;
    }

    /**
     * Mark dialog as shown (save timestamp)
     */
    function markDialogShown() {
        localStorage.setItem(STORAGE_KEYS.LAST_DIALOG, new Date().toISOString());
    }

    /**
     * Perform translation workflow
     * Main entry point for translation flow
     */
    function performTranslation() {
        const savedParams = getSavedParams();
        const lastWord = localStorage.getItem(STORAGE_KEYS.WORD) || '';

        // Prompt user for word (English UI)
        const userInput = prompt(
            'Word to translate:\\n(Empty, "history" or "?" to view history)',
            lastWord
        );

        if (userInput === null) return; // Cancelled

        const trimmedInput = userInput.trim().toLowerCase();

        // Check for special commands
        if (trimmedInput === '' || trimmedInput === 'history' || trimmedInput === '?') {
            showHistory();
            return;
        }

        const originalInput = userInput.trim();
        const wordChanged = originalInput !== lastWord;

        let sl = savedParams.sl;
        let tl = savedParams.tl;

        // If same word, rotate target language
        if (!wordChanged) {
            tl = getNextLanguage(tl, sl);
        }

        saveParams(sl, tl, originalInput);
        addToHistory(originalInput, sl, tl);

        const url = buildTranslateURL(sl, tl, originalInput);
        navigateToURL(url);
    }

    /**
     * Show history window
     * Generates dynamic HTML and opens in new window using Blob URL
     *
     * V3.0 CHANGES:
     * - English UI
     * - Search box added
     * - Delete button per word
     * - Using eval() injection for guaranteed functionality
     */
    function showHistory() {
        const history = getHistory();

        // Generate complete HTML page (English UI)
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Google Translate History</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .controls {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .search-box {
            flex: 1 1 300px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .search-box input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 6px;
            font-size: 14px;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102,126,234,0.4);
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-success:hover {
            background: #218838;
            transform: translateY(-2px);
        }

        .btn-warning {
            background: #ffc107;
            color: #212529;
        }

        .btn-warning:hover {
            background: #e0a800;
            transform: translateY(-2px);
        }

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background: #c82333;
            transform: translateY(-2px);
        }

        .stats {
            padding: 15px 30px;
            background: #e3f2fd;
            border-bottom: 1px solid #bbdefb;
            font-size: 14px;
            color: #1976d2;
            font-weight: 500;
        }

        .history-list {
            padding: 20px 30px;
            max-height: 600px;
            overflow-y: auto;
        }

        .history-item {
            padding: 15px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .history-item:hover {
            background: #e9ecef;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .history-item a {
            text-decoration: none;
            color: #212529;
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .word {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
        }

        .meta {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
        }

        .lang-badge {
            display: inline-block;
            padding: 2px 8px;
            background: #667eea;
            color: white;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 5px;
        }

        .count-badge {
            display: inline-block;
            padding: 2px 8px;
            background: #ff6b6b;
            color: white;
            border-radius: 4px;
            font-size: 11px;
            margin-left: 8px;
            font-weight: bold;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }

        .empty-state svg {
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
            opacity: 0.3;
        }

        input[type="file"] {
            display: none;
        }

        .btn-delete {
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-delete:hover {
            background: #c82333;
            transform: scale(1.1);
        }

        @media (max-width: 600px) {
            .controls {
                flex-direction: column;
            }
            .btn {
                width: 100%;
            }
            .search-box {
                flex: 1 1 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Translation History</h1>
            <p>All your Google Translate searches</p>
        </div>

        <div class="controls">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="🔍 Search words...">
                <button class="btn btn-primary" id="btnClearSearch">✕</button>
            </div>
            <button class="btn btn-primary" id="btnSortDate">🕐 By Date</button>
            <button class="btn btn-primary" id="btnSortAlpha">🔤 A-Z</button>
            <button class="btn btn-primary" id="btnSortCount">🔢 By Usage</button>
            <button class="btn btn-success" id="btnExport">💾 Export</button>
            <button class="btn btn-warning" id="btnImport">📥 Import</button>
            <input type="file" id="importFile" accept=".json">
            <button class="btn btn-danger" id="btnClear">🗑️ Clear All</button>
        </div>

        <div class="stats">
            Unique words: <strong id="totalCount">0</strong> |
            Showing: <strong id="showingCount">0</strong>
        </div>

        <div class="history-list" id="historyList"></div>
    </div>
</body>
</html>`;

        // Try to open using Blob URL
        try {
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const blobURL = URL.createObjectURL(blob);
            const newWindow = window.open(blobURL, '_blank');

            if (newWindow) {
                // Inject scripts after DOM loads
                setTimeout(function() {
                    injectScripts(newWindow, history);
                }, 300);
            } else {
                fallbackToDataURI(htmlContent, history);
            }
        } catch (error) {
            fallbackToDataURI(htmlContent, history);
        }
    }

    /**
     * Fallback to Data URI if Blob URL fails
     *
     * @param {string} htmlContent - HTML content
     * @param {Array} history - History array
     */
    function fallbackToDataURI(htmlContent, history) {
        try {
            const dataURI = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
            const dataWindow = window.open(dataURI, '_blank');

            if (dataWindow) {
                setTimeout(function() {
                    injectScripts(dataWindow, history);
                }, 300);
            } else {
                alert('Could not open history. Please allow popups.');
            }
        } catch (e) {
            alert('Error opening history: ' + e.message);
        }
    }

    /**
     * Inject JavaScript code into child window using eval()
     * V3.0: Complete rewrite using eval() for guaranteed functionality
     *
     * WHY EVAL()?
     * Using eval() in the child window context ensures that:
     * 1. All functions execute in the correct context
     * 2. onclick handlers work correctly (not inline, but assigned)
     * 3. localStorage access works through window.opener
     * 4. No CSP violations (eval is in child window, not parent)
     *
     * @param {Window} win - Child window object
     * @param {Array} history - History array
     */
    function injectScripts(win, history) {
        if (!win || win.closed) return;

        // Code to inject as string (will be evaluated in child window)
        const codeToInject = `(function() {
            // State variables
            var rawHistory = ${JSON.stringify(history)};
            var groupedHistory = [];
            var filteredHistory = [];
            var currentView = 'date';
            var searchTerm = '';

            /**
             * Get localStorage from opener or current window
             */
            function getLS(key) {
                try {
                    if (window.opener && !window.opener.closed) {
                        return window.opener.localStorage.getItem(key);
                    }
                    return localStorage.getItem(key);
                } catch (e) {
                    return localStorage.getItem(key);
                }
            }

            /**
             * Set localStorage in both opener and current window
             */
            function setLS(key, value) {
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.localStorage.setItem(key, value);
                    }
                    localStorage.setItem(key, value);
                } catch (e) {
                    localStorage.setItem(key, value);
                }
            }

            /**
             * Remove localStorage from both contexts
             */
            function removeLS(key) {
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.localStorage.removeItem(key);
                    }
                    localStorage.removeItem(key);
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }

            /**
             * HTML escape function
             */
            function escapeHtml(text) {
                var div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            /**
             * Group history by word+sl+tl combination
             * Counts repetitions
             */
            function groupHistory(historyArray) {
                var grouped = {};

                for (var i = 0; i < historyArray.length; i++) {
                    var item = historyArray[i];
                    var key = item.word + '|' + item.sl + '|' + item.tl;

                    if (!grouped[key]) {
                        grouped[key] = {
                            word: item.word,
                            sl: item.sl,
                            tl: item.tl,
                            count: 0,
                            firstDate: item.timestamp,
                            lastDate: item.timestamp
                        };
                    }

                    grouped[key].count++;

                    // Update last date if newer
                    if (new Date(item.timestamp) > new Date(grouped[key].lastDate)) {
                        grouped[key].lastDate = item.timestamp;
                    }
                }

                return Object.keys(grouped).map(function(key) {
                    return grouped[key];
                });
            }

            /**
             * Generate HTML for history list
             * V3.0: Added delete button per item
             */
            function generateHistoryHTML(data) {
                if (data.length === 0) {
                    return '<div class="empty-state">' +
                           '<svg viewBox="0 0 24 24" fill="currentColor">' +
                           '<path d="M9 2C7.89 2 7 2.9 7 4V20C7 21.1 7.89 22 9 22H18C19.1 22 20 21.1 20 20V8L14 2H9M13 3.5L18.5 9H13V3.5M10 19V17H17V19H10M10 15V13H17V15H10M10 11V9H17V11H10Z"/>' +
                           '</svg>' +
                           '<h3>No history yet</h3>' +
                           '<p>Your searched words will appear here</p>' +
                           '</div>';
                }

                var html = '';

                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var date = new Date(item.lastDate);
                    var formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    var url = 'https://translate.google.com/?sl=' + item.sl +
                              '&tl=' + item.tl +
                              '&text=' + encodeURIComponent(item.word) +
                              '&op=translate';

                    var escapedWord = escapeHtml(item.word);
                    var countBadge = item.count > 1 ?
                                    '<span class="count-badge">×' + item.count + '</span>' : '';

                    html += '<div class="history-item">' +
                            '<a href="' + url + '" target="_blank">' +
                            '<div>' +
                            '<div class="word">' + escapedWord + countBadge + '</div>' +
                            '<div class="meta">' +
                            '<span class="lang-badge">' + item.sl.toUpperCase() + '</span>' +
                            '<span class="lang-badge">' + item.tl.toUpperCase() + '</span>' +
                            '<span>' + formattedDate + '</span>' +
                            '</div>' +
                            '</div>' +
                            '<span>→</span>' +
                            '</a>' +
                            '<button class="btn-delete" data-word="' + escapedWord + '" ' +
                            'data-sl="' + item.sl + '" data-tl="' + item.tl + '">×</button>' +
                            '</div>';
                }

                return html;
            }

            /**
             * Apply search filter
             * V3.0: NEW - Real-time search
             */
            function applySearch() {
                if (!searchTerm) {
                    filteredHistory = groupedHistory;
                } else {
                    var term = searchTerm.toLowerCase();
                    filteredHistory = groupedHistory.filter(function(item) {
                        return item.word.toLowerCase().indexOf(term) !== -1;
                    });
                }
                updateDisplay();
            }

            /**
             * Update display (render HTML)
             */
            function updateDisplay() {
                var list = document.getElementById('historyList');
                var counter = document.getElementById('totalCount');
                var showingCounter = document.getElementById('showingCount');

                if (list) {
                    list.innerHTML = generateHistoryHTML(filteredHistory);
                }

                if (counter) {
                    counter.textContent = groupedHistory.length;
                }

                if (showingCounter) {
                    showingCounter.textContent = filteredHistory.length;
                }

                // Attach delete button listeners
                attachDeleteListeners();
            }

            /**
             * Attach event listeners to delete buttons
             * Must be called after DOM update
             */
            function attachDeleteListeners() {
                var btns = document.querySelectorAll('.btn-delete');
                for (var i = 0; i < btns.length; i++) {
                    btns[i].addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteWord(
                            this.getAttribute('data-word'),
                            this.getAttribute('data-sl'),
                            this.getAttribute('data-tl')
                        );
                    });
                }
            }

            /**
             * Delete a specific word from history
             * V3.0: NEW - Individual word deletion
             */
            function deleteWord(word, sl, tl) {
                if (!confirm('Delete "' + word + '" (' + sl.toUpperCase() + ' → ' + tl.toUpperCase() + ')?')) {
                    return;
                }

                // Filter out all occurrences of this word+lang combination
                rawHistory = rawHistory.filter(function(item) {
                    return !(item.word === word && item.sl === sl && item.tl === tl);
                });

                // Update localStorage
                setLS('gtranslateHistory', JSON.stringify(rawHistory));

                // Re-group and re-apply current sort
                groupedHistory = groupHistory(rawHistory);
                applySearch();

                // Save current sort mode
                setLS('gtranslateSortMode', currentView);
                applySavedSort();
            }

            /**
             * Sort by date (newest first)
             */
            function sortByDate() {
                groupedHistory.sort(function(a, b) {
                    return new Date(b.lastDate) - new Date(a.lastDate);
                });
                currentView = 'date';
                setLS('gtranslateSortMode', 'date');
                applySearch();
            }

            /**
             * Sort alphabetically (A-Z)
             */
            function sortAlphabetically() {
                groupedHistory.sort(function(a, b) {
                    return a.word.localeCompare(b.word);
                });
                currentView = 'alpha';
                setLS('gtranslateSortMode', 'alpha');
                applySearch();
            }

            /**
             * Sort by usage count (most used first)
             */
            function sortByCount() {
                groupedHistory.sort(function(a, b) {
                    if (b.count !== a.count) {
                        return b.count - a.count;
                    }
                    // If same count, sort by date
                    return new Date(b.lastDate) - new Date(a.lastDate);
                });
                currentView = 'count';
                setLS('gtranslateSortMode', 'count');
                applySearch();
            }

            /**
             * Apply saved sort mode from localStorage
             * V3.0: NEW - Persistent sort order
             */
            function applySavedSort() {
                var savedMode = getLS('gtranslateSortMode') || 'date';
                currentView = savedMode;

                if (savedMode === 'alpha') {
                    sortAlphabetically();
                } else if (savedMode === 'count') {
                    sortByCount();
                } else {
                    sortByDate();
                }
            }

            /**
             * Clear all history
             */
            function clearHistory() {
                if (confirm('Are you sure you want to delete all history?')) {
                    removeLS('gtranslateHistory');
                    removeLS('gtranslateSortMode');
                    rawHistory = [];
                    groupedHistory = [];
                    filteredHistory = [];
                    updateDisplay();
                    alert('✅ History cleared successfully');
                }
            }

            /**
             * Export history to JSON file
             */
            function exportHistory() {
                var dataStr = JSON.stringify(rawHistory, null, 2);
                var blob = new Blob([dataStr], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'gtranslate-history-' + new Date().toISOString().split('T')[0] + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            /**
             * Import history from JSON file
             */
            function importHistory(event) {
                var file = event.target.files[0];
                if (!file) return;

                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        var importedData = JSON.parse(e.target.result);

                        if (!Array.isArray(importedData)) {
                            alert('Invalid file format');
                            return;
                        }

                        // Merge with existing history
                        var combined = rawHistory.concat(importedData);

                        // Remove duplicates
                        var unique = combined.filter(function(item, index, self) {
                            return index === self.findIndex(function(t) {
                                return t.word === item.word &&
                                       t.sl === item.sl &&
                                       t.tl === item.tl &&
                                       t.timestamp === item.timestamp;
                            });
                        });

                        // Sort by timestamp
                        unique.sort(function(a, b) {
                            return new Date(a.timestamp) - new Date(b.timestamp);
                        });

                        setLS('gtranslateHistory', JSON.stringify(unique));
                        rawHistory = unique;
                        groupedHistory = groupHistory(unique);
                        applySavedSort();

                        alert('✅ Import successful: ' + importedData.length + ' entries');
                    } catch (error) {
                        alert('Import error: ' + error.message);
                    }
                };
                reader.readAsText(file);
                event.target.value = '';
            }

            // Initialize
            groupedHistory = groupHistory(rawHistory);
            applySavedSort();

            // Get DOM elements
            var btnSortDate = document.getElementById('btnSortDate');
            var btnSortAlpha = document.getElementById('btnSortAlpha');
            var btnSortCount = document.getElementById('btnSortCount');
            var btnExport = document.getElementById('btnExport');
            var btnImport = document.getElementById('btnImport');
            var importFile = document.getElementById('importFile');
            var btnClear = document.getElementById('btnClear');
            var searchInput = document.getElementById('searchInput');
            var btnClearSearch = document.getElementById('btnClearSearch');

            // Attach event handlers using onclick (not inline HTML)
            // This works because we're in the child window context
            if (btnSortDate) {
                btnSortDate.onclick = sortByDate;
            }
            if (btnSortAlpha) {
                btnSortAlpha.onclick = sortAlphabetically;
            }
            if (btnSortCount) {
                btnSortCount.onclick = sortByCount;
            }
            if (btnExport) {
                btnExport.onclick = exportHistory;
            }
            if (btnImport) {
                btnImport.onclick = function() {
                    if (importFile) {
                        importFile.click();
                    }
                };
            }
            if (importFile) {
                importFile.onchange = importHistory;
            }
            if (btnClear) {
                btnClear.onclick = clearHistory;
            }
            if (searchInput) {
                searchInput.oninput = function() {
                    searchTerm = this.value;
                    applySearch();
                };
            }
            if (btnClearSearch) {
                btnClearSearch.onclick = function() {
                    searchTerm = '';
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    applySearch();
                };
            }
        })();`;

        // Execute code in child window context
        try {
            win.eval(codeToInject);
        } catch (e) {
            console.error('Error injecting code:', e);
        }
    }

    /**
     * Show initial dialog
     * Entry point of the application
     */
    function showInitialDialog() {
        if (shouldShowDialog()) {
            markDialogShown();

            const choice = confirm(
                '🌐 Google Translate Advanced\\n\\n' +
                '✅ OK = Continue normal flow\\n' +
                '❌ Cancel = View history'
            );

            if (choice) {
                performTranslation();
            } else {
                showHistory();
            }
        } else {
            performTranslation();
        }
    }

    // Start the application
    showInitialDialog();
})();
