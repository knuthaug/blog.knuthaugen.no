import {
  findLanguages,
  hamburgerMenu,
  addScrollHandler,
  getIcon,
} from "./common.ts";

let langSelector: HTMLSelectElement | null;
const lang: Record<
  string,
  { text: string; author: string; book: string; lang: string }
> = {
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

let voices: SpeechSynthesisVoice[] = [];
// @ts-expect-error foo
let SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
// @ts-expect-error foo
let SpeechRecognitionEvent =
  // @ts-expect-error foo
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

document.addEventListener("DOMContentLoaded", () => {
  findLanguages();
  hamburgerMenu();
  addScrollHandler();
  initSpeechSynthesis();
  initSpeechRecognition();
});

function initSpeechSynthesis() {
  langSelector = document.getElementById(
    "lang-selector",
  ) as HTMLSelectElement | null;

  langSelector?.addEventListener("change", languageSwitcher);
  document
    .getElementById("speak-button")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      if (speechSynthesis.speaking) {
        return;
      }

      const button = document.getElementById("speak-button")!;
      const selectedLang = (
        document.getElementById("lang-selector") as HTMLSelectElement
      ).value;

      speak(lang[selectedLang].text, lang[selectedLang].lang);
    });

  populateVoiceList();

  if (
    typeof speechSynthesis !== "undefined" &&
    speechSynthesis.onvoiceschanged !== undefined
  ) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // click handlers for inputs
  const pitchInput = document.getElementById("pitch") as HTMLInputElement;
  const pitchValue = document.getElementById("pitch-value") as HTMLElement;

  pitchInput.addEventListener("input", (event) => {
    // @ts-ignore
    pitchValue.textContent = event.target?.value;
  });

  const rateInput = document.getElementById("rate") as HTMLInputElement;
  const rateValue = document.getElementById("rate-value") as HTMLElement;
  rateInput.addEventListener("input", (event) => {
    // @ts-ignore
    rateValue.textContent = event.target?.value;
  });
}

function initSpeechRecognition() {
  const langSelector = document.getElementById(
    "lang-selector-recog",
  ) as HTMLSelectElement;

  const output = document.getElementById("log") as HTMLElement;
  const eventLog = document.getElementById("event-log") as HTMLElement;
  const recogButton = document.getElementById("recog-button");

  const recognition = new SpeechRecognition();
  recognition.continuous = (
    document.getElementById("cont") as HTMLInputElement
  ).checked;
  recognition.lang = langSelector.value;
  recognition.interimResults = (
    document.getElementById("int") as HTMLInputElement
  )?.checked;
  recognition.maxAlternatives = 1;

  recogButton?.addEventListener("click", (event) => {
    event.preventDefault();
    recognition.lang = langSelector.value;
    if (recogButton.innerHTML === "Recognise") {
      recognition.start();
      recogButton!.innerHTML = "Recognising...";
    } else {
      recognition.stop();
      recogButton!.innerHTML = "Recognise";
    }
  });

  recognition.onresult = function (event: any) {
    console.log(event.results);
    const text = event.results[0][0].transcript;
    output.textContent += `{result: "${text}", confidence: "${(
      event.results[0][0].confidence * 100
    ).toFixed(2)}%"}\n`;
    eventLog.textContent += `{event: "result", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onspeechstart = function () {
    eventLog.textContent += `{event: "speechstart", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onspeechend = function () {
    recognition.stop();
    recogButton!.innerHTML = "Recognise";
    eventLog.textContent += `{event: "speechend", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.addEventListener("nomatch", (event: any) => {
    output.textContent += `{result: "no match"}\n`;
    eventLog.textContent += `{event: "nomatch", time: "${new Date().toISOString()}"}\n`;
  });

  recognition.onerror = function (event: any) {
    output.textContent += `{error: "${event.error}"}\n`;
    eventLog.textContent += `{event: "error", type: "${
      event.error
    }", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onaudiostart = function () {
    eventLog.textContent += `{event: "audiostart", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onaudioend = function () {
    eventLog.textContent += `{event: "audioend", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onend = function () {
    eventLog.textContent += `{event: "end", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onstart = function () {
    eventLog.textContent += `{event: "start", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onsoundstart = function () {
    eventLog.textContent += `{event: "soundstart", time: "${new Date().toISOString()}"}\n`;
  };

  recognition.onsoundend = function () {
    eventLog.textContent += `{event: "soundend", time: "${new Date().toISOString()}"}\n`;
  };
}

function languageSwitcher(event: Event) {
  const selectedLang = (event.target as HTMLSelectElement).value;
  document.getElementById("lang-source")!.textContent = lang[selectedLang].text;
  document.getElementById(
    "citation",
  )!.textContent = `${lang[selectedLang].author}, ${lang[selectedLang].book}`;

  speak(lang[selectedLang].text, lang[selectedLang].lang);
}

function speak(text: string, lang: string) {
  const voiceSelect = document.getElementById(
    "voice-selector",
  ) as HTMLSelectElement;

  const utterThis = new SpeechSynthesisUtterance(text);

  for (const voice of voices) {
    if (voice.lang === lang) {
      utterThis.voice = voice;
      const matchedOption = Array.from(
        document.querySelectorAll("#voice-selector option"),
      ).find((option) => option.getAttribute("data-name") === voice.name);
      if (matchedOption) {
        voiceSelect.value = `${matchedOption.getAttribute(
          "data-name",
        )} (${matchedOption.getAttribute("data-lang")})`;
      }
      break;
    }
  }

  const pitch = document.getElementById("pitch") as HTMLInputElement;
  const rate = document.getElementById("rate") as HTMLInputElement;
  utterThis.pitch = parseFloat(pitch.value);
  utterThis.rate = parseFloat(rate.value);

  utterThis.onend = () => {
    const button = document.getElementById("speak-button")!;
    button.innerHTML = getIcon("play");
  };

  speechSynthesis.speak(utterThis);
  const button = document.getElementById("speak-button")!;
  button.innerHTML = getIcon("pause");
}

function populateVoiceList() {
  const voiceSelect = document.getElementById(
    "voice-selector",
  ) as HTMLSelectElement;

  voices = speechSynthesis.getVoices();

  for (const voice of voices) {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;

    if (voice.default) {
      option.selected = true;
    }

    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.appendChild(option);
  }
}
