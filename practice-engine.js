/**
 * Presentation Preparation Assistant - Practice Engine
 * Handles Text-to-Speech (TTS), Speech-to-Text (STT), Rehearsal Timer, Teleprompter,
 * and practice evaluation session state.
 */

class PracticeEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.isRecording = false;
    this.isPlayingSpeech = false;
    this.currentUtterance = null;
    this.rehearsalTimerInterval = null;
    this.rehearsalSeconds = 0;
    this.teleprompterInterval = null;

    this._initSpeechRecognition();
  }

  _initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
    }
  }

  isSpeechRecognitionSupported() {
    return this.recognition !== null;
  }

  isSpeechSynthesisSupported() {
    return this.synth !== null;
  }

  /**
   * Speak out loud using Web Speech Synthesis
   */
  speakText(text, onStart = null, onEnd = null) {
    if (!this.synth) return;
    this.stopSpeaking();

    // Clean markdown symbols from text for smooth speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // slightly measured pace for technical presentation
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      this.isPlayingSpeech = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isPlayingSpeech = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isPlayingSpeech = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlayingSpeech = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Start speech recording via microphone
   */
  startRecording(onInterim, onFinal, onError) {
    if (!this.recognition) {
      if (onError) onError("Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your answer directly.");
      return;
    }

    try {
      this.isRecording = true;
      let finalTranscript = "";

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += " " + transcriptChunk;
          } else {
            interimTranscript += " " + transcriptChunk;
          }
        }
        if (onInterim) onInterim(finalTranscript.trim() + " " + interimTranscript.trim());
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isRecording = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        if (onFinal) onFinal(finalTranscript.trim());
      };

      this.recognition.start();
    } catch (e) {
      this.isRecording = false;
      if (onError) onError(e.message);
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  /**
   * Rehearsal stopwatch timer
   */
  startRehearsalTimer(onTick) {
    this.stopRehearsalTimer();
    this.rehearsalSeconds = 0;
    this.rehearsalTimerInterval = setInterval(() => {
      this.rehearsalSeconds++;
      const mins = Math.floor(this.rehearsalSeconds / 60);
      const secs = this.rehearsalSeconds % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (onTick) onTick(formatted, this.rehearsalSeconds);
    }, 1000);
  }

  stopRehearsalTimer() {
    if (this.rehearsalTimerInterval) {
      clearInterval(this.rehearsalTimerInterval);
      this.rehearsalTimerInterval = null;
    }
  }

  resetRehearsalTimer() {
    this.stopRehearsalTimer();
    this.rehearsalSeconds = 0;
  }

  /**
   * Teleprompter auto-scroll
   */
  startTeleprompter(containerElement, speed = 2) {
    this.stopTeleprompter();
    this.teleprompterInterval = setInterval(() => {
      if (containerElement) {
        containerElement.scrollTop += speed;
      }
    }, 50);
  }

  stopTeleprompter() {
    if (this.teleprompterInterval) {
      clearInterval(this.teleprompterInterval);
      this.teleprompterInterval = null;
    }
  }

  /**
   * Practice history storage
   */
  savePracticeAttempt(topicTitle, questionText, score, feedback) {
    const history = this.getPracticeHistory();
    const newEntry = {
      id: Date.now(),
      topic: topicTitle,
      question: questionText,
      score: score,
      feedback: feedback,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    history.unshift(newEntry);
    if (history.length > 20) history.pop(); // keep last 20
    localStorage.setItem("ppa_practice_history", JSON.stringify(history));
    return history;
  }

  getPracticeHistory() {
    try {
      const data = localStorage.getItem("ppa_practice_history");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  clearPracticeHistory() {
    localStorage.removeItem("ppa_practice_history");
  }
}

// Global exposure
if (typeof window !== "undefined") {
  window.PracticeEngine = PracticeEngine;
}
