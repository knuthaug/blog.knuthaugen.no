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

<pre class="font-highlight full-bleed scrollable">
<code id="log" class="inner-syntax"></code>
</pre>

### Web Vitals (attribution build)

<pre class="font-highlight full-bleed scrollable">
<code id="attr-log" class="inner-syntax"></code>
</pre>


### The Code Running on This Page


<pre class="font-highlight full-bleed no-overflow">
<code class="inner-syntax">
import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
import {
  onCLS as onCLSAttr,
  onFCP as onFCPAttr,
  onLCP as onLCPAttr,
  onINP as onINPAttr,
  onTTFB as onTTFBAttr,
} from "web-vitals/attribution";
import { printTokens, tokenize } from "./json-tokenizer";

let log: HTMLPreElement;
let attrLog: HTMLPreElement;

document.addEventListener("DOMContentLoaded", () => {
  load();
  log = document.getElementById("log") as HTMLPreElement;
  attrLog = document.getElementById("attr-log") as HTMLPreElement;
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

function addToLog(element: HTMLPreElement, data: any) {
  if (!element) {
    return;
  }
  element.innerText +=
    JSON.stringify(data, undefined, 2) +
    "\n" +
    "--------------------------------------------\n";

  element.scrollTop = element.scrollHeight;
}

</code>
</pre>

