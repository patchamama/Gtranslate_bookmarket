# 🎮 Quiz Implementation Guide - Translation Practice

## Overview

The quiz feature uses **smart option generation** from your existing translation history - no API keys needed!

---

## How Quiz Options Are Generated

### Intelligent Option Selection

Instead of using external APIs, the quiz creates realistic multiple-choice options using words from your own history:

```javascript
function getRandomOptions(correctWord, allWords) {
    // 1. Add the correct answer
    const options = [correctWord];

    // 2. Filter other words with same language pair
    const otherWords = allWords.filter(w =>
        w.word !== correctWord.word &&
        w.sl === correctWord.sl &&
        w.tl === correctWord.tl
    );

    // 3. Randomly select 3 wrong answers
    while (options.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        options.push(otherWords.splice(randomIndex, 1)[0]);
    }

    // 4. Shuffle all options
    return shuffle(options);
}
```

### Why This Works Better Than APIs

✅ **No API Key Required** - Works completely offline
✅ **Realistic Options** - Uses words you actually searched
✅ **Context-Aware** - Options match the language pair
✅ **Privacy** - No external API calls
✅ **Free** - No API usage costs
✅ **Fast** - Instant response
✅ **Personalized** - Based on YOUR vocabulary

---

## Quiz Generation Example

### Your History:
```json
[
  {"word": "hello", "sl": "en", "tl": "es"},
  {"word": "goodbye", "sl": "en", "tl": "es"},
  {"word": "thank you", "sl": "en", "tl": "es"},
  {"word": "please", "sl": "en", "tl": "es"},
  {"word": "yes", "sl": "en", "tl": "es"}
]
```

### Generated Quiz Question:

```
┌─────────────────────────────┐
│ Question 1/10               │
├─────────────────────────────┤
│         hello               │
│         EN → ES             │
│                             │
│  [ ] gracias                │  ← from "thank you"
│  [ ] hola           ✓       │  ← CORRECT
│  [ ] por favor              │  ← from "please"
│  [ ] adiós                  │  ← from "goodbye"
└─────────────────────────────┘
```

All options are **real words from your history**, making the quiz feel natural and relevant to your learning!

---

## Command Integration

### Accessing the Quiz

**Method 1: Direct Command**
```
Click bookmarklet
→ Enter "quiz"
→ Quiz starts
```

**Method 2: From History Window**
```
Click bookmarklet
→ Press Cancel or enter "?"
→ Click "🎯 Practice Quiz" button
→ Quiz starts
```

### Quiz Flow

```
1. User enters "quiz" command
   ↓
2. Check minimum words (4 required)
   ↓
3. Group history by word
   ↓
4. Generate quiz window
   ↓
5. Show first question
   ↓
6. User selects answer
   ↓
7. Show feedback (correct/wrong)
   ↓
8. Next question or final score
```

---

## Modified Functions

### 1. performTranslation() - Updated

```javascript
function performTranslation() {
    const userInput = prompt('Word to translate:\n(Empty, "history", "?" or "quiz")');
    const trimmedInput = userInput.trim().toLowerCase();

    // NEW: Quiz detection
    if (trimmedInput === 'quiz' || trimmedInput === 'practice') {
        startQuiz();
        return;
    }

    // Existing history detection
    if (trimmedInput === '' || trimmedInput === 'history' || trimmedInput === '?') {
        showHistory();
        return;
    }

    // Normal translation flow...
}
```

### 2. startQuiz() - NEW

```javascript
function startQuiz() {
    const history = getHistory();

    // Validate minimum words
    if (history.length < 4) {
        alert('You need at least 4 words in your history to practice!');
        return;
    }

    // Group and validate
    const groupedHistory = groupHistory(history);
    if (groupedHistory.length < 4) {
        alert('You need at least 4 unique words to practice!');
        return;
    }

    // Launch quiz window
    showQuizWindow(groupedHistory);
}
```

### 3. showQuizWindow() - NEW

```javascript
function showQuizWindow(words) {
    const htmlContent = generateQuizHTML();

    try {
        const blob = new Blob([htmlContent], {type: 'text/html'});
        const blobURL = URL.createObjectURL(blob);
        const quizWindow = window.open(blobURL, '_blank', 'width=800,height=600');

        if (quizWindow) {
            setTimeout(() => injectQuizScripts(quizWindow, words), 300);
        } else {
            alert('Please allow popups for the quiz!');
        }
    } catch(error) {
        alert('Could not open quiz: ' + error.message);
    }
}
```

### 4. generateQuizHTML() - NEW

Creates the complete quiz interface with:
- Header with title and emoji
- Stats bar (Question X/10, Correct: Y, Wrong: Z)
- Question display area
- 4 option buttons
- Result message area
- Controls (Next/Finish buttons)
- Animations (pulse for correct, shake for wrong)

### 5. injectQuizScripts() - NEW

Implements all quiz logic:
- `getRandomOptions()` - Generate 4 options from history
- `showQuestion()` - Display current question
- `checkAnswer()` - Validate user selection
- `nextQuestion()` - Advance to next question
- `showFinalScore()` - Display results
- `escapeHtml()` - Security (prevent XSS)

---

## Storage Keys

### New Quiz Storage

```javascript
const STORAGE_KEYS = {
    // Existing keys...
    QUIZ_STATS: 'gtranslateQuizStats'  // NEW
};
```

### Quiz Statistics Format

