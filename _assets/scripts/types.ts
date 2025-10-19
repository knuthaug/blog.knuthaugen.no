export interface Vitals {
  lcp: string;
  fcp: string;
  ttfb: string;
  inp: string;
  cls: string;
}

export interface NetworkInformation {
  downlink: number;
  downlinkMax?: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  type?: string;
  addEventListener(
    type: "change",
    listener: () => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
}
