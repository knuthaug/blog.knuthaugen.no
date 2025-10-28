---
layout: lab-post
title: "Web Vitals Live Measurements"
published: true
tags: []
desc: Test page printing Web Vitals live data
bundle: labs-vitals.js
category: labs
---

### Web Vitals (normal mode)

<form>
    <textarea class="tall" id="log"></textarea>
</form>

### Web Vitals (attribution build)

<form>
    <textarea class="tall" id="attr-log"></textarea>
</form>

### The Code Running on This Page

```typescript
import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
import {
  onCLS as onCLSAttr,
  onFCP as onFCPAttr,
  onLCP as onLCPAttr,
  onINP as onINPAttr,
  onTTFB as onTTFBAttr,
} from "web-vitals/attribution";

let log: HTMLTextAreaElement;
let attrLog: HTMLTextAreaElement;

document.addEventListener("DOMContentLoaded", () => {
  load();
  log = document.getElementById("log") as HTMLTextAreaElement;
  attrLog = document.getElementById("attr-log") as HTMLTextAreaElement;
});

function metricCallback(metric: any) {
  addToLog(log, metric);
}

function metricCallbackAttr(metric: any) {
  addToLog(attrLog, metric);
}

function load() {
  onLCP(metricCallback, { reportAllChanges: true });
  onFCP(metricCallback, { reportAllChanges: true });
  onINP(metricCallback, { reportAllChanges: true });
  onCLS(metricCallback, { reportAllChanges: true });
  onTTFB(metricCallback, { reportAllChanges: true });

  onLCPAttr(metricCallbackAttr, { reportAllChanges: true });
  onFCPAttr(metricCallbackAttr, { reportAllChanges: true });
  onINPAttr(metricCallbackAttr, { reportAllChanges: true });
  onCLSAttr(metricCallbackAttr, { reportAllChanges: true });
  onTTFBAttr(metricCallbackAttr, { reportAllChanges: true });
}

function addToLog(element: HTMLTextAreaElement, data: any) {
  if (!element) {
    return;
  }
  element.value +=
    JSON.stringify(data, undefined, 2) +
    "\n" +
    "--------------------------------------------------------------------\n";

  element.scrollTop = element.scrollHeight;
}

```