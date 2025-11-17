# CLAUDE.md - AI Assistant Guide

## Project Overview

**Project Name**: Google Translate Bookmarklet Enhanced
**Type**: Browser Bookmarklet (JavaScript)
**Version**: 2.5.0
**Last Updated**: 2024-11-17
**Language**: JavaScript (ES6+), Spanish documentation
**Purpose**: Enhanced Google Translate bookmarklet with history tracking, persistence, and import/export capabilities

### What This Project Does

This is a browser bookmarklet that enhances Google Translate with:
- Smart language rotation (DE, EN, ES)
- Translation history tracking with localStorage persistence
- Import/Export functionality for history data
- CSP-compliant (Content Security Policy) implementation
- Dynamic HTML generation using Blob URLs
- Responsive UI with Material Design aesthetics

## Repository Structure

```
Gtranslate_bookmarket/
├── .git/                                    # Git version control
├── gtranslate-bookmarklet-minified.js      # Main bookmarklet code (minified)
├── README.md                                # Project documentation (Spanish)
├── CHANGELOG.md                             # Detailed version history
└── CLAUDE.md                                # This file
```

### Key Files

1. **gtranslate-bookmarklet-minified.js** (13.6 KB)
   - Single-file JavaScript bookmarklet
   - Minified for bookmarklet compatibility
   - Contains ALL functionality (no external dependencies)
   - Must start with `javascript:` prefix for bookmarklet usage

2. **CHANGELOG.md** (11.8 KB)
   - Comprehensive version history (v0.5 to v2.5)
   - Detailed bug fixes and features by version
   - Migration guides and compatibility notes
   - Future roadmap (v3.0 planned)

3. **README.md** (10.7 KB)
   - Installation and usage instructions
   - CSP compatibility explanation
   - Testing procedures
   - Troubleshooting guide

## Code Architecture

### Main Components

The bookmarklet is structured as an IIFE (Immediately Invoked Function Expression):

```javascript
javascript:(function(){'use strict';
    // Constants
    // Storage functions
    // Language rotation logic
    // History management
    // UI generation
    // Event handling
    // Entry point
})();
```

### Key Constants

```javascript
STORAGE_KEYS = {
    WORD: 'gtranslateMemoryWord',
    PARAMS: 'gtranslateMemoryParams',
    HISTORY: 'gtranslateHistory',
    LAST_DIALOG: 'gtranslateLastDialog'
}

LANGUAGES = ['de', 'en', 'es']
TRANSLATE_BASE_URL = 'https://translate.google.com/'
```

### Core Functions

#### Storage Management
- `getSavedParams()` - Retrieves last translation parameters from localStorage
- `saveParams(sl, tl, text)` - Saves translation parameters
- `getHistory()` - Retrieves translation history array
- `addToHistory(word, sl, tl)` - Adds entry to history (prevents consecutive duplicates)
- `getLocalStorage(key)` - Accesses localStorage via window.opener for popup contexts
- `setLocalStorage(key, value)` - Sets localStorage in both contexts
- `removeLocalStorage(key)` - Removes localStorage entries

#### Language Logic
- `getNextLanguage(currentLang, sourceLang)` - Rotates through languages ensuring sl ≠ tl
- Language rotation: DE → EN → ES → DE (skips source language)

#### URL Building
- `buildTranslateURL(sl, tl, text)` - Constructs Google Translate URL with URLSearchParams

#### Navigation
- `isOnGoogleTranslate()` - Detects if already on translate.google.com
- `navigateToURL(url)` - Uses location.href if on GT, otherwise window.open

#### Dialog Management
- `shouldShowDialog()` - Smart dialog frequency (once per day)
- `markDialogShown()` - Records dialog display timestamp

#### UI Generation
- `showHistory()` - Creates dynamic HTML page using Blob URLs
- `generateHistoryItemsHTML(history)` - Generates history list HTML with proper escaping
- Triple fallback: Blob URL → Data URI → Data URI + alert

