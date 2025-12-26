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

Full documentation is available on [MDN web Speech API page](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). There are two central interfaces, namely `SpeechRecognition` responsible for recognising spoken text (captured typically via a microfone) and creting text and `SpeechSyntesis` which generates spoken words from text. Of these `SpeechSyntesis` is widely available (baseline) while `SpeechRecognition` is chrome/edge only (some partial support elsewhere, but it's patchy at best) and sends data to a speech recognition service. 


### The Code Running on This Page

```typescript
import { NetworkInformation } from "./types";
import Chart from "chart.js/auto";
```
{: class="full-bleed font-highlight"}