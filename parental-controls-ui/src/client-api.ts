import { Config, Counters } from "../../src/classes";

export interface Ok<T> {
  _tag: "Ok";
  ok: T;
  unwrap: () => T;
}
export interface Err<E> {
  _tag: "Err";
  err: E;
  unwrap: () => T;
}
export type Result<T, E> = Ok<T> | Err<E>;
export const Ok = <T, E>(ok: T): Result<T, E> => ({
  _tag: "Ok",
  ok,
  unwrap(): T {
    return this.ok;
  },
});
export const Err = <T, E>(err: E): Result<T, E> => ({
  _tag: "Err",
  err,
  unwrap(): T {
    throw this.err;
    return null as T;
  },
});
export const Result = Object.freeze({ Ok, Err });

export type Some<T> = { _tag: "Some"; some: T };
export type None = { _tag: "None" };
export type Option<T> = Some<T> | None;
export const Some = <T>(some: T): Option<T> => ({ _tag: "Some", some });
export const None = <T>(): Option<T> => ({ _tag: "None" });
export const Option = Object.freeze({ Some, None });

export type ShutdownResult = {
  "shutdownResult": {
    "out": string;
    "error": string;
  };
  "notificationResult": {
    "out": string;
    "error": string;
  };
};
export class ParentalControlsApi {
  constructor(public host: string) {}
  async getCounters(): Promise<Result<Counters, Error>> {
    try {
      console.log("API.getCounters",{url:`http://${this.host}/counters`})
      const response = await fetch(`http://${this.host}/counters`, {
        method: "GET",
        redirect: "follow",
      });
      const json = await response.json();
      return Ok<Counters, Error>(Counters.fromJson(json));
    } catch (err) {
      return Err<Counters, Error>(err);
    }
  }
  async updateCounters(counters: Counters): Promise<Result<Counters, Error>> {
    try {
      console.log("API.updateCounters",{url:`http://${this.host}/counters`})
      const response = await fetch(`http://${this.host}/counters`, {
        method: "PUT",
        redirect: "follow",
        body: JSON.stringify(counters, null, "  "),
      });
      const json = await response.json();
      return Ok<Counters, Error>(Counters.fromJson(json));
    } catch (err) {
      return Err<Counters, Error>(err);
    }
  }
  async getConfig(): Promise<Result<Config, Error>> {
    try {
      console.log("API.getConfig",{url:`http://${this.host}/config`})
      const response = await fetch(`http://${this.host}/config`, {
        method: "GET",
        redirect: "follow",
      });
      const json = await response.json();
      return Ok<Config, Error>(Config.fromJson(json));
    } catch (err) {
      return Err<Config, Error>(err);
    }
  }
  async updateConfig(config: Config): Promise<Result<Config, Error>> {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const raw = JSON.stringify(config);
      console.log("API.updateConfig",{url:`http://${this.host}/config`})
      const response = await fetch(`http://${this.host}/config`, {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      });
      const json = await response.json();
      return Ok<Config, Error>(Config.fromJson(json));
    } catch (err) {
      return Err<Config, Error>(err);
    }
  }
  async shutdown(): Promise<Result<ShutdownResult, Error>> {
    try {
      console.log("API.shutdown",{url:`http://${this.host}/shutdown`})
      const response = await fetch(`http://${this.host}/shutdown`, {
        method: "POST",
        redirect: "follow",
      });
      const json = await response.json();
      return Ok<ShutdownResult, Error>(json as ShutdownResult);
    } catch (err) {
      return Err<ShutdownResult, Error>(err);
    }
  }
  async abortShutdown(): Promise<Result<ShutdownResult, Error>> {
    try {
      console.log("API.abortShutdown",{url:`http://${this.host}/shutdown/abort`})
      const response = await fetch(`http://${this.host}/shutdown/abort`, {
        method: "POST",
        redirect: "follow",
      });
      const json = await response.json();
      return Ok<ShutdownResult, Error>(json as ShutdownResult);
    } catch (err) {
      return Err<ShutdownResult, Error>(err);
    }
  }
  async sendMessage(message: string): Promise<Result<any, Error>> {
    try {
      console.log("API.sendMessage",{url:`http://${this.host}/message`})
      const response = await fetch(`http://${this.host}/message`, {
        method: "POST",
        redirect: "follow",
        body: message,
      });
      const json = await response.json();
      return Ok<ShutdownResult, Error>(json as ShutdownResult);
    } catch (err) {
      return Err<ShutdownResult, Error>(err);
    }
  }
}
