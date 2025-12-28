---
layout: lab-post
title: "The Web Speech API"
published: true
tags: []
date: 2025-12-26
desc: Testing out the Web speech api
bundle: speech-api.js
category: labs
---

## API Overview

Full documentation is available on [MDN web Speech API page](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). There are two central interfaces, namely `SpeechRecognition` responsible for recognising spoken text (captured typically via a microfone) and creting text and `SpeechSynthesis` which generates spoken words from text. Of these `SpeechSynthesis` is widely available (baseline) while `SpeechRecognition` is chrome/edge only (some partial support elsewhere, but it's patchy at best) and sends data to a speech recognition service. 

Results may wary depending of the available voices and languages on your computer

### Speech Synthesis
<p>
<form>
  <label for="lang-selector">Choose text sample</label>
  <select id="lang-selector">
    <option default value="norwegian">Norsk bokmål</option>
    <option value="english">English</option>
    <option value="french">Français</option>
    <option value="german">Deutsch</option>
  </select>
</form>
</p>

<p class="quote" id="lang-source">"Allmennheten behøver slett ingen nye tanker. Allmennheten er best tjent med de gamle, gode, og anerkjente tanker den allerede har."</p>
<p class="citation" id="citation">Henrik Ibsen, En folkefiende</p>

<span class="fancylabel">Speech Controls</span>
<form data-label="Speech Controls" class="fancy" style="flex-direction: row;">
 <div class="display-flex" style="flex-direction: column; gap: var(--form-gap);">
   <div>
   <label for="voice-selector" style="align-self: flex-end;">Voice</label>
   <select id="voice-selector"></select>
  </div>
   <div class="display-flex" style="gap: 8px;">
   <label style="align-self: flex-end;" for="pitch">Pitch</label>
   <input type="range" id="pitch" name="pitch" min="0" max="2" value="1" step="0.1" list="pitch-markers"/>
   <span id="pitch-value">1</span>
  </div>
  <div class="display-flex" style="gap: 8px;">
      <label for="rate" style="align-self: flex-end;">Rate&nbsp;</label>
    <input type="range" id="rate" name="rate" min="0.1" max="2.5" value="1" step="0.1" list="rate-markers"/>
    <span id="rate-value">1</span>
    </div>
  </div>
  <div style="align-self: center;">
    <button class="icon-button" id="speak-button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg></button>
  </div>
</form>

### Speech Recognition

 <span class="fancylabel">Recognition Controls</span>
<form class="fancy" style="flex-direction: row;">
  <div class="display-flex" style="flex-direction: column; align-items: flex-end; gap: var(--form-gap);">
  <div>
    <label for="lang-selector-recog">Choose language</label>
  <select id="lang-selector-recog">
    <option default value="nb-NO">Norsk bokmål</option>
    <option value="en-GB">English</option>
    <option value="fr-FR">Français</option>
    <option value="de-DE">Deutsch</option>
  </select>
  </div>
  <div><label for="cont">Continuous</label><input id="cont" type="checkbox"/></div>
  <div><label for="int">Intermediate results</label><input id="int" type="checkbox"/></div>
  </div>
  <button id="recog-button" style="align-self: center;">Recognise</button>
</form>

#### Output
<pre class="font-highlight" style="height: 400px; overflow: scroll; "><code id="log" class="inner-syntax language-json" style="height: 400px;"></code></pre>

#### Events
<pre class="font-highlight" style="height: 400px; overflow: scroll;"><code id="event-log" class="inner-syntax language-json" style=" "></code></pre>


### The Code Running on This Page

```typescript
import { getIcon } from "./common.ts";

// Types and interfaces
interface LanguageData {
  text: string;
  author: string;
  book: string;
  lang: string;
}

interface SpeechElements {
  langSelector: HTMLSelectElement;
  speakButton: HTMLElement;
  pitchInput: HTMLInputElement;
  pitchValue: HTMLElement;
  rateInput: HTMLInputElement;
  rateValue: HTMLElement;
  voiceSelector: HTMLSelectElement;
  langSource: HTMLElement;
  citation: HTMLElement;
}

interface RecognitionElements {
  langSelector: HTMLSelectElement;
  output: HTMLElement;
  eventLog: HTMLElement;
  recogButton: HTMLElement;
  contCheckbox: HTMLInputElement;
  intCheckbox: HTMLInputElement;
}

// Global variables
let speechElements: SpeechElements | null = null;
let recognitionElements: RecognitionElements | null = null;
let voices: SpeechSynthesisVoice[] = [];
let currentRecognition: any = null;

// Language data
const LANGUAGES: Record<string, LanguageData> = {
  english: {
    text: "We can never be gods, after all — but we can become something less than human with frightening ease.",
    author: "N.K. Jemisin",
    book: "The City We Became",
    lang: "en-GB",
  },
  german: {
    text: "Ein leichtes Leben, eine leichte Liebe, ein leichter Tod – das war nichts für mich.",
    author: "Herman Hesse",
    book: "Steppenwolf",
    lang: "de-DE",
  },
  norwegian: {
    text: "Allmennheten behøver slett ingen nye tanker. Allmennheten er best tjent med de gamle, gode, og anerkjente tanker den allerede har.",
    author: "Henrik Ibsen",
    book: "En folkefiende",
    lang: "nb-NO",
  },
  french: {
    text: "Dans la vie on ne fait pas ce que l'on veut mais on est responsable de ce que l'on est.",
    author: "Jean-Paul Sartre",
    book: "Unknown",
    lang: "fr-FR",
  },
};

// Browser compatibility
const getSpeechRecognition = (): any => {
  if (typeof window !== "undefined") {
    return (
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      null
    );
  }
  return null;
};

// Utility functions
const logEvent = (
  eventLog: HTMLElement,
  event: string,
  details?: string,
): void => {
  const timestamp = new Date().toISOString();
  const logEntry = details
    ? `{event: "${event}", details: "${details}", time: "${timestamp}"}\n`
    : `{event: "${event}", time: "${timestamp}"}\n`;
  eventLog.textContent += logEntry;
};

const getElementByIdSafely = <T extends HTMLElement>(id: string): T | null => {
  const element = document.getElementById(id);
  return element as T | null;
};

document.addEventListener("DOMContentLoaded", () => {
  const speechInitialized = initSpeechSynthesis();
  const recognitionInitialized = initSpeechRecognition();

  if (!speechInitialized) {
    console.warn("Speech synthesis initialization failed");
  }

  if (!recognitionInitialized) {
    console.warn("Speech recognition initialization failed");
  }
});

const initSpeechSynthesis = (): boolean => {
  try {
    // Check for speech synthesis support
    if (typeof speechSynthesis === "undefined") {
      console.warn("Speech synthesis not supported in this browser");
      return false;
    }

    // Get all required elements
    const langSelector =
      getElementByIdSafely<HTMLSelectElement>("lang-selector");
    const speakButton = getElementByIdSafely<HTMLElement>("speak-button");
    const pitchInput = getElementByIdSafely<HTMLInputElement>("pitch");
    const pitchValue = getElementByIdSafely<HTMLElement>("pitch-value");
    const rateInput = getElementByIdSafely<HTMLInputElement>("rate");
    const rateValue = getElementByIdSafely<HTMLElement>("rate-value");
    const voiceSelector =
      getElementByIdSafely<HTMLSelectElement>("voice-selector");
    const langSource = getElementByIdSafely<HTMLElement>("lang-source");
    const citation = getElementByIdSafely<HTMLElement>("citation");

    if (
      !langSelector ||
      !speakButton ||
      !pitchInput ||
      !pitchValue ||
      !rateInput ||
      !rateValue ||
      !voiceSelector ||
      !langSource ||
      !citation
    ) {
      console.error("Required speech synthesis elements not found");
      return false;
    }

    speechElements = {
      langSelector,
      speakButton,
      pitchInput,
      pitchValue,
      rateInput,
      rateValue,
      voiceSelector,
      langSource,
      citation,
    };

    // Event listeners
    langSelector.addEventListener("change", handleLanguageChange);
    speakButton.addEventListener("click", handleSpeakButtonClick);
    pitchInput.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      pitchValue.textContent = target.value;
    });
    rateInput.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      rateValue.textContent = target.value;
    });

    // Initialize voices
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize speech synthesis:", error);
    return false;
  }
};

const handleSpeakButtonClick = (event: Event): void => {
  event.preventDefault();

  if (!speechElements) return;

  if (speechSynthesis.speaking) {
    return;
  }

  const selectedLang = speechElements.langSelector.value;
  const languageData = LANGUAGES[selectedLang];

  if (languageData) {
    speak(languageData.text, languageData.lang);
  }
};

const handleLanguageChange = (event: Event): void => {
  const selectedLang = (event.target as HTMLSelectElement).value;
  const languageData = LANGUAGES[selectedLang];

  if (!speechElements || !languageData) return;

  speechElements.langSource.textContent = languageData.text;
  speechElements.citation.textContent = `${languageData.author}, ${languageData.book}`;

  speak(languageData.text, languageData.lang);
};

const initSpeechRecognition = (): boolean => {
  try {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      console.warn("Speech recognition not supported in this browser");
      return false;
    }

    // Get all required elements
    const langSelector = getElementByIdSafely<HTMLSelectElement>(
      "lang-selector-recog",
    );
    const output = getElementByIdSafely<HTMLElement>("log");
    const eventLog = getElementByIdSafely<HTMLElement>("event-log");
    const recogButton = getElementByIdSafely<HTMLElement>("recog-button");
    const contCheckbox = getElementByIdSafely<HTMLInputElement>("cont");
    const intCheckbox = getElementByIdSafely<HTMLInputElement>("int");

    if (
      !langSelector ||
      !output ||
      !eventLog ||
      !recogButton ||
      !contCheckbox ||
      !intCheckbox
    ) {
      console.error("Required speech recognition elements not found");
      return false;
    }

    recognitionElements = {
      langSelector,
      output,
      eventLog,
      recogButton,
      contCheckbox,
      intCheckbox,
    };

    // Create recognition instance
    currentRecognition = new SpeechRecognitionClass();
    setupRecognition(currentRecognition, recognitionElements);

    // Event listeners
    recogButton.addEventListener("click", handleRecognitionButtonClick);

    return true;
  } catch (error) {
    console.error("Failed to initialize speech recognition:", error);
    return false;
  }
};

const setupRecognition = (
  recognition: any,
  elements: RecognitionElements,
): void => {
  recognition.continuous = elements.contCheckbox.checked;
  recognition.lang = elements.langSelector.value;
  recognition.interimResults = elements.intCheckbox.checked;
  recognition.maxAlternatives = 1;

  // Event handlers
  recognition.onresult = (event: any) => {
    console.log(event.results);
    const result = event.results[0][0];
    const text = result.transcript;
    const confidence = (result.confidence * 100).toFixed(2);

    elements.output.textContent += `{result: "${text}", confidence: "${confidence}%"}\n`;
    logEvent(elements.eventLog, "result");
  };

  recognition.onspeechstart = () => logEvent(elements.eventLog, "speechstart");

  recognition.onspeechend = () => {
    recognition.stop();
    elements.recogButton.innerHTML = "Recognise";
    logEvent(elements.eventLog, "speechend");
  };

  recognition.addEventListener("nomatch", () => {
    elements.output.textContent += `{result: "no match"}\n`;
    logEvent(elements.eventLog, "nomatch");
  });

  recognition.onerror = (event: any) => {
    elements.output.textContent += `{error: "${event.error}"}\n`;
    logEvent(elements.eventLog, "error", event.error);
  };

  recognition.onaudiostart = () => logEvent(elements.eventLog, "audiostart");
  recognition.onaudioend = () => logEvent(elements.eventLog, "audioend");
  recognition.onend = () => logEvent(elements.eventLog, "end");
  recognition.onstart = () => logEvent(elements.eventLog, "start");
  recognition.onsoundstart = () => logEvent(elements.eventLog, "soundstart");
  recognition.onsoundend = () => logEvent(elements.eventLog, "soundend");
};

const handleRecognitionButtonClick = (event: Event): void => {
  event.preventDefault();

  if (!currentRecognition || !recognitionElements) return;

  currentRecognition.lang = recognitionElements.langSelector.value;

  if (recognitionElements.recogButton.innerHTML === "Recognise") {
    currentRecognition.start();
    recognitionElements.recogButton.innerHTML = "Recognising...";
  } else {
    currentRecognition.stop();
    recognitionElements.recogButton.innerHTML = "Recognise";
  }
};

const speak = (text: string, lang: string): void => {
  if (!speechElements || typeof speechSynthesis === "undefined") {
    console.error("Speech synthesis not available");
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);

    // Find and set appropriate voice
    const voice = voices.find((v) => v.lang === lang);
    if (voice) {
      utterance.voice = voice;
      updateVoiceSelector(voice);
    }

    // Set pitch and rate with validation
    const pitch = parseFloat(speechElements.pitchInput.value) || 1;
    const rate = parseFloat(speechElements.rateInput.value) || 1;
    utterance.pitch = Math.max(0, Math.min(2, pitch)); // Clamp between 0-2
    utterance.rate = Math.max(0.1, Math.min(10, rate)); // Clamp between 0.1-10

    // Event handlers
    utterance.onend = () => {
      if (speechElements) {
        speechElements.speakButton.innerHTML = getIcon("play");
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      if (speechElements) {
        speechElements.speakButton.innerHTML = getIcon("play");
      }
    };

    // Start speaking
    speechSynthesis.speak(utterance);
    speechElements.speakButton.innerHTML = getIcon("pause");
  } catch (error) {
    console.error("Failed to speak:", error);
  }
};

const updateVoiceSelector = (voice: SpeechSynthesisVoice): void => {
  if (!speechElements) return;

  const option = speechElements.voiceSelector.querySelector(
    `option[data-name="${voice.name}"]`,
  ) as HTMLOptionElement;

  if (option) {
    speechElements.voiceSelector.value = option.value;
  }
};

const populateVoiceList = (): void => {
  if (!speechElements || typeof speechSynthesis === "undefined") {
    return;
  }

  try {
    voices = speechSynthesis.getVoices();

    // Clear existing options
    speechElements.voiceSelector.innerHTML = "";

    if (voices.length === 0) {
      console.warn("No voices available");
      return;
    }

    for (const voice of voices) {
      const option = document.createElement("option");
      option.textContent = `${voice.name} (${voice.lang})`;
      option.value = `${voice.name} (${voice.lang})`;

      if (voice.default) {
        option.selected = true;
      }

      option.setAttribute("data-lang", voice.lang);
      option.setAttribute("data-name", voice.name);
      speechElements.voiceSelector.appendChild(option);
    }
  } catch (error) {
    console.error("Failed to populate voice list:", error);
  }
};

// Cleanup function for proper memory management
const cleanup = (): void => {
  if (currentRecognition) {
    currentRecognition.stop();
    currentRecognition = null;
  }

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  speechElements = null;
  recognitionElements = null;
};

// Cleanup on page unload
window.addEventListener("beforeunload", cleanup);
window.addEventListener("pagehide", cleanup);

```
{: class="full-bleed font-highlight"}