```json
{
  "total": 50,          // Total questions answered all-time
  "correct": 42,        // Total correct answers all-time
  "lastScore": 8,       // Score from last quiz (0-10)
  "lastPercentage": 80, // Percentage from last quiz
  "gamesPlayed": 5,     // Number of quizzes completed
  "bestScore": 10,      // Highest score achieved
  "bestPercentage": 100 // Highest percentage achieved
}
```

---

## Quiz Scoring

### Difficulty Levels (Auto-detected)

Based on your history size:

| History Words | Difficulty | Description |
|---------------|------------|-------------|
| 4-10 | ⭐ Easy | Limited options, easier to guess |
| 11-25 | ⭐⭐ Medium | More variety in wrong answers |
| 26-50 | ⭐⭐⭐ Hard | Many distractors |
| 51+ | ⭐⭐⭐⭐ Expert | Maximum challenge |

### Performance Ratings

```
90-100%: 🏆 Perfect! Outstanding!
80-89%:  🎉 Excellent! Great work!
70-79%:  👍 Good! Well done!
60-69%:  👌 Not bad! Keep practicing!
0-59%:   📚 Keep studying! You'll improve!
```

---

## Advanced: Optional Google Translate API Integration

### Why You Might Want This

The default quiz uses words from your history as distractors. If you want **programmatically generated wrong answers** from Google Translate, you can integrate the API.

### Setup (Optional - Advanced Users)

**Requirements:**
- Google Cloud account
- Google Translate API key
- Additional cost (~$20/1M characters)

**Implementation:**

```javascript
// Add API configuration
const GOOGLE_TRANSLATE_API_KEY = 'YOUR_API_KEY_HERE';  // User must provide
const USE_API_DISTRACTORS = false;  // Set to true to enable

// Modified getRandomOptions()
async function getRandomOptions(correctWord, allWords) {
    if (USE_API_DISTRACTORS && GOOGLE_TRANSLATE_API_KEY) {
        return await getAPIDistractors(correctWord);
    } else {
        return getHistoryDistractors(correctWord, allWords);
    }
}

// NEW: API-based distractors
async function getAPIDistractors(correctWord) {
    const relatedWords = [
        correctWord.word + 's',      // Plural
        correctWord.word + 'ing',    // Gerund
        'to ' + correctWord.word,    // Infinitive
    ];

    const translations = await Promise.all(
        relatedWords.map(word =>
            translateWithAPI(word, correctWord.sl, correctWord.tl)
        )
    );

    return shuffle([correctWord.word, ...translations]);
}

// API call function
async function translateWithAPI(text, sl, tl) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            q: text,
            source: sl,
            target: tl
        })
    });
    const data = await response.json();
    return data.data.translations[0].translatedText;
}
```

**Pros of API Integration:**
- More linguistically accurate distractors
- Can generate related word forms
- Professional-grade options

**Cons of API Integration:**
- Requires API key and payment
- Slower (network requests)
- Needs internet connection
- Privacy concerns (sends data to Google)
- More complex code

**Recommendation:**
👉 **Use history-based options** (default) for 99% of users. The API integration is only worth it for advanced educational applications or research projects.

---

## Quiz Statistics Dashboard (Future Enhancement)

### Planned Features

```javascript
function showQuizStats() {
    const stats = JSON.parse(localStorage.getItem('gtranslateQuizStats'));

    return `
    📊 Your Quiz Statistics
    ─────────────────────────
    Games Played: ${stats.gamesPlayed}
    Total Questions: ${stats.total}
    Correct Answers: ${stats.correct}
    Overall Accuracy: ${Math.round(stats.correct/stats.total*100)}%

    Best Score: ${stats.bestScore}/10 (${stats.bestPercentage}%)
    Last Score: ${stats.lastScore}/10 (${stats.lastPercentage}%)

    Keep practicing! 🎯
    `;
}
```

Access with: Enter "stats" in the prompt

---

## Testing the Quiz

### Test Checklist

- [ ] Minimum words validation (< 4 words shows alert)
- [ ] Quiz window opens correctly
- [ ] First question displays with 4 options
- [ ] Correct answer shows green pulse animation
- [ ] Wrong answer shows red shake + highlights correct
- [ ] Counter updates correctly (Question X/10)
- [ ] All 10 questions complete
- [ ] Final score displays correctly
- [ ] Try Again button reloads quiz
- [ ] Close button closes window
- [ ] Statistics save to localStorage

---

## Troubleshooting

### "You need at least 4 words"

**Problem:** Not enough words in history
**Solution:** Search more words before trying quiz

### Quiz window is blank

**Problem:** Popup blocked
**Solution:** Allow popups for the site

### Same questions every time

**Problem:** Small history
**Solution:** Add more variety to your search history

### Options look similar

**Problem:** Searching similar words
**Solution:** This is normal! Makes quiz more challenging

---

## Future Enhancements

### v3.3.0 Roadmap

- [ ] Difficulty settings (easy/medium/hard)
- [ ] Custom quiz length (5/10/20 questions)
- [ ] Reverse mode (show translation, guess original)
- [ ] Timed mode (speed challenge)
- [ ] Filter by language pair
- [ ] Image-based questions (future)
- [ ] Audio pronunciation (future)
- [ ] Streak tracking
- [ ] Daily challenges
- [ ] Achievements system

---

## Summary

✅ **Quiz uses your translation history** for options
✅ **No API keys needed** - works offline
✅ **Realistic and personalized** to your vocabulary
✅ **Fast and free** - instant generation
✅ **Privacy-friendly** - no external calls
✅ **Easy to implement** - pure JavaScript

The quiz feature makes learning translations fun and interactive, using YOUR own words to create a personalized practice experience!

---

**Ready to practice? Type "quiz" and start learning!** 🎯📚
