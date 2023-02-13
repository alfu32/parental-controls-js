import fs from "node:fs";
import { Router } from "./webserver.router.ts";
import {
  Config,
  ConfigurationRecord,
  Counters, Process,
  sleep
} from "./classes.ts";
import { spawnProcess } from "./spawnProcess.ts";
import { HttpRequest } from "./webserver.router.ts";
import { getTransientConfig } from "./getTransientConfig.ts";
import { Zenity,NotifySend, INotifier } from "./desktop-notifications.ts";
const NOTIFIER:INotifier = NotifySend;

export const router: Router = new Router();

router.add("PUT", "/config", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  // const data = await requestEvent.event.request.text()
  const json = await requestEvent.json();
  const config = Config.fromJson(json);
  // The requestEvent's `.respondWith()` method is how we send the response
  // back to the client.
  fs.writeFileSync("config.json", JSON.stringify(config, null, "  "));
  return requestEvent.respondWithJson(config);
});

router.middleware.push(function(requestEvent: HttpRequest): HttpRequest {
  return requestEvent.copy();
});
router.add("GET", "/config", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const config = await Config.fromFile("config.json");
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromFile(countfile, config);
  // The requestEvent's `.respondWith()` method is how we send the response
  // back to the client.
  config.applications.forEach(
    (appConfig) => {
      let statusItem = counters.applications.find((ci) => ci.appid === appConfig.appid
      );
      if(!statusItem) {
        statusItem = ConfigurationRecord.from(appConfig);
        counters.applications.push(statusItem);
      }
      statusItem.allowedMinutes = appConfig.allowedMinutes;
    }
  );
  return requestEvent.respondWithJson(config);
});
router.add("GET", "/counters", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  let date: Date = new Date();
  if(requestEvent.params.date) {
    try {
      date = new Date(requestEvent.params.date);
    } catch(err) {
      date = new Date();
    }
  }
  if(date.toString() === "Invalid Date") {
    date = new Date();
  }

  const {
    dfolder, dprefix, hourMinute, d, logs, countersDir, logfile, countfile,
  } = getTransientConfig(date);
  const config = await Config.fromFile("config.json");
  const counters = Counters.fromFile(countfile, config);
  return requestEvent.respondWithJson({
    ...counters,
    dfolder,
    dprefix,
    hourMinute,
    d,
    logs,
    countersDir,
    logfile,
    countfile,
  });
});
router.add("GET", "/counter", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const config = await Config.fromFile("config.json");
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromFile(countfile, config);
  return requestEvent.respondWithJson(
    counters.applications.find((ci) => ci.appid === requestEvent.params?.appid)
  );
});
router.add("PUT", "/counters", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const json = await requestEvent.json();
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromJson(json);
  fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
  return requestEvent.respondWithJson(counters);
});
router.add("POST", "/shutdown", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const text = await requestEvent.text();
  const notificationResult = await NOTIFIER.error(
    "Shutdown",
    "Shutting computer down in 59 seconds. Save your work !"
  );
  const shutdownResult = await spawnProcess("shutdown", []);
  return requestEvent.respondWithJson({ shutdownResult, notificationResult });
});
router.add(
  "POST",
  "/shutdown/abort",
  async function(requestEvent: HttpRequest) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const text = await requestEvent.text();
    const notificationResult = await NOTIFIER.notification(
      "Shutdown",
      "Shutting down computer aborted!"
    );
    const shutdownCancelResult = await spawnProcess("shutdown", ["-c"]);
    return requestEvent.respondWithJson({
      notificationResult,
      shutdownCancelResult,
    });
  }
);
router.add("GET", "/processes", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const psListResult = await spawnProcess("ps", [`-aux`]);
  return requestEvent.respondWithJson({
    lines: psListResult.out.split("\n").map(Process.fromFixedLengthText),
    error: psListResult.error,
  });
});
router.add("GET", "/process", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const pid = requestEvent.params.pid;
  const psListResult = await spawnProcess(`ps`, ["-aux"]);
  return requestEvent.respondWithJson({
    lines: psListResult.out.split("\n")
      .map(Process.fromFixedLengthText)
      .filter((process: Process, i: number) => i === 0 || process.PID === pid),
    error: psListResult.error,
  });
});
router.add("POST", "/kill", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const appid = await requestEvent.params.appid;
  const notificationResult = await NOTIFIER.info(
    "Application shutdown",
    `The application ${appid} will be shut down in 10 seconds`
  );
  await sleep(10000);
  const pkillResult = await spawnProcess("pkill", [appid]);
  return requestEvent.respondWithJson({
    ...pkillResult,
    notificationResult,
    appid,
  });
});
router.add("POST", "/message", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const message = await requestEvent.text();
  const notificationResult = await NOTIFIER.info(
    "From Parental Controls",
    message
  );
  return requestEvent.respondWithJson({ notificationResult });
});
router.add("GET", "/notification", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const message = requestEvent.params.message;
  const title = requestEvent.params.title || "From Mother";
  if(message !== undefined) {
    const notificationResult = await NOTIFIER.notification(title, message);
    return requestEvent.respondWithJson(notificationResult);
  } else {
    return requestEvent.respondWithJson({ message });
  }
});

