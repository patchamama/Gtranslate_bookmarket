# 🎯 Quiz Feature - Translation Practice Game

## Overview

The **Practice Quiz** feature helps you review and memorize the words you've looked up. It's a multiple-choice game that tests your translation knowledge.

## How to Access

Three ways to start the quiz:

1. **From the bookmarklet prompt**: Type `quiz` or `practice`
2. **From history window**: Click the "🎯 Practice Quiz" button
3. **Direct command**: Enter `quiz` when prompted for a word

## How It Works

### Game Flow

1. **Random Selection**: Selects words from your history randomly
2. **Multiple Choice**: Shows 4 translation options for each word
3. **Immediate Feedback**:
   - ✅ Green highlight for correct answers
   - ❌ Red highlight for wrong answers (shows correct answer)
4. **Progress Tracking**:
   - Shows current question number
   - Tracks correct/wrong answers in real-time
5. **Final Score**: Displays percentage and congratulatory message

### Quiz Stats

- **Questions**: Up to 10 questions per quiz
- **Options**: 4 choices per question
- **Minimum words**: Need at least 4 unique words in history
- **Randomization**: Questions and options are randomized

### Scoring

```
80-100%: 🎉 Excellent work!
60-79%:  👍 Good job!
0-59%:   📚 Keep practicing!
```

## Requirements

- At least **4 unique words** in your translation history
- Pop-ups must be enabled (quiz opens in new window)
- JavaScript enabled

## Features

### Visual Feedback

- **Correct Answer**: Green pulse animation
- **Wrong Answer**: Red shake animation + shows correct answer
- **Real-time Stats**: Live counter for correct/wrong answers

### Quiz Interface

```
┌─────────────────────────────┐
│   🎯 Translation Quiz       │
│   Test your knowledge!      │
├─────────────────────────────┤
│ Question: 3/10              │
│ Correct: 2  Wrong: 1        │
├─────────────────────────────┤
│                             │
│         distributed         │
│         EN → ES             │
│                             │
│  ┌─────────────────────┐   │
│  │   distribuido       │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   distribución      │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   distribuir        │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   distribuidora     │   │
│  └─────────────────────┘   │
│                             │
│  [Next Question →]          │
└─────────────────────────────┘
```

## Technical Details

### localStorage Tracking

Stores quiz statistics in `unifiedQuizStats`:

```json
{
  "total": 50,      // Total questions answered
  "correct": 42     // Total correct answers
}
```

### Algorithm

1. **Word Selection**: Random from grouped history
2. **Option Generation**:
   - 1 correct answer
   - 3 random wrong answers from other words
3. **Shuffle**: Fisher-Yates algorithm for randomization
4. **Validation**: Ensures 4 unique options

## Usage Examples

### Example 1: Starting Quiz from Prompt

```
Click bookmark
→ Enter "quiz"
→ Quiz window opens with 10 questions
```

### Example 2: From History Window

```
Click bookmark
→ Press Cancel (or enter "?")
→ Click "🎯 Practice Quiz" button
→ Quiz starts
```

### Example 3: Not Enough Words

```
If history has < 4 words:
→ Shows alert: "You need at least 4 words in your history to practice!"
```

## Benefits

✅ **Active Recall**: Tests memory instead of passive review
✅ **Spaced Repetition**: Natural review of previously searched words
✅ **Immediate Feedback**: Learn correct answers instantly
✅ **Gamification**: Makes learning fun and engaging
✅ **Progress Tracking**: See improvement over time

## Tips for Best Results

1. **Build History First**: Search at least 10-20 words before quizzing
2. **Regular Practice**: Take a quiz every few days
3. **Review Mistakes**: Pay attention to wrong answers
4. **Vary Difficulty**: Mix easy and hard words in your searches
5. **Use Both Services**: Search same words in Google Translate and WordReference

## Future Enhancements

Planned features for v2.0:

- [ ] Difficulty levels (easy/medium/hard)
- [ ] Timed mode (speed challenge)
- [ ] Reverse quiz (target language → source language)
- [ ] Custom quiz length
- [ ] Filter by language pair
- [ ] Daily challenges
- [ ] Leaderboard/high scores
- [ ] Export quiz results

## Troubleshooting

### "You need at least 4 words"

**Problem**: Not enough words in history
**Solution**: Search more words first, then try quiz

### Quiz window is blank

**Problem**: Pop-up blocked
**Solution**: Allow pop-ups for the site

### Options not clickable

**Problem**: JavaScript disabled
**Solution**: Enable JavaScript in browser settings

### Same questions repeated

**Problem**: Limited word pool
**Solution**: Add more words to history for variety

---

**Happy Learning!** 🚀📚
