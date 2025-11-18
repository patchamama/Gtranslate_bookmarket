# Changelog - WordReference Bookmarklet

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2024-11-17 🎉 INITIAL RELEASE

### 🌍 Major Features

- **WordReference Integration**: Full integration with WordReference.com URL format
- **Word-Only Grouping**: Words group by word only, ignoring language pairs
- **Complete English UI**: All interface, messages, and prompts in English
- **Persistent Sort Order**: Sort preference saved in localStorage across sessions
- **Real-Time Search**: Instant word filtering as you type
- **Individual Word Deletion**: Delete specific words with × button
- **Auto-Refresh**: Interface updates automatically after all actions

### ✨ Core Features

**URL Format:**
- WordReference URL pattern: `https://www.wordreference.com/{sl}{tl}/{word}`
- Supported languages: EN, ES, DE, FR (lowercase in URL)
- Example: `https://www.wordreference.com/enes/distributed`

**Word Grouping:**
- Groups by word only (not word+language combination)
- Counter badge (×N) shows total searches across all languages
- Language badges display most recent translation pair
- Example: "hello" EN→ES + "hello" EN→DE = "hello" ×2

**Search & Filter:**
- 🔍 Real-time search box with instant filtering
- ✕ Clear search button
- Shows "Unique words: X | Showing: Y" stats
- Case-insensitive matching
- Filters across all sorted data

**Individual Deletion:**
- × button next to each word
- Confirmation dialog before delete
- Removes all occurrences of word (all language combinations)
- Auto-updates display after deletion

**Persistent Sorting:**
- New localStorage key: `wordrefSortMode`
- Saves current sort mode (date/alpha/count)
- Restores saved sort on next history open
- Persists across browser sessions

**Data Management:**
- Export: Downloads `wordreference-history-YYYY-MM-DD.json`
- Import: Merges history from JSON file with auto-deduplication
- Clear All: Deletes entire history with confirmation
- Individual delete: Removes specific words with × button

### 🔧 Technical Implementation

**localStorage Keys:**
- `wordrefMemoryWord` - Last searched word
- `wordrefMemoryParams` - Last sl/tl/text params
- `wordrefHistory` - History array (JSON)
- `wordrefLastDialog` - Last dialog timestamp
- `wordrefSortMode` - Current sort mode

**Event Handling:**
- Using addEventListener (not inline HTML)
- Event handlers in child window context
- All handlers execute with proper scope
- Zero CSP violations

**Security:**
- TrustedHTML policy for innerHTML assignment
- Triple-layer fallback: TrustedTypes → defaultPolicy → createElement
- HTML escaping for all user input
- No eval() usage
- CSP compliant

**Functions:**
- `groupHistory()` - Groups by word only
- `buildWordReferenceURL()` - Builds URL with {sl}{tl}/{word} format
- `applySearch()` - Filters grouped history by search term
- `attachDeleteListeners()` - Attaches delete button handlers
- `deleteWord()` - Deletes all occurrences of a word
- `applySavedSort()` - Restores saved sort preference
- `updateDisplay()` - Updates UI with TrustedHTML support

### 🎨 UI/UX

**Color Scheme:**
- Primary: WordReference orange (#f05a28)
- Gradient: #f05a28 → #ec1c24
- Accent: Orange tones throughout
- Badges: Orange for languages, red for counter

**UI Elements:**
- Search box with placeholder "🔍 Search words..."
- Clear search button (✕)
- Stats showing "Unique: X | Showing: Y"
- Delete button (×) per word
- Responsive design (mobile-friendly)

**Messages:**
- "WordReference Advanced" in dialog
- "WordReference History" page title
- "All your WordReference searches" subtitle
- Confirmation: "Delete all occurrences of {word}?"

### 🆚 Comparison with Google Translate Version

| Feature | Google Translate | WordReference |
|---------|-----------------|---------------|
| URL Format | Query params | Path-based |
| Languages | de, en, es | en, es, de, fr |
| URL Example | `?sl=de&tl=en&text=word` | `enes/word` |
| Default Pair | DE→EN | EN→ES |
| Color Scheme | Purple/Blue | Orange/Red |
| localStorage Prefix | `gtranslate` | `wordref` |

### 📝 Migration Guide

**Not applicable** - This is the initial release.

**For users of Google Translate version:**
- This is a separate bookmarklet
- Uses different localStorage keys (no conflict)
- Can be used alongside Google Translate version
- Same functionality, different service

### 🎯 Breaking Changes

**None** - Initial release.

---

## Future Roadmap (v2.0)

Planned features:

### Major Features
- Phrase detection (multi-word translations)
- Conjugation tables integration
- Forum entries display
- Pronunciation audio playback
- Language preference per word type

### Technical Improvements
- Offline mode with service worker
- Data compression for localStorage
- Auto-migration between versions
- Progressive Web App (PWA)
- Keyboard shortcuts

### Internationalization
- Multi-language UI (currently English only)
- More language pairs (IT, PT, RU, etc.)
- Custom language configuration
- Regional variants (EN-US, EN-GB, ES-ES, ES-MX)

---

## Notes

### Architecture Decisions

**Why path-based URLs?**
- WordReference uses `/{sl}{tl}/{word}` format natively
- Simpler URL construction than query parameters
- Direct match with WordReference's routing

**Why EN→ES default?**
- Most common language pair on WordReference
- Matches typical user flow (English speakers learning Spanish)
- Can be changed by user after first search

**Why word-only grouping from v1.0?**
- Learned from Google Translate version evolution
- User feedback indicated preference for total counts
- Simpler mental model (one word = one entry)

### Known Limitations

- Requires localStorage enabled
- Limited to 4 languages (EN, ES, DE, FR)
- No support for special WordReference features (conjugations, forum)
- Cannot detect if already on WordReference page

### Browser Specific Notes

**Safari:**
- May show security warning on first use (normal for bookmarklets)
- Allow popups for best experience
- Trusted Types fallback works correctly

**Firefox:**
- CSP strict by default (fully compatible)
- TrustedHTML policy supported in recent versions
- Popup blocker may need adjustment

**Mobile Browsers:**
- Responsive UI works on mobile
- Bookmarklets harder to use on mobile (browser limitation)
- Consider desktop usage primarily

---

**Last Updated**: 2024-11-17
**Current Version**: 1.0.0
**Status**: Stable and production-ready
**Next Version**: 2.0.0 (TBD)

---

*This is a companion project to the Google Translate Bookmarklet Enhanced. Both can be used simultaneously without conflicts.*
