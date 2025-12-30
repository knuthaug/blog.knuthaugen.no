---
layout: lab-post
title: "Network Information API Test"
published: true
tags: []
date: 2025-10-19
desc: Test page printing out changes to the network information API over time
bundle: ni-api.js
category: labs
---

This page/post tracks and prints every time the network information API detects a change in your devices
network. Most useful on mobile devices when travelling through areas of spotty wireless coverage. 

Works in chrome (61+), Edge (79+), Opera (48+), Chrome Android (38+), Opera Android (25+), Samsung Internet (3+) and
Android WebView (50+), so it's not great and not every part of the spec is implemented either. WebKit team is reluctant based on privacy concerns (can you believe it?)

You can easily test it out by opening devtools and the network pane and fiddle with the throttle network dropdown list. 

[Network Information API Specification](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

### API Information

<span id="support">Browser support:</span> 

<div>
<h4>Downlink</h4>
<canvas id="downlink"></canvas>
</div>

<div>
<h4>RTT (latency)</h4>
<canvas id="rtt"></canvas>
</div>

<p id="current">
current: undefined
</p>

#### Log of Changes
<pre class="tall font-highlight"><code id="log" class="inner-syntax language-json"></code></pre>


### The Code Running on This Page

```typescript
import { NetworkInformation } from "./types.ts";
import Chart from "chart.js/auto";

// Configuration constants
const CHART_GRID_COLOR = "#444444";
const CHART_LINE_COLOR = "rgb(75, 192, 192";
const MAX_DATA_POINTS = 50;

// convince typescript to stop complaining
interface MyNavigator extends Navigator {
  connection: NetworkInformation;
}

const myNavigator: MyNavigator = window.navigator as MyNavigator;

// Cached DOM references
let supportElement: HTMLElement | null = null;
let logElement: HTMLElement | null = null;
let currentElement: HTMLElement | null = null;

// Event listener reference for cleanup
let connectionChangeHandler: (() => void) | null = null;

let downlinkChart: Chart;
let rttChart: Chart;
const downlinkData = {
  labels: [],
  datasets: [
    {
      label: "Downlink (Mbps)",
      data: [],
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

const rttData = {
  labels: [],
  datasets: [
    {
      label: "RTT (latency in ms)",
      data: [],
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  load();
});

// Helper function to create chart configuration
function createChartConfig(label: string): any {
  return {
    type: "line",
    options: {
      scales: {
        y: {
          grid: {
            color: CHART_GRID_COLOR,
          },
        },
        x: {
          grid: {
            color: CHART_GRID_COLOR,
          },
        },
      },
    },
    data: {
      labels: [] as number[],
      datasets: [
        {
          label,
          data: [] as number[],
          fill: false,
          borderColor: CHART_LINE_COLOR,
          tension: 0.1,
        },
      ],
    },
  };
}

// Helper function to format connection info
function formatConnectionInfo(
  connection: NetworkInformation,
  prefix = "",
): string {
  const parts = [
    `${prefix}effective type:${connection.effectiveType}`,
    connection.type ? `(${connection.type})` : null,
    `downlink:${connection.downlink}Mbps`,
    connection.downlinkMax ? `(max: ${connection.downlinkMax}Mbps)` : null,
    `rtt:${connection.rtt}ms`,
    `saveData:${connection.saveData}`,
  ];
  return parts.filter(Boolean).join(", ");
}

function updateConnectionStatus() {
  console.log("Connection change detected", myNavigator.connection);
  updateCurrent(myNavigator.connection);
  addToLog(myNavigator.connection);
  addToDatasets(myNavigator.connection);
}

function load() {
  // Cache DOM elements
  supportElement = document.getElementById("support");
  logElement = document.getElementById("log");
  currentElement = document.getElementById("current");

  initCharts(myNavigator.connection);

  if (!myNavigator.connection) {
    console.log("Network Information API not supported in this browser");
    if (supportElement) {
      supportElement.innerText =
        "Browser support: ❌ Not supported in this browser";
    }
    return;
  }

  if (supportElement) {
    supportElement.innerText = "Browser support: ✅ Supported in this browser";
  }

  console.log("Network Information API Test");
  updateCurrent(myNavigator.connection);
  addToLog(myNavigator.connection);

  // Store event listener reference for cleanup
  connectionChangeHandler = updateConnectionStatus;
  myNavigator.connection.addEventListener("change", connectionChangeHandler);
}

function initCharts(conn: NetworkInformation) {
  const downlinkChartCtx = document.getElementById(
    "downlink",
  ) as HTMLCanvasElement;

  const rttChartCtx = document.getElementById("rtt") as HTMLCanvasElement;

  if (!downlinkChartCtx || !rttChartCtx) {
    console.error("Chart canvas elements not found");
    return;
  }

  const downlinkConfig = createChartConfig("Downlink (Mbps)");
  const rttConfig = createChartConfig("RTT (latency in ms)");

  downlinkChart = new Chart(downlinkChartCtx, downlinkConfig);
  rttChart = new Chart(rttChartCtx, rttConfig);

  if (myNavigator.connection) {
    addToDatasets(conn);
  }
}

function addToDatasets(conn: NetworkInformation) {
  pushToDataset(downlinkChart, conn.downlink);
  pushToDataset(rttChart, conn.rtt);
  downlinkChart.update();
  rttChart.update();
}

function pushToDataset(chart: Chart, value: number) {
  const data = chart.data.datasets[0].data as number[];
  const labels = chart.data.labels as number[];

  data.push(value);

  if (labels.length === 0) {
    labels.push(0);
  } else {
    labels.push(labels[labels.length - 1] + 1);
  }

  // Limit data points to prevent memory issues
  if (data.length > MAX_DATA_POINTS) {
    data.shift();
    labels.shift();
  }
}

function addToLog(connection: NetworkInformation) {
  if (!logElement) return;

  const formattedInfo = formatConnectionInfo(connection, "{ ");
  logElement.innerText += `${formattedInfo} }\n`;
  logElement.scrollTop = logElement.scrollHeight;
}

function updateCurrent(connection: NetworkInformation) {
  if (!currentElement) return;

  currentElement.innerText = formatConnectionInfo(connection, "current: ");
}

// Cleanup function to remove event listeners and destroy charts
function cleanup(): void {
  if (myNavigator.connection && connectionChangeHandler) {
    (myNavigator.connection as any).removeEventListener(
      "change",
      connectionChangeHandler,
    );
  }

  if (downlinkChart) {
    downlinkChart.destroy();
  }

  if (rttChart) {
    rttChart.destroy();
  }
}

// Cleanup on page unload
window.addEventListener("beforeunload", cleanup);
window.addEventListener("pagehide", cleanup);

```
{: class="full-bleed font-highlight"}