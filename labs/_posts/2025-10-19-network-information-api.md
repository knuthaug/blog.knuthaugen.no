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
import { NetworkInformation } from "./types";
import Chart from "chart.js/auto";

// convince typescript to stop complaining
interface MyNavigator extends Navigator {
  connection: NetworkInformation;
}

const myNavigator: MyNavigator = window.navigator as MyNavigator;

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

function updateConnectionStatus() {
  updateCurrent(myNavigator.connection);
  addToLog(myNavigator.connection);
  addToDatasets(myNavigator.connection);
}

function load() {
  const support = document.getElementById("support");

  initCharts(myNavigator.connection);
  if (!myNavigator.connection) {
    console.log("Network Information API not supported in this browser");
    support!.innerText = "Browser support: ❌ Not supported in this browser";
    return;
  }
  support!.innerText = "Browser support: ✅ Supported in this browser";
  console.log("Network Information API Test");
  updateCurrent(myNavigator.connection);
  addToLog(myNavigator.connection);
  myNavigator.connection.addEventListener("change", updateConnectionStatus);
}

function initCharts(conn: NetworkInformation) {
  const downlinkChartCtx = document.getElementById(
    "downlink",
  ) as HTMLCanvasElement;

  const rttChartCtx = document.getElementById("rtt") as HTMLCanvasElement;

  downlinkChart = new Chart(downlinkChartCtx, {
    type: "line",
    data: downlinkData,
    options: {
      scales: {
        y: {
          grid: {
            color: "#444444",
          },
        },
        x: {
          grid: {
            color: "#444444",
          },
        },
      },
    },
  });

  rttChart = new Chart(rttChartCtx, {
    type: "line",
    data: rttData,
    options: {
      scales: {
        y: {
          grid: {
            color: "#444444",
          },
        },
        x: {
          grid: {
            color: "#444444",
          },
        },
      },
    },
  });

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
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels!.length === 0) {
    chart.data.labels?.push(0);
  } else {
    chart.data.labels!.push(
      Number(chart.data.labels![chart.data.labels!.length - 1]) + 1,
    );
  }
}

function addToLog(connection: NetworkInformation) {
  const log = document.getElementById("log");
  if (!log) return;
  (log as HTMLTextAreaElement).value += `effective type:${
    connection.effectiveType
  }${connection.type ? ` (${connection.type})` : ""}, downlink:${
    connection.downlink
  }Mbps${
    connection.downlinkMax ? ` (max: ${connection.downlinkMax}Mbps` : ""
  }, rtt:${connection.rtt}ms, saveData:${connection.saveData}\n`;

  log.scrollTop = log.scrollHeight;
}

function updateCurrent(connection: NetworkInformation) {
  const current = document.getElementById("current");
  if (!current) return;
  current.innerText = `current: effective type:${connection.effectiveType}${
    connection.type ? ` (${connection.type})` : ""
  }, downlink:${connection.downlink}Mbps${
    connection.downlinkMax ? ` (max: ${connection.downlinkMax}Mbps` : ""
  }, rtt:${connection.rtt}ms, saveData:${connection.saveData}`;
}

```
{: class="full-bleed font-highlight"}