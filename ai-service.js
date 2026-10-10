/**
 * Presentation Preparation Assistant - AI Service
 * Supports Dual Engines:
 * 1. Built-in CE Intelligent Knowledge & Evaluation Engine (100% Offline, Instant)
 * 2. Google Gemini API Engine (when an API key is provided by the user in Settings)
 */

class AIService {
  constructor() {
    this.synthesizer = new CETopicSynthesizer();
    this.apiKey = localStorage.getItem("ppa_gemini_api_key") || "";
    this.modelName = localStorage.getItem("ppa_gemini_model") || "gemini-1.5-flash";
    this.useLiveApi = localStorage.getItem("ppa_use_live_api") === "true";
  }

  setApiKey(key, model = "gemini-1.5-flash", enableLive = true) {
    this.apiKey = key.trim();
    this.modelName = model;
    this.useLiveApi = enableLive && this.apiKey.length > 0;
    localStorage.setItem("ppa_gemini_api_key", this.apiKey);
    localStorage.setItem("ppa_gemini_model", this.modelName);
    localStorage.setItem("ppa_use_live_api", this.useLiveApi ? "true" : "false");
  }

  isLiveApiConfigured() {
    return this.useLiveApi && this.apiKey.length > 10;
  }

  /**
   * Generates or fetches presentation preparation package for a topic
   */
  async preparePresentation(topicName, options = {}) {
    // If live API is configured, we can optionally enhance with Gemini,
    // otherwise our deep built-in CE synthesizer returns instant expert content.
    const baseContent = this.synthesizer.synthesizeTopic(topicName);

    if (this.isLiveApiConfigured()) {
      try {
        const enhanced = await this._callGeminiForTopic(topicName, baseContent, options);
        if (enhanced) return enhanced;
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local CE knowledge engine:", err);
      }
    }

    return baseContent;
  }

  /**
   * Evaluates student's answer in Practice / Mock Viva mode
   */
  async evaluatePracticeAnswer(questionObj, studentAnswer, currentTopic) {
    const trimmed = studentAnswer.trim();
    if (!trimmed) {
      return {
        score: 0,
        feedback: "No answer provided. Please speak or type your response to receive an evaluation.",
        strengths: [],
        improvements: ["Provide a complete technical explanation."],
        idealAnswer: questionObj.modelAnswer,
        rubric: { technicalAccuracy: 0, clarity: 0, depth: 0, confidence: 0 }
      };
    }

    // Try Gemini API if available
    if (this.isLiveApiConfigured()) {
      try {
        const geminiResult = await this._callGeminiEvaluate(questionObj, trimmed, currentTopic);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn("Live evaluation failed, falling back to local evaluator:", err);
      }
    }

    // Fallback to sophisticated local heuristic evaluation engine
    return this._localEvaluateAnswer(questionObj, trimmed, currentTopic);
  }

