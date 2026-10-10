/**
 * Presentation Preparation Assistant - Application Logic
 * Coordinates UI tabs, rendering, speech, practice evaluation, and coach chatbot.
 */

// Global State
let aiService = null;
let practiceEngine = null;
let currentTopicData = null;
let activePracticeQuestion = null;
let isRehearsalTimerRunning = false;
let isTeleprompterScrolling = false;
let currentVivaFilter = 'all';

// Initialize application on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  aiService = new AIService();
  practiceEngine = new PracticeEngine();

  // Initialize theme from storage
  const savedTheme = localStorage.getItem("ppa_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Load initial topic (Raft Consensus by default)
  await loadTopic("Raft Consensus Algorithm");

  // Load practice history
  renderPracticeHistory();

  // Load settings into modal inputs
  initSettingsValues();
});

/**
 * Loads and renders a topic across all tabs
 */
async function loadTopic(topicName) {
  showLoadingToast(`Preparing presentation package for "${topicName}"...`);
  
  try {
    const config = {
      duration: document.getElementById("config-duration")?.value || "10",
      audience: document.getElementById("config-audience")?.value || "examiner",
      depth: document.getElementById("config-depth")?.value || "balanced"
    };

    currentTopicData = await aiService.preparePresentation(topicName, config);
    
    // Update active topic badge and headers
    const topicBadge = document.getElementById("current-topic-badge");
    const categoryBadge = document.getElementById("current-category-badge");
    const durationLabel = document.getElementById("target-duration-label");
    const topicInput = document.getElementById("topic-input-field");

    if (topicBadge) topicBadge.textContent = currentTopicData.title;
    if (categoryBadge) categoryBadge.textContent = currentTopicData.category || "Computer Engineering";
    if (durationLabel) durationLabel.textContent = `${config.duration} Mins Seminar`;
    if (topicInput) topicInput.value = currentTopicData.title;

    // Render all views
    renderSimpleExplainer(currentTopicData);
    renderSlides(currentTopicData);
    renderVivaQuestions(currentTopicData, currentVivaFilter);
    renderQuickRevision(currentTopicData);
    
    // Set first practice question
    if (currentTopicData.vivaQuestions && currentTopicData.vivaQuestions.length > 0) {
      setPracticeQuestion(currentTopicData.vivaQuestions[0]);
    }

    if (window.lucide) window.lucide.createIcons();
    showToast(`✓ Prepared: ${currentTopicData.title}`);
  } catch (err) {
    console.error("Error loading topic:", err);
    showToast("Failed to load topic. Using default.");
  }
}

/**
 * Handles topic form submission
 */
function handleTopicSubmit() {
  const input = document.getElementById("topic-input-field");
  if (!input || !input.value.trim()) {
    showToast("Please enter a presentation topic.");
    return;
  }
  loadTopic(input.value.trim());
}

/**
 * Shortcut for quick-topic pill buttons
 */
function selectQuickTopic(topicName) {
  const input = document.getElementById("topic-input-field");
  if (input) input.value = topicName;
  loadTopic(topicName);
}

/**
 * Tab Switching Logic
 */
