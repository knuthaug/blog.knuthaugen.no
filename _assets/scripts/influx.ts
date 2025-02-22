import { Vitals } from "./types";
import { detect } from "detect-browser";

const baseURL = "https://api.knuthaugen.no";

async function getToken(page: string): Promise<string> {
  try {
    const res = await fetch(`${baseURL}/token`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ path: page }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await res.json();
    return body.token;
  } catch (err) {
    console.error(err);
    return "";
  }
}

export async function writeVitals(
  vitals: Vitals,
  page: string = document.location.pathname,
) {
  const token = await getToken(page);
  const browser = detect();

  try {
    const res = await fetch(`${baseURL}/vitals`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        ...vitals,
        page: page,
        domain: "blog.knuthaugen.no",
        browser: browser?.name,
        browserVersion: browser?.version,
        os: browser?.os,
      }),
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
    });
    const body = await res.json();
    //console.log("message", body.message);
  } catch (err) {
    console.error(err);
  }
}

export async function writeINP(
  inp: number,
  page: string = document.location.pathname,
) {
  const token = await getToken(page);
  const browser = detect();

  try {
    const res = await fetch(`${baseURL}/inp`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        inp,
        page: page,
        domain: "blog.knuthaugen.no",
        browser: browser?.name,
        browserVersion: browser?.version,
        os: browser?.os,
      }),
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
    });
    const body = await res.json();
    //console.log("message", body.message);
  } catch (err) {
    console.error(err);
  }
}

export async function writeHit(page: string = document.location.pathname) {
  const browser = detect();

  try {
    const res = await fetch(`${baseURL}/hit`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        count: 1,
        page: page,
        domain: "blog.knuthaugen.no",
        browser: browser?.name,
        browserVersion: browser?.version,
        os: browser?.os,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await res.json();
    console.log("hit message", body.message);
  } catch (err) {
    console.error(err);
  }
}