  /**
   * Local heuristic evaluator for engineering presentations
   */
  _localEvaluateAnswer(questionObj, answer, topic) {
    const lower = answer.toLowerCase();
    const wordCount = answer.split(/\s+/).filter(Boolean).length;
    const modelLower = questionObj.modelAnswer.toLowerCase();

    // Extract key technical tokens from model answer
    const technicalKeywords = modelLower
      .replace(/[^a-z0-9\s_-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 4 && !["which", "their", "there", "about", "would", "because", "should", "during", "always", "rather"].includes(w));

    const matchedKeywords = [];
    const missingKeywords = [];

    // Deduplicate
    const uniqueKeywords = [...new Set(technicalKeywords)];
    uniqueKeywords.forEach(kw => {
      if (lower.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const keywordRatio = uniqueKeywords.length > 0 ? (matchedKeywords.length / uniqueKeywords.length) : 0.5;

    // Scoring dimensions (0 to 10 scale)
    let technicalAccuracy = Math.min(10, Math.round(keywordRatio * 10 + (matchedKeywords.length >= 3 ? 2 : 0)));
    let depth = wordCount < 20 ? 4 : wordCount < 45 ? 7 : wordCount < 120 ? 9 : 8;
    let clarity = (answer.includes(".") || answer.includes(",")) && wordCount >= 15 ? 9 : 6;
    let confidence = !lower.includes("maybe") && !lower.includes("i guess") && !lower.includes("not sure") ? 9 : 5;

    if (wordCount < 10) {
      technicalAccuracy = Math.min(technicalAccuracy, 4);
      depth = 3;
    }

    const overallScore = Math.max(1, Math.min(10, Math.round((technicalAccuracy * 0.4 + depth * 0.25 + clarity * 0.2 + confidence * 0.15) * 10) / 10));

    // Construct strengths and improvement feedback
    const strengths = [];
    const improvements = [];

    if (wordCount >= 25) {
      strengths.push("Good length and articulation; you didn't freeze or give a one-word answer.");
    }
    if (matchedKeywords.length >= 2) {
      strengths.push(`Captured essential engineering concepts: "${matchedKeywords.slice(0, 3).join('", "')}".`);
    } else {
      improvements.push("Incorporate more domain-specific technical terminology instead of general descriptions.");
    }

    if (lower.includes("because") || lower.includes("due to") || lower.includes("hence") || lower.includes("trade-off")) {
      strengths.push("Demonstrated cause-and-effect engineering reasoning.");
    } else {
      improvements.push("Explain the 'why' (trade-offs or architectural rationale), not just the 'what'.");
    }

    if (missingKeywords.length > 0) {
      improvements.push(`Examiner note: Try mentioning keywords like "${missingKeywords.slice(0, 3).join('", "')}".`);
    }

    let summaryVerdict = "";
    if (overallScore >= 8.5) {
      summaryVerdict = "Excellent performance! An external examiner would rate this answer in the top tier for a 3rd-year student.";
    } else if (overallScore >= 7.0) {
      summaryVerdict = "Solid engineering response! You demonstrated good grasp. Tighten up missing technical keywords for full marks.";
    } else if (overallScore >= 5.0) {
      summaryVerdict = "Fair attempt. The core intuition is present, but lacks the technical precision examiners look for.";
    } else {
      summaryVerdict = "Needs revision. The answer was too brief or missed the primary mechanism. Review the model answer below.";
    }

    return {
      score: overallScore,
      feedback: summaryVerdict,
      strengths: strengths.length ? strengths : ["You attempted the question under simulated viva conditions."],
      improvements: improvements.length ? improvements : ["Polish delivery speed and transition phrases."],
      idealAnswer: questionObj.modelAnswer,
      rubric: {
        technicalAccuracy,
        clarity,
        depth,
        confidence
      }
    };
  }

  /**
   * Interactive Assistant Chatbot responses
   */
  async chatWithCoach(userMessage, conversationHistory = [], currentTopic = null) {
    if (this.isLiveApiConfigured()) {
      try {
        const liveReply = await this._callGeminiChat(userMessage, conversationHistory, currentTopic);
        if (liveReply) return liveReply;
      } catch (err) {
        console.warn("Live chat failed, using local CE coach:", err);
      }
    }

    return this._localCoachReply(userMessage, currentTopic);
  }

  _localCoachReply(message, topic) {
    const lower = message.toLowerCase();
    const topicName = topic ? topic.title : "your Computer Engineering topic";

    if (lower.includes("start") || lower.includes("hook") || lower.includes("begin")) {
      return `Here are 3 ways to start your presentation on **${topicName}**:\n\n` +
        `1. **The Real-World Dilemma Hook**: "Respected faculty, imagine what happens when millions of users hit a system at the same instant and a server crashes. How do we keep data consistent? That is why today I am presenting on ${topicName}."\n` +
        `2. **The Contrast Hook**: "While legacy systems struggled with high latency and single points of failure, modern cloud architectures rely on ${topicName}. Today, I will break down its architecture and trade-offs."\n` +
        `3. **The Direct Technical Hook**: "Good morning everyone. Today, I'll explain ${topicName} from first principles—covering its core problem statement, underlying algorithms, and examiner edge cases."`;
    }

    if (lower.includes("viva") || lower.includes("question") || lower.includes("ask me")) {
      if (topic && topic.vivaQuestions && topic.vivaQuestions.length > 0) {
        const randomQ = topic.vivaQuestions[Math.floor(Math.random() * topic.vivaQuestions.length)];
        return `Here is a tough examiner viva question for **${topicName}**:\n\n` +
          `❓ **"${randomQ.question}"**\n\n` +
          `💡 *Examiner Intent*: ${randomQ.examinerIntent}\n\n` +
          `Try answering it in the **Practice & Mock Viva** tab, or ask me for the model answer!`;
      }
      return `Here is a classic 3rd-year viva question: **"What are the primary trade-offs of this approach compared to its predecessor, and in what exact scenario would you advise against using it?"** Head to the Practice tab to record your response!`;
    }

    if (lower.includes("analogy") || lower.includes("simple") || lower.includes("eli5")) {
      if (topic && topic.simpleExplanation) {
        return `Here is a simple English analogy for **${topicName}**:\n\n` +
          `💡 ${topic.simpleExplanation.eli5}\n\n` +
          `*Why this works in your presentation:* Examiners love when you start with an intuitive real-world mental model before diving into raw diagrams and code!`;
      }
      return `Think of ${topicName} like a busy airport control tower: instead of pilots guessing when to land, the system strictly assigns runways, manages fuel emergencies, and sequences traffic to prevent mid-air collisions.`;
    }

    if (lower.includes("diagram") || lower.includes("architecture") || lower.includes("explain diagram")) {
      return `Here is the golden **3-Step Technique** for explaining diagrams to examiners:\n\n` +
        `1. **Orient the Audience (10s)**: "As shown on this architecture diagram, the system is separated into three tiers: Client, Processing Engine, and Storage."\n` +
        `2. **Trace the Happy Path (30s)**: "Follow the green arrow: when a request arrives, it touches the Load Balancer, gets dispatched to a worker, and writes to the log."\n` +
        `3. **Highlight the Bottleneck/Failover (20s)**: "Notice the dashed line—that is the failover path if the primary node crashes."\n\n` +
        `This proves you understand system dynamics, not just static boxes and arrows!`;
    }

    if (lower.includes("don't know") || lower.includes("dont know") || lower.includes("stuck") || lower.includes("blank")) {
      return `If an examiner asks a question you don't know the answer to, **NEVER say "I don't know" and go silent**, and **NEVER try to fake technical facts**.\n\n` +
        `Use this battle-tested phrase instead:\n` +
        `*"Sir/Ma'am, while I haven't explored that specific edge case yet, based on how the underlying architecture handles concurrency, I would deduce that it either uses a timeout or falls back to the checkpoint. I will definitely review that paper after today's seminar."*\n\n` +
        `This shows intellectual honesty, calm engineering reasoning, and confidence!`;
    }

    return `I am your **Presentation Preparation Coach** for ${topicName}!\n\n` +
      `Here is what you can ask me to do:\n` +
      `- *"Give me a hook for my opening slide"*\n` +
      `- *"Explain this with a simple analogy"*\n` +
      `- *"How do I explain my architecture diagram?"*\n` +
      `- *"Ask me a tough viva question"*\n` +
      `- *"What should I do if an examiner cross-examines me?"*\n\n` +
      `You can also jump directly to the **Prepare Presentation** or **Practice** tabs above!`;
  }

  // --- Gemini API Integration Methods ---

  async _callGeminiForTopic(topicName, fallbackData, options) {
    const prompt = `You are an elite Computer Engineering Professor and presentation coach preparing a 3rd-year university student for a high-stakes technical seminar presentation on: "${topicName}".
Generate a structured JSON output with:
1. simpleExplanation: { eli5: string, coreProblem: string, keyPillars: [{title, desc}], mentalModel: string, examinerFocus: string }
2. slides: array of 7 slides, each having: { slideNumber, title, slideBullets: string[], script: string (spoken conversational script 60-90 words), timing: string, visualCue: string, examinerTrap: string }
3. vivaQuestions: array of 4 questions, each having: { id, category, question, modelAnswer, examinerIntent, difficulty: "Fundamental"|"Tricky"|"Advanced"|"Practical" }
4. quickRevision: { elevatorPitch: string, mustKnowPoints: string[], examinerGotchas: string[], keyTerms: [{term, def}] }

Format strictly as valid JSON without markdown fences.`;

    const response = await this._postToGemini(prompt);
    if (!response) return null;

    try {
      const cleanJson = response.replace(/^```json/m, "").replace(/^```/m, "").replace(/```$/m, "").trim();
      const parsed = JSON.parse(cleanJson);
      parsed.id = `gemini-${Date.now()}`;
      parsed.title = topicName;
      parsed.category = fallbackData.category;
      parsed.tags = fallbackData.tags;
      return parsed;
    } catch (e) {
      console.error("Failed to parse Gemini topic response:", e);
      return null;
    }
  }

  async _callGeminiEvaluate(questionObj, studentAnswer, currentTopic) {
    const prompt = `You are a university Computer Engineering External Examiner evaluating a 3rd-year student's viva response.
Topic: "${currentTopic ? currentTopic.title : 'Computer Engineering'}"
Question: "${questionObj.question}"
Model Answer: "${questionObj.modelAnswer}"
Student's Answer: "${studentAnswer}"

Evaluate their response strictly for technical accuracy, clarity, depth, and confidence.
Return valid JSON only (no markdown code blocks) with this format:
{
  "score": number between 1.0 and 10.0,
  "feedback": "2-3 sentence overall evaluation summary",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "idealAnswer": "${questionObj.modelAnswer.replace(/"/g, '\\"')}",
  "rubric": {
    "technicalAccuracy": number 1-10,
    "clarity": number 1-10,
    "depth": number 1-10,
    "confidence": number 1-10
  }
}`;

    const res = await this._postToGemini(prompt);
    if (!res) return null;

    try {
      const cleanJson = res.replace(/^```json/m, "").replace(/^```/m, "").replace(/```$/m, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return null;
    }
  }

  async _callGeminiChat(userMessage, history, currentTopic) {
    const topicInfo = currentTopic ? `Current seminar topic: "${currentTopic.title}" (${currentTopic.category}).` : "";
    const prompt = `You are the "Presentation Preparation Assistant", an AI coach for 3rd-year Computer Engineering students.
${topicInfo}
Your role is to help students prepare for technical presentations, seminar defense, and viva voce:
- Explain complex CS/CE concepts in simple English
- Provide slide speaking points and spoken rehearsal scripts
- Generate viva questions and coach students on handling examiners
- Give delivery tips (hooks, diagram walkthroughs, transitions, concluding remarks)
- Focus exclusively on presentation PREPARATION and PRACTICE (not generating PPT files).

User message: "${userMessage}"
Respond in concise, student-friendly markdown with clear bullet points.`;

    return await this._postToGemini(prompt);
  }

  async _postToGemini(promptText) {
    if (!this.apiKey) return null;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  }
}

// Global exposure
if (typeof window !== "undefined") {
  window.AIService = AIService;
}
