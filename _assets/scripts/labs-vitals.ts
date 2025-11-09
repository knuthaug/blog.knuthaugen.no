import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
import {
  onCLS as onCLSAttr,
  onFCP as onFCPAttr,
  onLCP as onLCPAttr,
  onINP as onINPAttr,
  onTTFB as onTTFBAttr,
} from "web-vitals/attribution";

let logAnchor: HTMLElement;
let attrLogAnchor: HTMLElement;

document.addEventListener("DOMContentLoaded", () => {
  load();
  logAnchor = document.getElementById("log-anchor") as HTMLElement;
  attrLogAnchor = document.getElementById("attr-log-anchor") as HTMLElement;
});

function metricCallback(metric: any) {
  addToDetails(logAnchor, metric);
}

function metricCallbackAttr(metric: any) {
  addToDetails(attrLogAnchor, metric);
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

function addToDetails(element: HTMLElement, data: any) {
  if (data.name === "CLS") {
    //writing cls values in this manner will generate new CLS events
    return;
  }

  const detail = document.createElement("details");
  const summary = document.createElement("summary");
  summary.innerText = `${data.name} - ${data.value.toFixed(2)}`;
  detail.appendChild(summary);
  const codeElement = document.createElement("pre");
  codeElement.classList = "font-highlight";
  const pre = document.createElement("code");
  pre.classList = "inner-syntax";
  pre.innerText = JSON.stringify(data, undefined, 2);
  codeElement.appendChild(pre);
  detail.append(codeElement);
  if (element.children.length > 0) {
    element.lastChild?.after(detail);
  } else {
    element.appendChild(detail);
  }
}

function addToLog(element: HTMLPreElement, data: any) {
  if (!element) {
    return;
  }
  element.innerText +=
    JSON.stringify(data, undefined, 2) +
    "\n" +
    "--------------------------------------------------------------\n";

  element.scrollTop = element.scrollHeight;
}
