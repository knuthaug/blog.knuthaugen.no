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
<p class="quote" id="lang-source">"Almennheten behøver slett ingen nye tanker. Almennheten er best tjent med de gamle, gode, og anerkjente tanker den allerede har."</p>
<p class="citation" id="citation">Henrik Ibsen, En folkefiende</p>

### Speech Controls

<form>
 <label for="voice-selector">Voice</label>
 <select id="voice-selector"></select>
</form>

### The Code Running on This Page

```typescript
import { NetworkInformation } from "./types";
import Chart from "chart.js/auto";
```
{: class="full-bleed font-highlight"}