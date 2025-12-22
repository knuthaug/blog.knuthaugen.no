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
  findLanguages();
});

function updateConnectionStatus() {
  console.log("Connection change detected", myNavigator.connection);
  updateCurrent(myNavigator.connection);
  addToLog(myNavigator.connection);
  addToDatasets(myNavigator.connection);
}

function findLanguages(): void {
  document.querySelectorAll("pre.font-highlight code").forEach((element) => {
    const classes = element.getAttribute("class");
    const parts = classes ? classes.split("language-") : [];
    element.parentElement!.setAttribute("data-lang", parts[1] || "text");
  });
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
  (log as HTMLPreElement).innerText += `{ effective type:${
    connection.effectiveType
  }${connection.type ? ` (${connection.type})` : ""}, downlink:${
    connection.downlink
  }Mbps${
    connection.downlinkMax ? ` (max: ${connection.downlinkMax}Mbps` : ""
  }, rtt:${connection.rtt}ms, saveData:${connection.saveData} }\n`;

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