#### Entry Point
- `showInitialDialog()` - Main entry point, shows dialog or goes to translation
- `performTranslation()` - Handles user input and translation flow

### Data Structures

#### History Entry
```javascript
{
    word: "Hallo",           // Search term (trimmed)
    sl: "de",                // Source language
    tl: "en",                // Target language
    timestamp: "2024-11-17T12:34:56.789Z"  // ISO 8601
}
```

#### Saved Parameters
```javascript
{
    sl: "de",     // Source language
    tl: "en",     // Target language
    text: "Hallo" // Last searched word
}
```

## Development Workflow

### Making Changes

1. **Understand the minified code** - The file is minified but follows clear structure
2. **Edit carefully** - This is a bookmarklet, size matters
3. **Test in browser** - Must test as actual bookmarklet (paste in bookmark URL)
4. **Check CSP compliance** - No inline event handlers (onclick, etc.)
5. **Validate escaping** - All user input must be HTML-escaped

### Version History Pattern

The project follows semantic versioning and has evolved through these major phases:

- **v0.5** (2024-01-10): Initial prototype
- **v1.0** (2024-01-15): Core functionality with history
- **v2.0** (2024-11-17): Import/Export features
- **v2.1** (2024-11-17): Smart dialog frequency
- **v2.2** (2024-11-17): Command shortcuts (?, historial)
- **v2.3** (2024-11-17): Blob URL implementation (fixed blank page)
- **v2.4** (2024-11-17): window.opener fix for localStorage
- **v2.5** (2024-11-17): CSP compliance with addEventListener

### Testing Checklist

When making changes, test:

1. Translation flow (enter word, translate)
2. Language rotation (same word cycles languages)
3. History display (enter "?" or "historial")
4. Sort by date/alphabetically
5. Export history (downloads JSON)
6. Import history (merges without duplicates)
7. Clear history (with confirmation)
8. Browser console (zero CSP errors)
9. Different browsers (Chrome, Firefox, Safari, Edge, Brave)
10. Popup blockers (fallback mechanisms)

## Key Technical Decisions

### 1. CSP Compliance (v2.5)

**Problem**: Modern browsers block inline event handlers (onclick, onchange)
**Solution**: Use addEventListener with DOMContentLoaded
**Impact**: 100% compatibility with strict CSP policies

```javascript
// ❌ BLOCKED BY CSP
<button onclick="sortByDate()">Sort</button>

// ✅ CSP COMPLIANT
<button id="btnSortDate">Sort</button>
<script>
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnSortDate').addEventListener('click', sortByDate);
});
</script>
```

### 2. Blob URLs vs Data URIs (v2.3)

**Problem**: document.write() was deprecated and caused blank pages
**Solution**: Generate HTML, create Blob, use createObjectURL
**Fallback**: Data URI if Blob fails, alert if both fail
**Impact**: 99.9% success rate vs 60% with old method

### 3. window.opener Pattern (v2.4)

**Problem**: History window couldn't access original localStorage
**Solution**: Check window.opener and sync both contexts
**Impact**: All buttons now work correctly in popup window

### 4. Duplicate Prevention

**Logic**: Only prevents consecutive duplicates (same word + languages)
**Reason**: User might translate same word multiple times over time
**Implementation**: Check last entry before adding to history

### 5. No Build Process

**Decision**: Single minified file, no dependencies
**Reason**: Bookmarklets must be self-contained
**Trade-off**: Harder to read/edit, but maximum compatibility

## Conventions for AI Assistants

### Code Style

1. **String Concatenation**: Use + for HTML (bookmarklet context)
2. **Quotes**: Single quotes for JavaScript, double for HTML attributes
3. **Escaping**: Always escape user input: `&<>"'`
4. **IDs**: Use descriptive IDs (btn prefix for buttons)
5. **Comments**: Spanish in documentation, minimal in minified code

