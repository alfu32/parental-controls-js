import fs, { readFile, readFileSync } from "node:fs";
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
import { NotifySend, INotifier } from "./desktop-notifications.ts";
import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";
import process from "node:process";
const NOTIFIER:INotifier = NotifySend;

export const router: Router = new Router();
// deno-lint-ignore require-await
router.add("GET", "/release.info.json", async function(requestEvent: HttpRequest) {
  const releaseInfo = JSON.parse(readFileSync('release.info.json').toString("utf-8"))
  return requestEvent.respondWithJson(releaseInfo);
},"void","ReleaseInfo");

// deno-lint-ignore require-await
router.add("GET", "/env", async function(requestEvent: HttpRequest) {
  return requestEvent.respondWithJson(process.env);
},"void","NodeJS.ProcessEnv");
// deno-lint-ignore require-await
router.add("GET", "/api.json", async function(requestEvent: HttpRequest) {
  return requestEvent.respondWithJson({
    routes:Object.keys(router.routeHandlers).map(
      mp => {
        const handler=router.routeHandlers[mp]
        return {
          method:mp.split('|')[0],
          path:mp.split('|')[1],
          handler:Reflect.getMetadata("router:handlers",handler)
        }
      }
    )
  });
},"void","RouterInfo");
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
},Config.ctor(),Config.ctor());

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
},"void",Config.ctor());
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
},"void",Counters.ctor());
router.add("GET", "/counter", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const config = await Config.fromFile("config.json");
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromFile(countfile, config);
  return requestEvent.respondWithJson(
    counters.applications.find((ci) => ci.appid === requestEvent.params?.appid)
  );
},"appid:string",ConfigurationRecord.ctor());
router.add("PUT", "/counters", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const json = await requestEvent.json();
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromJson(json);
  fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
  return requestEvent.respondWithJson(counters);
},Counters.ctor(),Counters.ctor());
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
},"void","{ shutdownResult:ProcessResult, notificationResult:ProcessResult }");
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
  },"void","{ notificationResult:ProcessResult, shutdownCancelResult:ProcessResult }"
);
router.add("GET", "/processes", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  
  const psListResult = await spawnProcess("ps", [`-aux`]);
  return requestEvent.respondWithJson({
    lines: psListResult.out.split("\n").map(Process.fromFixedLengthText),
    error: psListResult.error,
  });
},"void","{ lines:Process[], error:Error }");
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
},"pid:string","{ lines:Process[], error:Error }");
router.add("POST", "/pkillall", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const json = await requestEvent.json();
  const cr = ConfigurationRecord.from(json)
  const notificationResult = await NOTIFIER.info(
    "Application shutdown",
    `The application ${cr.appid} will be shut down in 10 seconds`
  );
  await sleep(10000);
  const pkillResult = await spawnProcess("pkill", ['-SIGTERM',cr.processregex]);
  return requestEvent.respondWithJson({
    pkillResult,
    configurationRecord:cr,
    notificationResult,
  });
},"regex:string","{ pkillResult:Process[], configurationRecord:ConfigurationRecord,notificationResult:ProcessResult }");
router.add("POST", "/message", async function(requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const message = await requestEvent.text();
  const notificationResult = await NOTIFIER.info(
    "From Parental Controls",
    message
  );
  return requestEvent.respondWithJson({ notificationResult });
},"message:string","{ notificationResult:ProcessResult }");
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
},"message:string","{ notificationResult:ProcessResult }");

