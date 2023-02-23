
import { Config, ConfigurationRecord, Counters,Process } from "../../src/classes";
export class Result<T, E>{
  constructor(public ok:T,public err:E){}
  unwrap():T{
    if(this.err !== null){
      throw this.err
    }else {
      return this.ok
    }
  }
};
export class Ok<T> extends Result<T,any> {
  constructor(ok:T){
    super(ok,null)
  }
}
export class Err<E> extends Result<any,E> {
  constructor(err:E){
    super(null,err)
  }
}

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
      return new Ok<Counters>(Counters.fromJson(json));
    } catch (err) {
      return new Err<Error>(err as Error);
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
      return new Ok<Counters>(Counters.fromJson(json));
    } catch (err) {
      return new Err<Error>(err as Error);
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
      return new Ok<Config>(Config.fromJson(json));
    } catch (err) {
      return new Err<Error>(err as Error);
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
      return new Ok<Config>(Config.fromJson(json));
    } catch (err) {
      return new Err<Error>(err as Error);
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
      return new Ok<ShutdownResult>(json as ShutdownResult);
    } catch (err) {
      return new Err<Error>(err as Error);
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
      return new Ok<ShutdownResult>(json as ShutdownResult);
    } catch (err) {
      return new Err<Error>(err as Error);
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
      return new Ok<ShutdownResult>(json as ShutdownResult);
    } catch (err) {
      return new Err<Error>(err as Error);
    }
  }
  async killAllInstancesOf(conf: ConfigurationRecord): Promise<Result<any, Error>> {
    try {
      console.log("API.sendMessage",{url:`http://${this.host}/pkillall`})
      const response = await fetch(`http://${this.host}/pkillall`, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(conf,null," "),
      });
      const json = await response.json();
      return new Ok<ShutdownResult>(json as ShutdownResult);
    } catch (err) {
      return new Err<Error>(err as Error);
    }
  }
  async getProcessList(): Promise<Result<Process[], Error>> {
    try {
      console.log("API.sendMessage",{url:`http://${this.host}/processes`})
      const response = await fetch(`http://${this.host}/processes`, {
        method: "GET",
        redirect: "follow",
      });
      const json = await response.json();
      return new Ok<Process[]>(json.lines.map(Process.fromJson));
    } catch (err) {
      return new Err<Error>(err as Error);
    }
  }
}