function switchTab(sectionId) {
  // Hide all tab sections
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.add("hidden");
    el.classList.remove("block");
  });

  // Remove active from all nav buttons
  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.classList.remove("active");
    btn.classList.add("text-gray-400");
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("block");
  }

  // Set active nav button
  const activeBtn = document.getElementById(`tab-${sectionId}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.classList.remove("text-gray-400");
  }

  // Refresh icons
  if (window.lucide) window.lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render Section 1: Simple English Concept Explainer
 */
function renderSimpleExplainer(data) {
  const exp = data.simpleExplanation;
  if (!exp) return;

  const analogyEl = document.getElementById("explainer-analogy");
  const problemEl = document.getElementById("explainer-problem");
  const examinerEl = document.getElementById("explainer-examiner");
  const mentalModelEl = document.getElementById("explainer-mental-model");
  const pillarsContainer = document.getElementById("explainer-pillars");

  if (analogyEl) analogyEl.textContent = `"${exp.eli5}"`;
  if (problemEl) problemEl.textContent = exp.coreProblem;
  if (examinerEl) examinerEl.textContent = exp.examinerFocus;
  if (mentalModelEl) mentalModelEl.textContent = exp.mentalModel;

  if (pillarsContainer && exp.keyPillars) {
    pillarsContainer.innerHTML = exp.keyPillars.map((p, idx) => `
      <div class="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-1.5">
        <div class="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
          <span class="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px]">${idx + 1}</span>
          <span>${escapeHtml(p.title)}</span>
        </div>
        <p class="text-xs text-gray-300 leading-relaxed">${escapeHtml(p.desc)}</p>
      </div>
    `).join("");
  }
}

/**
 * Render Section 2: Slide-Wise Speaking Points & Easy Scripts
 */
function renderSlides(data) {
  const container = document.getElementById("slides-container");
  if (!container || !data.slides) return;

  container.innerHTML = data.slides.map((slide, idx) => `
    <div class="glass-panel p-6 sm:p-7 space-y-5 border-gray-800 relative overflow-hidden">
      <!-- Top Slide Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800/80 gap-2">
        <div class="flex items-center space-x-3">
          <span class="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black text-sm flex items-center justify-center">
            ${slide.slideNumber}
          </span>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white">${escapeHtml(slide.title)}</h3>
            <span class="text-xs text-gray-400 flex items-center space-x-2">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-gray-500"></i>
              <span>Target Duration: <strong>${escapeHtml(slide.timing)}</strong></span>
            </span>
          </div>
        </div>

        <!-- Slide Action Buttons -->
        <div class="flex items-center space-x-2 self-start sm:self-auto">
          <button onclick="listenToSlideScript(${idx})" id="play-slide-btn-${idx}" class="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-medium flex items-center space-x-1.5 transition">
            <i data-lucide="volume-2" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Listen Script</span>
          </button>
          <button onclick="copySlideScript(${idx})" class="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition" title="Copy script">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Two-Column Layout: What is on the slide vs What you SAY out loud -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Left Column: What to put on the slide (4 cols) -->
        <div class="lg:col-span-5 p-4 rounded-xl bg-gray-950/70 border border-gray-800/80 space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
            <i data-lucide="monitor" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>On-Slide Bullet Points:</span>
          </span>
          <ul class="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
            ${slide.slideBullets.map(b => `<li class="leading-relaxed">${escapeHtml(b)}</li>`).join("")}
          </ul>
        </div>

        <!-- Right Column: Exact Spoken Script (7 cols) -->
        <div class="lg:col-span-7 p-4.5 rounded-xl bg-indigo-950/20 border border-indigo-800/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <i data-lucide="mic" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>Word-For-Word Spoken Script (Say This):</span>
            </span>
          </div>
          <p id="slide-script-text-${idx}" class="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans font-medium">
            "${escapeHtml(slide.script)}"
          </p>
        </div>

      </div>

      <!-- Stage Cue & Examiner Trap alerts -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <div class="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-start space-x-2">
          <i data-lucide="navigation" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold text-emerald-400 block mb-0.5">Stage & Visual Cue:</span>
            <span class="text-gray-300">${escapeHtml(slide.visualCue)}</span>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 flex items-start space-x-2">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold text-rose-400 block mb-0.5">Examiner Trap on this Slide:</span>
            <span class="text-gray-300">${escapeHtml(slide.examinerTrap)}</span>
          </div>
        </div>
      </div>

    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Render Section 4: Viva Questions & Answers
 */
function renderVivaQuestions(data, filter = 'all') {
  const container = document.getElementById("viva-cards-container");
  if (!container || !data.vivaQuestions) return;

  const questions = filter === 'all' 
    ? data.vivaQuestions 
    : data.vivaQuestions.filter(q => q.difficulty.toLowerCase() === filter.toLowerCase() || q.category.toLowerCase().includes(filter.toLowerCase()));

  if (questions.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-gray-500 text-sm">No viva questions matching this filter.</div>`;
    return;
  }

  container.innerHTML = questions.map((q, idx) => `
    <div class="glass-panel p-5 sm:p-6 space-y-4 border-gray-800">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center space-x-2">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getDifficultyBadgeClass(q.difficulty)}">
            ${escapeHtml(q.difficulty)}
          </span>
          <span class="text-xs text-gray-400 font-medium">Category: ${escapeHtml(q.category)}</span>
        </div>
        <button onclick="practiceThisQuestion('${q.id}')" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 self-start sm:self-auto">
          <i data-lucide="mic" class="w-3.5 h-3.5"></i>
          <span>Practice in Mock Viva</span>
        </button>
      </div>

      <div class="space-y-1">
        <h4 class="text-base sm:text-lg font-bold text-white leading-snug">
          Q${idx + 1}: ${escapeHtml(q.question)}
        </h4>
        <p class="text-xs text-amber-400/90 flex items-center space-x-1.5 pt-1">
          <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
          <span>Why examiners ask this: <strong class="text-gray-300 font-normal">${escapeHtml(q.examinerIntent)}</strong></span>
        </p>
      </div>

      <!-- Expandable Answer Box -->
      <div class="pt-2">
        <button onclick="toggleAnswerVisibility('viva-ans-${idx}')" id="viva-ans-toggle-${idx}" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
          <span>Show Model High-Scoring Answer</span>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
        </button>

        <div id="viva-ans-${idx}" class="hidden mt-3 p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">Examiner-Ready Model Answer:</span>
            <button onclick="speakText('${escapeJavaScriptString(q.modelAnswer)}')" class="text-xs text-gray-400 hover:text-white flex items-center space-x-1">
              <i data-lucide="volume-2" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Listen</span>
            </button>
          </div>
          <p class="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
            ${escapeHtml(q.modelAnswer)}
          </p>
        </div>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function filterVivaQuestions(category) {
  currentVivaFilter = category;
  document.querySelectorAll(".viva-filter-btn").forEach(btn => {
    btn.classList.remove("bg-indigo-600", "text-white");
    btn.classList.add("bg-gray-900", "text-gray-400");
  });
  const activeBtn = document.getElementById(`viva-filter-${category}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-gray-900", "text-gray-400");
    activeBtn.classList.add("bg-indigo-600", "text-white");
  }
  if (currentTopicData) {
    renderVivaQuestions(currentTopicData, category);
  }
}

function toggleAnswerVisibility(elemId) {
  const el = document.getElementById(elemId);
  if (!el) return;
  const isHidden = el.classList.contains("hidden");
  if (isHidden) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function getDifficultyBadgeClass(diff) {
  const d = (diff || '').toLowerCase();
  if (d.includes('fund') || d.includes('core')) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (d.includes('trick') || d.includes('trap')) return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  if (d.includes('adv')) return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
  return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
}

/**
 * Render Section 5: Quick Revision & Cheat Sheet
 */
function renderQuickRevision(data) {
  const rev = data.quickRevision;
  if (!rev) return;

  const pitchEl = document.getElementById("revision-elevator-pitch");
  const mustKnowEl = document.getElementById("revision-must-know-list");
  const gotchasEl = document.getElementById("revision-gotchas-list");
  const termsTbody = document.getElementById("revision-terms-tbody");

  if (pitchEl) pitchEl.textContent = `"${rev.elevatorPitch}"`;

  if (mustKnowEl && rev.mustKnowPoints) {
    mustKnowEl.innerHTML = rev.mustKnowPoints.map(p => `
      <li class="flex items-start space-x-2">
        <i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
        <span>${escapeHtml(p)}</span>
      </li>
    `).join("");
  }

  if (gotchasEl && rev.examinerGotchas) {
    gotchasEl.innerHTML = rev.examinerGotchas.map(g => `
      <li class="flex items-start space-x-2">
        <i data-lucide="x" class="w-4 h-4 text-rose-400 shrink-0 mt-0.5"></i>
        <span>${escapeHtml(g)}</span>
      </li>
    `).join("");
  }

  if (termsTbody && rev.keyTerms) {
    termsTbody.innerHTML = rev.keyTerms.map(t => `
      <tr class="hover:bg-gray-900/40">
        <td class="py-2.5 pr-4 font-mono font-semibold text-indigo-300">${escapeHtml(t.term)}</td>
        <td class="py-2.5 text-gray-300 leading-relaxed">${escapeHtml(t.def)}</td>
      </tr>
    `).join("");
  }
}

/**
 * Practice & Mock Viva Section Logic
 */
function setPracticeQuestion(qObj) {
  activePracticeQuestion = qObj;
  
  const textEl = document.getElementById("practice-q-text");
  const catEl = document.getElementById("practice-q-category");
  const intentEl = document.getElementById("practice-q-intent");
  const answerInput = document.getElementById("practice-answer-input");
  const resultBox = document.getElementById("evaluation-result-box");

  if (textEl) textEl.textContent = qObj.question;
  if (catEl) catEl.textContent = `${qObj.category} (${qObj.difficulty})`;
  if (intentEl) intentEl.textContent = qObj.examinerIntent;
  if (answerInput) answerInput.value = "";
  if (resultBox) resultBox.classList.add("hidden");
  
  updateWordCount();
}

function loadNextPracticeQuestion() {
  if (!currentTopicData || !currentTopicData.vivaQuestions) return;
  const questions = currentTopicData.vivaQuestions;
  const currentIndex = questions.findIndex(q => q.id === (activePracticeQuestion?.id));
  const nextIndex = (currentIndex + 1) % questions.length;
  setPracticeQuestion(questions[nextIndex]);
}

function practiceThisQuestion(questionId) {
  if (!currentTopicData || !currentTopicData.vivaQuestions) return;
  const target = currentTopicData.vivaQuestions.find(q => q.id === questionId);
  if (target) {
    setPracticeQuestion(target);
    switchTab('practice-section');
  }
}

function clearAnswerInput() {
  const input = document.getElementById("practice-answer-input");
  if (input) input.value = "";
  updateWordCount();
}

function updateWordCount() {
  const input = document.getElementById("practice-answer-input");
  const counter = document.getElementById("word-counter");
  if (!input || !counter) return;
  const words = input.value.trim().split(/\s+/).filter(Boolean).length;
  counter.textContent = `${words} word${words === 1 ? '' : 's'}`;
}

/**
 * Voice Recording Toggle (Speech-to-Text)
 */
function toggleSpeechRecording() {
  const btn = document.getElementById("mic-record-btn");
  const label = document.getElementById("mic-label");
  const indicator = document.getElementById("recording-indicator");
  const answerInput = document.getElementById("practice-answer-input");

  if (practiceEngine.isRecording) {
    practiceEngine.stopRecording();
    if (label) label.textContent = "Record with Mic";
    if (btn) btn.classList.remove("recording-pulse", "bg-rose-900/60");
    if (indicator) indicator.classList.add("hidden");
  } else {
    if (!practiceEngine.isSpeechRecognitionSupported()) {
      showToast("Speech Recognition not supported in this browser. Please type your answer.");
      return;
    }

    if (label) label.textContent = "Stop Recording";
    if (btn) btn.classList.add("recording-pulse", "bg-rose-900/60");
    if (indicator) indicator.classList.remove("hidden");

    practiceEngine.startRecording(
      (transcript) => {
        if (answerInput) {
          answerInput.value = transcript;
          updateWordCount();
        }
      },
      (finalTranscript) => {
        if (answerInput) {
          answerInput.value = finalTranscript;
          updateWordCount();
        }
        if (label) label.textContent = "Record with Mic";
        if (btn) btn.classList.remove("recording-pulse", "bg-rose-900/60");
        if (indicator) indicator.classList.add("hidden");
      },
      (error) => {
        console.warn("Speech error:", error);
        showToast(`Mic error: ${error}`);
        if (label) label.textContent = "Record with Mic";
        if (btn) btn.classList.remove("recording-pulse", "bg-rose-900/60");
        if (indicator) indicator.classList.add("hidden");
      }
    );
  }
}

/**
 * Answer Evaluation by AI
 */
async function evaluateStudentPractice() {
  const answerInput = document.getElementById("practice-answer-input");
  if (!answerInput || !answerInput.value.trim()) {
    showToast("Please speak or type an answer before requesting evaluation.");
    return;
  }

  if (!activePracticeQuestion) {
    showToast("No active question selected.");
    return;
  }

  const evalBtn = document.getElementById("evaluate-btn");
  if (evalBtn) {
    evalBtn.disabled = true;
    evalBtn.innerHTML = `<span class="animate-spin inline-block mr-2">⚙</span> Evaluating...`;
  }

  try {
    const studentAnswer = answerInput.value.trim();
    const evaluation = await aiService.evaluatePracticeAnswer(activePracticeQuestion, studentAnswer, currentTopicData);

    // Render results
    const resultBox = document.getElementById("evaluation-result-box");
    const scoreVal = document.getElementById("eval-score-value");
    const scoreCircle = document.getElementById("eval-score-circle");
    const scoreTitle = document.getElementById("eval-score-title");
    const summaryFeedback = document.getElementById("eval-summary-feedback");
    
    const rubricAcc = document.getElementById("rubric-acc");
    const rubricClarity = document.getElementById("rubric-clarity");
    const rubricDepth = document.getElementById("rubric-depth");
    const rubricConf = document.getElementById("rubric-conf");

    const strengthsList = document.getElementById("eval-strengths-list");
    const improvementsList = document.getElementById("eval-improvements-list");
    const idealAnswerEl = document.getElementById("eval-ideal-answer");

    if (scoreVal) scoreVal.textContent = evaluation.score;
    if (summaryFeedback) summaryFeedback.textContent = evaluation.feedback;
    if (idealAnswerEl) idealAnswerEl.textContent = evaluation.idealAnswer;

    if (rubricAcc) rubricAcc.textContent = `${evaluation.rubric.technicalAccuracy}/10`;
    if (rubricClarity) rubricClarity.textContent = `${evaluation.rubric.clarity}/10`;
    if (rubricDepth) rubricDepth.textContent = `${evaluation.rubric.depth}/10`;
    if (rubricConf) rubricConf.textContent = `${evaluation.rubric.confidence}/10`;

    // Visual score color
    if (evaluation.score >= 8.0) {
      if (scoreTitle) scoreTitle.textContent = "High Marks Expected! Outstanding Grasp.";
      if (scoreCircle) scoreCircle.className = "w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex flex-col items-center justify-center";
      // Fire confetti celebration!
      if (window.confetti) {
        window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } else if (evaluation.score >= 6.0) {
      if (scoreTitle) scoreTitle.textContent = "Solid Answer! Address Missing Technical Terms.";
      if (scoreCircle) scoreCircle.className = "w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex flex-col items-center justify-center";
    } else {
      if (scoreTitle) scoreTitle.textContent = "Needs Revision Before Facing Examiners.";
      if (scoreCircle) scoreCircle.className = "w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex flex-col items-center justify-center";
    }

    if (strengthsList) {
      strengthsList.innerHTML = evaluation.strengths.map(s => `<li>✓ ${escapeHtml(s)}</li>`).join("");
    }

    if (improvementsList) {
      improvementsList.innerHTML = evaluation.improvements.map(i => `<li>• ${escapeHtml(i)}</li>`).join("");
    }

    if (resultBox) {
      resultBox.classList.remove("hidden");
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Save to practice history
    practiceEngine.savePracticeAttempt(
      currentTopicData ? currentTopicData.title : "Computer Engineering",
      activePracticeQuestion.question,
      evaluation.score,
      evaluation.feedback
    );
    renderPracticeHistory();

  } catch (err) {
    console.error("Evaluation error:", err);
    showToast("Evaluation failed. Please try again.");
  } finally {
    if (evalBtn) {
      evalBtn.disabled = false;
      evalBtn.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i><span>Evaluate My Answer</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function renderPracticeHistory() {
  const container = document.getElementById("practice-history-container");
  const list = document.getElementById("practice-history-list");
  if (!container || !list) return;

  const history = practiceEngine.getPracticeHistory();
  if (history.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  list.innerHTML = history.slice(0, 8).map(item => `
    <div class="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[11px] flex items-center space-x-1.5" title="${escapeHtml(item.question)}">
      <span class="font-bold ${item.score >= 8 ? 'text-emerald-400' : item.score >= 6 ? 'text-indigo-400' : 'text-amber-400'}">${item.score}/10</span>
      <span class="text-gray-400 truncate max-w-[120px]">${escapeHtml(item.question)}</span>
    </div>
  `).join("");
}

function clearHistory() {
  practiceEngine.clearPracticeHistory();
  renderPracticeHistory();
  showToast("Practice history cleared.");
}

/**
 * Text-to-Speech Helpers
 */
function listenToTopicExplainer() {
  if (!currentTopicData || !currentTopicData.simpleExplanation) return;
  const exp = currentTopicData.simpleExplanation;
  const text = `${currentTopicData.title}. In simple terms: ${exp.eli5}. The core problem it solves: ${exp.coreProblem}`;
  speakText(text);
}

function listenToSlideScript(idx) {
  if (!currentTopicData || !currentTopicData.slides || !currentTopicData.slides[idx]) return;
  const slide = currentTopicData.slides[idx];
  speakText(slide.script);
}

function speakPracticeQuestion() {
  if (activePracticeQuestion) {
    speakText(activePracticeQuestion.question);
  }
}

function speakModelAnswer() {
  const ansEl = document.getElementById("eval-ideal-answer");
  if (ansEl && ansEl.textContent.trim()) {
    speakText(ansEl.textContent.trim());
  }
}

function speakText(text) {
  practiceEngine.speakText(
    text,
    () => showToast("Playing audio narration..."),
    () => showToast("Narration finished.")
  );
}

/**
 * Rehearsal Timer (Stopwatch in navbar)
 */
function toggleRehearsalTimer() {
  const icon = document.getElementById("rehearsal-timer-icon");
  const display = document.getElementById("rehearsal-timer-display");

  if (isRehearsalTimerRunning) {
    practiceEngine.stopRehearsalTimer();
    isRehearsalTimerRunning = false;
    if (icon) icon.setAttribute("data-lucide", "play");
    showToast("Rehearsal timer paused.");
  } else {
    isRehearsalTimerRunning = true;
    if (icon) icon.setAttribute("data-lucide", "pause");
    practiceEngine.startRehearsalTimer((formatted) => {
      if (display) display.textContent = formatted;
    });
    showToast("Rehearsal timer started.");
  }
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Teleprompter Rehearsal View
 */
function openTeleprompterModal() {
  const modal = document.getElementById("teleprompter-modal");
  const textContainer = document.getElementById("teleprompter-text-container");
  if (!modal || !textContainer || !currentTopicData || !currentTopicData.slides) return;

  textContainer.innerHTML = currentTopicData.slides.map(s => `
    <div class="mb-12 pb-8 border-b border-gray-800/80">
      <div class="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2">Slide ${s.slideNumber}: ${escapeHtml(s.title)} (${s.timing})</div>
      <p class="text-xl sm:text-2xl font-medium text-gray-100 leading-relaxed font-sans">${escapeHtml(s.script)}</p>
      <div class="mt-4 text-xs font-mono text-emerald-400/90">[Visual Cue: ${escapeHtml(s.visualCue)}]</div>
    </div>
  `).join("");

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeTeleprompterModal() {
  const modal = document.getElementById("teleprompter-modal");
  if (modal) modal.classList.add("hidden");
  practiceEngine.stopTeleprompter();
  isTeleprompterScrolling = false;
  const label = document.getElementById("scroll-toggle-label");
  if (label) label.textContent = "Auto-Scroll";
}

function toggleTeleprompterScroll() {
  const textContainer = document.getElementById("teleprompter-text-container");
  const label = document.getElementById("scroll-toggle-label");
  const icon = document.getElementById("scroll-toggle-icon");

  if (isTeleprompterScrolling) {
    practiceEngine.stopTeleprompter();
    isTeleprompterScrolling = false;
    if (label) label.textContent = "Auto-Scroll";
    if (icon) icon.setAttribute("data-lucide", "play");
  } else {
    practiceEngine.startTeleprompter(textContainer, 2);
    isTeleprompterScrolling = true;
    if (label) label.textContent = "Pause Scroll";
    if (icon) icon.setAttribute("data-lucide", "pause");
  }
  if (window.lucide) window.lucide.createIcons();
}

function readTeleprompterWithSpeech() {
  if (!currentTopicData || !currentTopicData.slides) return;
  const fullText = currentTopicData.slides.map(s => `Slide ${s.slideNumber}: ${s.script}`).join(". ");
  speakText(fullText);
}

/**
 * Copy to Clipboard Helpers
 */
function copySlideScript(idx) {
  if (!currentTopicData || !currentTopicData.slides || !currentTopicData.slides[idx]) return;
  const script = currentTopicData.slides[idx].script;
  navigator.clipboard.writeText(script).then(() => {
    showToast(`✓ Copied Slide ${idx + 1} script!`);
  });
}

function copyAllScripts() {
  if (!currentTopicData || !currentTopicData.slides) return;
  const fullText = currentTopicData.slides.map(s => `### Slide ${s.slideNumber}: ${s.title} (${s.timing})\n${s.script}\n`).join("\n");
  navigator.clipboard.writeText(fullText).then(() => {
    showToast("✓ All slide scripts copied to clipboard!");
  });
}

function copyRevisionText() {
  if (!currentTopicData || !currentTopicData.quickRevision) return;
  const r = currentTopicData.quickRevision;
  const text = `# Quick Revision: ${currentTopicData.title}\n\n## 60-Second Pitch\n${r.elevatorPitch}\n\n## Must-Know Points\n${r.mustKnowPoints.map(p => `- ${p}`).join("\n")}\n\n## Examiner Gotchas\n${r.examinerGotchas.map(g => `- ${g}`).join("\n")}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast("✓ Revision notes copied!");
  });
}

/**
 * Floating AI Coach Chat Assistant
 */
function toggleCoachPanel() {
  const panel = document.getElementById("coach-panel");
  if (panel) {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      document.getElementById("coach-input-field")?.focus();
    }
  }
}

async function sendCoachMessage() {
  const input = document.getElementById("coach-input-field");
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = "";

  appendCoachMessage(text, 'user');

  try {
    const reply = await aiService.chatWithCoach(text, [], currentTopicData);
    appendCoachMessage(reply, 'bot');
  } catch (err) {
    appendCoachMessage("Sorry, I had trouble formulating that response. Try again!", 'bot');
  }
}

function sendCoachPrompt(promptText) {
  const input = document.getElementById("coach-input-field");
  if (input) input.value = promptText;
  sendCoachMessage();
}

function appendCoachMessage(content, sender) {
  const feed = document.getElementById("coach-messages-feed");
  if (!feed) return;

  const isBot = sender === 'bot';
  const msgDiv = document.createElement("div");
  msgDiv.className = `flex items-start space-x-2 ${isBot ? '' : 'justify-end'}`;

  // Simple Markdown to HTML formatting for Coach
  const formattedHtml = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  if (isBot) {
    msgDiv.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-3.5 h-3.5"></i>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl rounded-tl-none p-3 text-gray-200 leading-relaxed max-w-[85%] text-xs">
        ${formattedHtml}
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="bg-indigo-600 rounded-xl rounded-tr-none p-3 text-white leading-relaxed max-w-[85%] text-xs">
        ${formattedHtml}
      </div>
    `;
  }

  feed.appendChild(msgDiv);
  feed.scrollTop = feed.scrollHeight;
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Settings Modal Logic
 */
function openSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.classList.add("hidden");
}

function toggleEngineMode() {
  const isGemini = document.getElementById("mode-gemini")?.checked;
  const keyContainer = document.getElementById("gemini-key-container");
  if (keyContainer) {
    if (isGemini) {
      keyContainer.classList.remove("hidden");
    } else {
      keyContainer.classList.add("hidden");
    }
  }
}

function initSettingsValues() {
  const isLive = aiService.isLiveApiConfigured();
  const modeLocal = document.getElementById("mode-local");
  const modeGemini = document.getElementById("mode-gemini");
  const keyInput = document.getElementById("gemini-api-key-input");
  const modelSelect = document.getElementById("gemini-model-select");

  if (isLive) {
    if (modeGemini) modeGemini.checked = true;
  } else {
    if (modeLocal) modeLocal.checked = true;
  }
  if (keyInput) keyInput.value = aiService.apiKey;
  if (modelSelect) modelSelect.value = aiService.modelName;

  toggleEngineMode();
}

function saveSettings() {
  const isGemini = document.getElementById("mode-gemini")?.checked;
  const keyInput = document.getElementById("gemini-api-key-input")?.value || "";
  const modelSelect = document.getElementById("gemini-model-select")?.value || "gemini-1.5-flash";

  aiService.setApiKey(keyInput, modelSelect, isGemini);
  closeSettingsModal();
  showToast(isGemini && keyInput ? "✓ Google Gemini Live AI connected!" : "✓ Using Built-in CE Offline Intelligence");
}

/**
 * Theme Toggle
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("ppa_theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (!icon) return;
  if (theme === "dark") {
    icon.setAttribute("data-lucide", "sun");
  } else {
    icon.setAttribute("data-lucide", "moon");
  }
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Toast Notification Helpers
 */
let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-message");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove("opacity-0", "translate-y-3", "pointer-events-none");
  toast.classList.add("opacity-100", "translate-y-0");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-3", "pointer-events-none");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 3200);
}

function showLoadingToast(msg) {
  showToast(msg);
}

/**
 * Utilities
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJavaScriptString(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, " ");
}
