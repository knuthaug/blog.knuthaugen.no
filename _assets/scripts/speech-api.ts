import { findLanguages, hamburgerMenu, addScrollHandler } from "./common.ts";

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

document.addEventListener("DOMContentLoaded", () => {
  load();
  findLanguages();
  hamburgerMenu();
  addScrollHandler();
});

function load() {
  langSelector = document.getElementById(
    "lang-selector",
  ) as HTMLSelectElement | null;
  clickHandlers();
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

function clickHandlers() {
  langSelector?.addEventListener("change", languageSwitcher);
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
  const selectedOption =
    voiceSelect.selectedOptions[0].getAttribute("data-name") ?? "unknown";

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
  speechSynthesis.speak(utterThis);
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
