import {
  InfluxDB,
  Point,
  HttpError,
  WriteApi,
} from "@influxdata/influxdb-client-browser";
import { Vitals } from "./types";

const token =
  "xLOvSltSrpOZxEabVNTIvgmfsjcZpXvyK6v6Dp6_ctO603rFDKJX8XF7P_3fdAHntZb8sp_1izssJVPfxULoQw==";
const bucket = "webvitals";
const org = "priv";
const url = "https://data.knuthaugen.no";

export class Influx {
  api: WriteApi;

  constructor() {
    this.api = new InfluxDB({ url, token }).getWriteApi(org, bucket, "ns");
  }

  writeVitals(vitals: Vitals, page: string = document.location.pathname) {
    const point = new Point("vitals")
      .tag("page", page)
      .floatField("lcp", parse(vitals.lcp))
      .floatField("fcp", parse(vitals.fcp))
      .floatField("ttfb", parse(vitals.ttfb))
      .floatField("cls", parse(vitals.cls));
    this.api.writePoint(point);
    console.log(` ${point}`);
    this.api.flush();
  }

  writeINP(inp: number, page: string = document.location.pathname) {
    const point = new Point("vitals").tag("page", page).floatField("inp", inp);
    this.api.writePoint(point);
    console.log(` ${point}`);
  }

  async destroy() {
    try {
      await this.api.close();
      console.log("influx client flushed and closed");
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError && e.statusCode === 401) {
        console.error("Influxdb http error", e);
      } else {
        console.error("Influxdb error", e);
      }
    }
  }
}

function parse(str: string): number {
  if (str === "") {
    return 0.0;
  }
  return parseFloat(stripUnit(str));
}

function stripUnit(str: string): string {
  return str.split(" ")[0];
}
