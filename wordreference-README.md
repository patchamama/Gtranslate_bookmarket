# WordReference Bookmarklet Enhanced

> A powerful browser bookmarklet that enhances WordReference with history tracking, smart language rotation, and advanced features.

**Version:** 1.0.0
**Last Updated:** 2024-11-17
**Language:** JavaScript (ES6+)
**Status:** ✅ Production Ready

---

## ✨ Features

### Word-Only Grouping

- **📊 Language-Agnostic Grouping** - Words group by word only, ignoring language pairs
- **🔢 Total Counter** - Counter badge (×N) shows total searches across ALL languages
- **🌐 Recent Languages Displayed** - Language badges show most recent translation pair
- **🗑️ Simplified Delete** - Delete button removes ALL occurrences of a word

**Example:**
```
Before grouping:
- "distributed" EN→ES (×3)
- "distributed" EN→DE (×2)
- "distributed" ES→EN (×1)

After grouping:
- "distributed" (×6) [Shows most recent: ES→EN]
```

### Core Functionality

- **Smart Language Rotation**: Automatically rotates between EN → ES → DE → FR
- **Translation History**: Tracks all your WordReference searches
- **Persistent Storage**: Uses localStorage for data persistence
- **Repetition Counter**: Groups words (ignoring languages) and shows total usage count (×N badge)
- **CSP Compliant**: 100% compatible with strict Content Security Policies

### Advanced Features

- **Three Sort Modes**:
  - 🕐 **By Date**: Newest first (default)
  - 🔤 **A-Z**: Alphabetical order
  - 🔢 **By Usage**: Most searched words first

- **Search & Filter**:
  - Real-time search as you type
  - Case-insensitive matching
  - Shows filtered count vs total count

- **Data Management**:
  - **Export**: Download history as JSON file
  - **Import**: Merge history from JSON file (auto-deduplicates)
  - **Individual Delete**: Remove specific words with × button
  - **Clear All**: Delete entire history with confirmation

### User Experience

- Material Design aesthetics with WordReference orange branding
- Responsive UI (mobile-friendly)
- Hover effects and smooth animations
- Empty state with helpful message
- Popup blocker fallback mechanisms

---

## 📥 Installation

### Step 1: Copy the Bookmarklet Code

Use this file:
- **`wordreference-bookmarklet-minified.js`** - Production version

### Step 2: Create the Bookmark

#### Chrome / Edge / Brave

1. Press `Ctrl+Shift+O` (Windows/Linux) or `Cmd+Option+B` (Mac) to open Bookmarks Manager
2. Click **"Add new bookmark"** or right-click → **"Add new bookmark"**
3. **Name**: `WordRef Advanced` (or any name you prefer)
4. **URL**: Paste the **entire code** from `wordreference-bookmarklet-minified.js`
   - **IMPORTANT**: The code must start with `javascript:`
5. Click **Save**

#### Firefox

1. Press `Ctrl+Shift+O` (Windows/Linux) or `Cmd+Shift+O` (Mac) to open Library
2. Go to **Bookmarks** → Click **"Add Bookmark"** button in toolbar
3. **Name**: `WordRef Advanced`
4. **Location**: Paste the **entire code** from `wordreference-bookmarklet-minified.js`
5. Click **Add**

#### Safari

1. Show bookmarks bar: `View` → `Show Favorites Bar`
2. Drag any link to the bookmarks bar (temporary)
3. Right-click the bookmark → **Edit Name**
4. **Name**: `WordRef Advanced`
5. Right-click again → **Edit Address**
6. **URL**: Paste the **entire code** from `wordreference-bookmarklet-minified.js`
7. Press Enter to save

---

## 🚀 Usage

### Basic Translation

1. Click the **WordRef Advanced** bookmark
2. Enter a word to translate (or press Cancel to view history)
3. Opens WordReference with the translation

### Language Rotation

- **First search**: Uses default languages (EN→ES)
- **Same word again**: Rotates target language (EN→ES → EN→DE → EN→FR)
- **Different word**: Keeps last language pair

### View History

Three ways to access:
1. Click bookmark → Press **Cancel** (or Enter empty)
2. Click bookmark → Type `?` → Enter
3. Click bookmark → Type `history` → Enter

### Sort Your History

- **🕐 By Date**: Most recent searches first (default)
- **🔤 A-Z**: Alphabetical order
- **🔢 By Usage**: Most frequently searched words first

**Sort preference is saved** - reopening history will use your last choice.

### Search/Filter

Type in the search box to instantly filter words. Shows matching count vs total count.

### Export/Import

- **Export**: Downloads `wordreference-history-YYYY-MM-DD.json`
- **Import**: Click Import → Select JSON file → Auto-merges and deduplicates

### Delete Words

- **Individual**: Click × next to any word (deletes all language combinations)
- **Clear All**: Click "Clear All" button (asks for confirmation)

---

## 🔧 URL Format

WordReference uses the format:
```
https://www.wordreference.com/{sl}{tl}/{word}
```

Where:
- `{sl}` = Source language (en, es, de, fr)
- `{tl}` = Target language (en, es, de, fr)
- `{word}` = Word to translate

**Examples:**
- EN→ES: `https://www.wordreference.com/enes/distributed`
- ES→EN: `https://www.wordreference.com/esen/distribuido`
- DE→FR: `https://www.wordreference.com/defr/verteilt`

---

## 💾 Technical Details

### localStorage Keys

The bookmarklet uses these localStorage keys:

| Key | Purpose |
|-----|---------|
| `wordrefMemoryWord` | Last searched word |
| `wordrefMemoryParams` | Last source/target languages and word |
| `wordrefHistory` | Complete history array (JSON) |
| `wordrefLastDialog` | Last dialog timestamp (for once-per-day prompt) |
| `wordrefSortMode` | Current sort mode (date/alpha/count) |

### Supported Languages

- **EN** - English
- **ES** - Spanish
- **DE** - German
- **FR** - French

### Browser Compatibility

| Browser | Min Version | Status |
|---------|-------------|--------|
| Chrome | 80+ | ✅ Full support |
| Firefox | 75+ | ✅ Full support |
| Safari | 13+ | ✅ Full support |
| Edge | 80+ | ✅ Full support |
| Brave | 1.20+ | ✅ Full support |

### Security Features

- ✅ **CSP Compliant** - No inline event handlers
- ✅ **XSS Protection** - All user input is HTML-escaped
- ✅ **Trusted Types** - Support for strict CSP policies
- ✅ **No External Dependencies** - Self-contained code
- ✅ **localStorage Only** - No server communication

---

## 🐛 Troubleshooting

### History window is blank

**Solution**: Update to latest version with Blob URL support and TrustedHTML policy.

### Buttons don't work

**Solution**: Version 1.0.0 uses addEventListener pattern - update your bookmarklet code.

### Popup blocked

**Solution**: Allow popups for the site, or check browser console for fallback data URI.

### History not persisting

**Solution**: Check if localStorage is enabled in your browser settings.

---

## 📝 Version History

### v1.0.0 (2024-11-17)

**Initial Release:**
- ✅ Word-only grouping (ignoring language pairs)
- ✅ Full English UI
- ✅ Persistent sort order
- ✅ Real-time search/filter
- ✅ Individual word deletion
- ✅ Import/Export functionality
- ✅ CSP compliance with Trusted Types
- ✅ Four language support (EN, ES, DE, FR)

---

## 📄 License

Open source project. Free to use and modify.

---

## 🙏 Acknowledgments

Based on the Google Translate Bookmarklet Enhanced architecture, adapted for WordReference.

---

**Made with ❤️ for language learners**