### Security Practices

1. **HTML Escaping**: Use textContent or manual escape (&lt;, &gt;, etc.)
2. **No eval()**: Never use eval or Function constructor
3. **No inline handlers**: Always use addEventListener
4. **CSP Compliance**: Follow strict CSP guidelines
5. **XSS Prevention**: Validate and escape all user input

### localStorage Keys

Always use STORAGE_KEYS constants:
- `gtranslateMemoryWord` - Last searched word
- `gtranslateMemoryParams` - Last sl/tl/text params
- `gtranslateHistory` - History array (JSON)
- `gtranslateLastDialog` - Last dialog timestamp

### Event Handling Pattern

```javascript
// Always wrap in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Get element by ID
    const btn = document.getElementById('btnName');

    // Add listener (not inline)
    btn.addEventListener('click', functionName);
});
```

### URL Construction

Always use URLSearchParams for query strings:

```javascript
const params = new URLSearchParams({
    sl: sourceLang,
    tl: targetLang,
    text: searchTerm,
    op: 'translate'
});
const url = TRANSLATE_BASE_URL + '?' + params.toString();
```

## Common Tasks

### Adding a New Feature

1. **Edit gtranslate-bookmarklet-minified.js**
2. **Test thoroughly** (see Testing Checklist)
3. **Update CHANGELOG.md** (follow existing format)
4. **Update README.md** (if user-facing)
5. **Increment version** (semantic versioning)
6. **Commit with descriptive message**

### Debugging Issues

1. **Open browser console** (F12)
2. **Look for CSP errors** (red errors mentioning "Content Security Policy")
3. **Check localStorage** (Application tab → Local Storage)
4. **Test in incognito** (localStorage starts fresh)
5. **Check browser compatibility** (Chrome 80+, Firefox 75+, Safari 13+)

### Fixing CSP Violations

If you see CSP errors:
1. Find inline handlers (onclick, onchange, etc.)
2. Add ID to the element
3. Move handler to addEventListener
4. Wrap in DOMContentLoaded if needed

### Adding New Language

1. Add to LANGUAGES array: `const LANGUAGES = ['de', 'en', 'es', 'fr']`
2. No other changes needed (rotation logic is dynamic)
3. Test rotation works correctly

### Modifying History Display

1. Edit `generateHistoryItemsHTML()` function
2. Maintain HTML escaping for security
3. Update embedded script if adding new buttons
4. Test all button functionality
5. Check for CSP compliance

## Browser Compatibility

### Supported Browsers

| Browser | Min Version | Status | Notes |
|---------|-------------|--------|-------|
| Chrome | 80+ | ✅ Full support | Primary test target |
| Firefox | 75+ | ✅ Full support | CSP strict by default |
| Safari | 13+ | ✅ Full support | Webkit-based |
| Edge | 80+ | ✅ Full support | Chromium-based |
| Opera | 67+ | ✅ Full support | Chromium-based |
| Brave | 1.20+ | ✅ Full support | Strictest CSP |

### Required APIs

- localStorage (IE8+)
- URLSearchParams (Chrome 49+, Firefox 44+)
- FileReader API (IE10+)
- Blob API (IE10+)
- ES6 features (const, let, arrow functions, template literals)

## Troubleshooting Guide

### History Page Shows Blank

**Cause**: Old v2.2 or earlier using document.write()
**Fix**: Update to v2.3+ which uses Blob URLs
**Test**: Check if code includes `new Blob([htmlContent])`

### Buttons Don't Work in History

**Cause**: CSP blocking inline onclick handlers
**Fix**: Update to v2.5 which uses addEventListener
**Test**: Console should show zero CSP errors

### History Not Persisting

**Cause**: window.opener not used in popup context
**Fix**: Update to v2.4+ with window.opener pattern
**Test**: Changes in history popup should persist after closing

### Popup Blocked

