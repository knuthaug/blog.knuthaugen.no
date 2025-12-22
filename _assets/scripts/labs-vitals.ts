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
let count = 0;
let attrCount = 0;
document.addEventListener("DOMContentLoaded", () => {
  load();
  logAnchor = document.getElementById("log-anchor") as HTMLElement;
  attrLogAnchor = document.getElementById("attr-log-anchor") as HTMLElement;
});

function findLanguages(): void {
  document.querySelectorAll("pre.font-highlight code").forEach((element) => {
    const classes = element.getAttribute("class");
    const parts = classes ? classes.split("language-") : [];
    element.parentElement!.setAttribute("data-lang", parts[1] || "text");
  });
}

function metricCallback(metric: any) {
  addToDetails(logAnchor, metric, ++count);
}

function metricCallbackAttr(metric: any) {
  addToDetails(attrLogAnchor, metric, ++attrCount);
}

function load() {
  findLanguages();
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

function addToDetails(element: HTMLElement, data: any, count: number) {
  if (data.name === "CLS") {
    //writing cls values in this manner will generate new CLS events
    return;
  }

  const detail = document.createElement("details");
  const summary = document.createElement("summary");
  summary.innerText = `${count} ${data.name} - ${data.value.toFixed(2)}ms`;
  detail.appendChild(summary);
  const codeElement = document.createElement("pre");
  codeElement.classList = "font-highlight";
  const pre = document.createElement("code");
  pre.innerText = JSON.stringify(data, undefined, 2);
  codeElement.appendChild(pre);
  detail.append(codeElement);

  if (element.children.length > 0) {
    element.lastChild?.after(detail);
  } else {
    element.appendChild(detail);
  }
}
