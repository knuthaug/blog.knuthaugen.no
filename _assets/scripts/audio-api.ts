import { getIcon } from "./common.ts";
import WaveSurfer from "wavesurfer.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";

// Define the equalizer bands
const eqBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

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
  console.log("Init wavesurfer setup", eqBands);
  initWaveSurfer();
});

function initWaveSurfer() {
  // Create a WaveSurfer instance and pass the media element
  const viz = getElementByIdSafely<HTMLDivElement>("viz")!;
  const video = getElementByIdSafely<HTMLVideoElement>("video")!;
  const wavesurfer = WaveSurfer.create({
    container: viz,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    url: "/assets/media/song.wav",
    mediaControls: true,
    barWidth: 2,
    // Optionally, specify the spacing between bars
    barGap: 1,
    // And the bar radius
    barRadius: 2,
  });

  wavesurfer.registerPlugin(
    Spectrogram.create({
      // Display frequency labels on the left side
      labels: true,

      // Height of the spectrogram in pixels
      height: 200,

      // Render separate spectrograms for each audio channel
      // Set to false to combine all channels into one spectrogram
      splitChannels: false,

      // Frequency scale type:
      // - 'linear': Standard linear frequency scale (0-20kHz)
      // - 'logarithmic': Logarithmic scale, better for low frequencies
      // - 'mel': Mel scale based on human hearing perception (default)
      // - 'bark': Bark scale for psychoacoustic analysis
      // - 'erb': ERB scale for auditory filter modeling
      scale: "mel",

      // Frequency range to display (in Hz)
      frequencyMax: 8000, // Maximum frequency to show
      frequencyMin: 0, // Minimum frequency to show

      // FFT parameters
      fftSamples: 1024, // Number of samples for FFT (must be power of 2)
      // Higher values = better frequency resolution, slower rendering

      // Visual styling
      labelsBackground: "rgba(0, 0, 0, 0.1)", // Background for frequency labels

      // Performance optimization
      useWebWorker: true, // Use web worker for FFT calculations (improves performance)
      // fallbackToMainThread: true, // Set false to emit 'error' instead of computing a failed
      //                                worker FFT on the main thread (can freeze on long files)

      // For very long audio files, render only the visible time range instead of
      // the whole file up front (replaces the deprecated WindowedSpectrogramPlugin -
      // see examples/spectrogram-windowed.js):
      // rendering: 'windowed',
      // progressiveLoading: true, // windowed only: keep loading segments in the background

      // Additional options you can configure:
      //
      // Window function for FFT (affects frequency resolution vs time resolution):
      // windowFunc: 'hann' | 'hamming' | 'blackman' | 'bartlett' | 'cosine' | 'gauss' | 'lanczoz' | 'rectangular' | 'triangular'
      //
      // Color mapping for frequency intensity:
      // colorMap: 'gray' | 'igray' | 'roseus' | custom array
      //
      // Gain and range for color scaling:
      // gainDB: 20,        // Brightness adjustment (default: 20dB)
      // rangeDB: 80,       // Dynamic range (default: 80dB)
      //
      // Praat-style display options (combine with windowFunc: 'gauss', scale: 'linear',
      // colorMap: 'gray' and rangeDB: 70 for the classic Praat look):
      // preEmphasis: 6,    // dB/octave boost above 1 kHz so speech formants stay visible
      // autoGain: true,    // Map the loudest bin to black instead of using the fixed gainDB
      //
      // Overlap between FFT windows:
      // noverlap: null,    // Auto-calculated by default, or set manually
      //
      // Zero-padded FFT length (power of 2, >= fftSamples):
      // fftSize: 4096,     // Interpolates extra frequency bins for a smoother image without
      //                    // changing the analysis window, hop, or time resolution
      //
      // Maximum canvas width for performance:
      // maxCanvasWidth: 30000,  // Split large spectrograms into multiple canvases
    }),
  );

  // Event listeners for spectrogram interactions
  wavesurfer.on("spectrogram-ready", () => {
    console.log("Spectrogram has finished rendering");
  });

  wavesurfer.on("spectrogram-click", (relativeX) => {
    console.log("Clicked on spectrogram at position:", relativeX);
    // You can use relativeX to seek to that position in the audio
    wavesurfer.setTime(relativeX * wavesurfer.getDuration());
  });

  // HTML UI
  // Create a vertical slider for each band

  const heading = document.createElement("h2");
  heading.textContent = "Equalizer";
  heading.classList.add("eq-header");
  viz.appendChild(heading);

  const container = document.createElement("p");
  container.classList.add("eq-container");
  const sliders = eqBands.map(() => {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.orient = "vertical";
    slider.style.appearance = "slider-vertical";
    slider.style.width = "8%";
    slider.min = String(-40);
    slider.max = String(40);
    slider.value = "0"; // String(Math.random() * 40 - 20);
    slider.step = String(0.1);
    container.appendChild(slider);
    return slider;
  });
  viz.appendChild(container);

  wavesurfer.on("click", () => {
    wavesurfer.playPause();
  });

  wavesurfer.once("play", () => {
    // Create Web Audio context
    const audioContext = new AudioContext();

    // Create a biquad filter for each band
    const filters = eqBands.map((band) => {
      const filter = audioContext.createBiquadFilter();
      filter.type =
        band <= 32 ? "lowshelf" : band >= 16000 ? "highshelf" : "peaking";
      filter.gain.value = Math.random() * 40 - 20;
      filter.Q.value = 1; // resonance
      filter.frequency.value = band; // the cut-off frequency
      return filter;
    });

    const audio = wavesurfer.getMediaElement();
    if (audio === null) return;
    const mediaNode = audioContext.createMediaElementSource(audio);

    // Connect the filters and media node sequentially
    const equalizer = filters.reduce((prev, curr) => {
      prev.connect(curr);
      return curr;
    }, mediaNode);

    // Connect the filters to the audio output
    equalizer.connect(audioContext.destination);

    sliders.forEach((slider, i) => {
      const filter = filters[i];
      filter.gain.value = Number(slider.value);
      slider.oninput = (e) =>
        (filter.gain.value = Number((e.target as HTMLInputElement).value));
    });
  });
}