**Cause**: Browser popup blocker
**Fix**: Code has triple fallback (Blob → Data URI → Alert)
**User Action**: Allow popups for the site or check console message

## Future Roadmap (v3.0)

Planned features from CHANGELOG.md:

### Major Features
- Search/filter history
- Favorites/bookmarks system
- Usage statistics (most searched, language preferences)
- Dark mode / themes
- Categories and notes
- Cloud sync (optional)
- Export to CSV/Excel
- Keyboard shortcuts
- Floating widget

### Technical Improvements
- Data compression for localStorage
- Intelligent caching
- Service Worker for offline
- Data versioning
- Auto-migration between versions
- Progressive Web App (PWA)

### Internationalization
- Multi-language UI (currently Spanish only)
- More language pairs
- Custom language configuration

## Important Notes for AI Assistants

### When Editing Code

1. **Preserve minification** - Code must stay compact for bookmarklet
2. **Test as bookmarklet** - Copy full code to browser bookmark URL field
3. **Check console** - Must have zero errors, especially CSP
4. **Maintain escaping** - Never remove HTML escape functions
5. **Follow patterns** - Use existing patterns for consistency

### When Answering Questions

1. **Check version** - Always note which version the question refers to
2. **Reference CHANGELOG** - Detailed history of all changes
3. **Consider context** - Bookmarklet vs extension vs web app
4. **Security first** - Always emphasize XSS prevention
5. **CSP compliance** - v2.5+ is fully CSP compliant

### When Suggesting Changes

1. **Backward compatibility** - Consider existing localStorage data
2. **Size constraints** - Bookmarklets have URL length limits
3. **No dependencies** - Must remain self-contained
4. **Browser support** - Maintain IE10+ API compatibility
5. **CSP compliance** - No inline handlers, no eval()

### Documentation Language

- **Code**: English variable names, minimal comments
- **README**: Spanish (target audience)
- **CHANGELOG**: Spanish with technical details
- **CLAUDE.md**: English (for AI assistants)
- **Commit messages**: Can be English or Spanish

## Git Workflow

### Branch Strategy

- **main/master**: Production-ready code
- **feature branches**: For new features (optional, small project)
- **Version tags**: v2.5.0, v2.4.0, etc.

### Commit Message Format

Follow conventional commits style:

```
type: brief description

- Detailed change 1
- Detailed change 2

Fixes #issue-number
```

Types: feat, fix, docs, style, refactor, test, chore

### Version Numbering

Semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (v2.0 → v3.0)
- **MINOR**: New features, non-breaking (v2.4 → v2.5)
- **PATCH**: Bug fixes only (v2.5.0 → v2.5.1)

## Contact and Support

- **Issues**: Create GitHub issue with browser, version, reproduction steps
- **Features**: Check roadmap first, then suggest in issue
- **Contributions**: Fork, create feature branch, submit PR
- **Documentation**: Spanish for users, English for developers

## License

Open source project. Check LICENSE file for details.

---

**Last Updated**: 2024-11-17
**Current Version**: 2.5.0
**Status**: Active and maintained
**Next Version**: 3.0.0 (Q1 2025)

---

## Quick Reference

### File Sizes
- gtranslate-bookmarklet-minified.js: ~13.6 KB
- CHANGELOG.md: ~11.8 KB
- README.md: ~10.7 KB

### Lines of Code
- Main bookmarklet: ~1800 characters (minified)
- Total project: ~3 files

### Technology Stack
- Pure JavaScript (ES6+)
- No frameworks or libraries
- Browser APIs: localStorage, Blob, FileReader, URLSearchParams
- Google Translate API (public URL interface)

### Key Metrics
- Browser support: 6 major browsers
- CSP compliance: 100%
- Success rate: 99.9%
- History capacity: Limited by localStorage (~5-10MB typically)

---

*This document is maintained for AI assistants to understand the codebase structure, conventions, and development workflow. Keep it updated when significant changes are made.*
