# 🎓 Presentation Preparation Assistant
> **A Web-based AI Coach & Presentation Practice System tailored for 3rd-Year Computer Engineering Students.**

---

## 📌 Overview

**Presentation Preparation Assistant** is specifically built to solve the anxiety and preparation challenges faced by 3rd-year Computer Engineering students preparing for **Technical Seminars, Capstone/Mini-Project Presentations, and University External Viva Voce**.

Unlike generic slide makers, this tool focuses **100% on presentation preparation, delivery scripts, and live practice—NOT PowerPoint generation**. It gives students the words to say, the confidence to say them, and the technical depth required to impress strict external examiners.

---

## 🚀 Key Features

### 1. 🎯 Explaining Any Topic in Simple English
- **Real-World Analogies**: Everyday intuition (e.g., Raft consensus explained like friends agreeing on a movie; Docker containers compared to hotel rooms vs houses; TCP vs QUIC compared to cargo trucks vs drones).
- **Core Engineering Problem**: Unpacks *why* the technology was invented and what legacy bottleneck it solved.
- **Three Technical Pillars**: Deconstructs complex topics into 3 clear conceptual pillars.
- **Mental Model Flow**: Visual step-by-step state machine representation.
- **Examiner's Main Focus**: Tells you what professors will be listening for.

### 2. 📑 Slide-Wise Speaking Points & Easy Scripts
- **Slide-by-Slide Outline**: Covers Title/Hook, Problem Statement, Architecture, Core Algorithm, Trade-offs & Limitations, Real-World Systems, and Conclusion.
- **What's On The Slide vs What You SAY**: Separates sparse bullet points from fluent, conversational spoken English scripts (60–90 seconds each).
- **Stage & Visual Cues**: Explicit directions on where to point on diagrams and when to pause.
- **Examiner Trap Alerts**: Warns you about the exact questions examiners ask on each slide.
- **Audio Narration (Text-to-Speech)**: Listen to the script spoken aloud to learn cadence and pronunciation.
- **Rehearsal Teleprompter**: Full-screen teleprompter with auto-scroll and pace tracking.

### 3. 🎤 Interactive Presentation Practice & Mock Viva
- **Simulated University External Examiner**: Poses sharp, tricky questions designed to test real understanding.
- **Dual Input Modes**:
  - **Speech-to-Text (Microphone)**: Speak naturally into your mic using the Web Speech Recognition API with live audio feedback.
  - **Text Input**: Type your answer for quick drills.
- **Instant AI Evaluation**:
  - Overall score out of 10.
  - 4-Dimension Rubric: *Technical Accuracy*, *Clarity & Grammar*, *Technical Depth*, *Confidence & Tone*.
  - **Strengths Identified**: Green badges highlighting good reasoning.
  - **Examiner Critiques / Missing Keywords**: Direct feedback on missing technical terms.
  - **Model High-Scoring Benchmark Answer**: Shows exactly how a top-ranking student would answer.
- **Score History**: Tracks your progress across practice rounds.

### 4. ❓ Important Viva Questions & Answers
- **4 Categorized Question Tiers**:
  - 🎓 *Fundamental Concepts* (warm-up questions)
  - ⚠️ *Examiner Traps & Edge Cases* (questions designed to catch rote learners)
  - ⚖️ *Trade-offs & Comparisons* ("Why X over Y?", "When NOT to use this?")
  - 💻 *Real-World Systems & Architecture* (scale, recovery, bottlenecks)
- **Examiner's Intent**: Explains *why* the professor asks each question and what keywords they are listening for.
- **Flashcard Study Mode**: Test yourself by hiding answers, then clicking to reveal.

### 5. ⚡ Quick Revision & Cheat Sheet
- **60-Second Elevator Pitch**: Memorizable 1-minute summary for when professors say: *"Quickly explain your topic in 60 seconds"*.
- **High-Yield "Must-Know" Checklist**: 6 non-negotiable points.
- **Common Examiner Gotchas**: Things students frequently get wrong.
- **Terminology Glossary**: Quick reference table of technical terms and definitions.
- **Print & PDF Ready**: Dedicated print stylesheet formatted cleanly for last-minute review outside the seminar hall.

### 6. 💡 Delivery Tips & Scripts
- **How to Start**: 3 hooks (Real-world crisis hook, legacy contrast hook, confident direct hook).
- **How to Explain Complex Diagrams**: The **3-Step Pointer Technique** (*Orient* $\rightarrow$ *Trace Happy Path* $\rightarrow$ *Highlight Failover/Bottleneck*).
- **Handling Questions When You Don't Know**: The *Professional Engineer Script* that shows calm reasoning and earns marks without guessing or freezing.
- **How to End with Impact**: Memorable closing statements that transition cleanly into Q&A.

### 7. 💬 Embedded AI Coach Assistant
- Floating conversational assistant accessible from any tab.
- Quick prompt chips: *"Give me an opening hook"*, *"Give me an analogy"*, *"Explain my diagram"*, *"What if I get stuck?"*.

---

## 🛠️ Dual-Engine Architecture

1. **Built-in Offline Computer Engineering Intelligence Engine (Default)**:
   - Works **100% locally and offline** without requiring any API keys or internet connection.
   - Includes curated 3rd-year CE seminar topics (*Raft Consensus, Docker & Container Internals, Transformers & Self-Attention, Database Sharding, TCP vs QUIC, Instruction Pipelining & Branch Hazards, etc.*).
   - Features an intelligent **Domain Synthesizer** that dynamically generates scripts, viva traps, and analogies for **any custom Computer Science topic or mini-project** entered by the student.
2. **Optional Live Cloud AI (Google Gemini API)**:
   - In the **Settings Modal** (⚙️ top right), students can plug in their free Google Gemini API Key.
   - Calls `gemini-1.5-flash` or `gemini-2.0-flash` for unbounded custom topics and dynamic viva feedback.
   - Keys are stored securely in browser `localStorage` and never transmitted anywhere else.

---

## 🏃 How to Run

### Method 1: Direct Browser Launch (Easiest)
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Brave, Firefox):
```plaintext
c:\Users\Admin\Downloads\presentation assistent\index.html
```

### Method 2: Local Server via PowerShell
Open PowerShell in the project directory and run:
```powershell
.\start-server.ps1
```
This starts a lightweight server at `http://localhost:8080` and opens your default browser automatically.

---

## 💻 Tech Stack
- **HTML5 & Vanilla JavaScript (ES6+)**: Zero external build dependencies, instant loading.
- **Tailwind CSS**: Modern, responsive layout with glassmorphic engineering theme.
- **Lucide Icons**: Crisp modern iconography.
- **Web Speech API**: Integrated Speech Synthesis (Text-to-Speech) and Speech Recognition (Speech-to-Text).
- **Canvas Confetti**: Celebratory feedback for high scores in mock viva.
