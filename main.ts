export function add(a: number, b: number): number {
  return a + b;
}
// import moment from 'npm:moment';
import child_process, { execSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import {
  Config,
  ConfigurationRecord,
  Counters,
  mkdirp,
  Process,
  sleep,
} from "./classes.ts";
import { Zenity } from "./desktop-notifications.ts";
import { rateLimited } from "./functions.ts";
import { spawnProcess } from "./spawnProcess.ts";
process.env;
let io = {
  sig: true,
};
import { HttpRequest, Router } from "./webserver.router.ts";

const server = Deno.listen({ port: 8080 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);

const pollTiming = 15000;
const frequencyPerTimeUnit = 60000 / pollTiming;

const router: Router = new Router();
router.middleware.push(function (requestEvent: HttpRequest): HttpRequest {
  return requestEvent.copy()
});
router.add("GET", "/config", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const config = await Config.fromFile("config.json");
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromFile(countfile, config);
  // The requestEvent's `.respondWith()` method is how we send the response
  // back to the client.
  config.applications.forEach(
    (appConfig) => {
      let statusItem = counters.applications.find((ci) =>
        ci.appid === appConfig.appid
      );
      if (!statusItem) {
        statusItem = ConfigurationRecord.from(appConfig);
        counters.applications.push(statusItem);
      }
      statusItem.allowedMinutes = appConfig.allowedMinutes;
    },
  );
  return requestEvent.respondWithJson(config);
});
router.add("PUT", "/config", async function (requestEvent: HttpRequest) {
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
router.add("GET", "/counters", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  let date: Date = new Date();
  if (requestEvent.params.date) {
    try {
      date = new Date(requestEvent.params.date);
    } catch (err) {
      date = new Date();
    }
  }
  if (date.toString() === "Invalid Date") {
    date = new Date();
  }

  const {
    dfolder,
    dprefix,
    hourMinute,
    d,
    logs,
    countersDir,
    logfile,
    countfile,
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
router.add("GET", "/counter", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const config = await Config.fromFile("config.json");
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromFile(countfile, config);
  return requestEvent.respondWithJson(
    counters.applications.find((ci) => ci.appid === requestEvent.params?.appid),
  );
});
router.add("PUT", "/counters", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const json = await requestEvent.json();
  const countfile = getTransientConfig().countfile;
  const counters = Counters.fromJson(json);
  fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
  return requestEvent.respondWithJson(counters);
});
router.add("POST", "/shutdown", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const text = await requestEvent.text();
  // const notificationResult = await spawnProcess('zenity',[`--error`,`--text`,"Shutting computer down in 59 seconds. Save your work !"])
  const notificationResult = await Zenity.error(
    "Shutdown",
    "Shutting computer down in 59 seconds. Save your work !",
  );
  const shutdownResult = await spawnProcess("shutdown", []);
  return requestEvent.respondWithJson({ shutdownResult, notificationResult });
});
router.add(
  "POST",
  "/shutdown/abort",
  async function (requestEvent: HttpRequest) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const text = await requestEvent.text();
    // const notificationResult0 = await spawnProcess('zenity',[`--notification`,`--text`,"Shutting down computer aborted!"])
    const notificationResult = await Zenity.notification(
      "Shutdown",
      "Shutting down computer aborted!",
    );
    const shutdownCancelResult = await spawnProcess("shutdown", ["-c"]);
    return requestEvent.respondWithJson({
      notificationResult,
      shutdownCancelResult,
    });
  },
);
router.add("GET", "/processes", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const psListResult = await spawnProcess("ps", [`-aux`]);
  return requestEvent.respondWithJson({
    lines: psListResult.out.split("\n").map(Process.fromFixedLengthText),
    error: psListResult.error,
  });
});
router.add("GET", "/process", async function (requestEvent: HttpRequest) {
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
router.add("POST", "/kill", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const appid = await requestEvent.params.appid;
  const notificationResult = await Zenity.info(
    "Application shutdown",
    `The application ${appid} will be shut down in 10 seconds`,
  );
  // await spawnProcess('zenity',[`--error`,`--text`,`The application ${appid} will be shut down in 10 seconds`])
  await sleep(10000);
  const pkillResult = await spawnProcess("pkill", [appid]);
  return requestEvent.respondWithJson({
    ...pkillResult,
    notificationResult,
    appid,
  });
});
router.add("POST", "/message", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const message = await requestEvent.text();
  // const notificationResult0 = await spawnProcess('zenity',[`--warning`,`--text`,message])
  const notificationResult = await Zenity.info(
    "important message from Mother",
    message,
  );
  return requestEvent.respondWithJson({ notificationResult });
});
router.add("GET", "/notification", async function (requestEvent: HttpRequest) {
  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const message = requestEvent.params.message;
  const title = requestEvent.params.title || "From Mother";
  if (message !== undefined) {
    // const notificationResult = await spawnProcess('zenity',[`--info`,`--text`,message])
    const notificationResult = await Zenity.notification(title, message);
    return requestEvent.respondWithJson(notificationResult);
  } else {
    return requestEvent.respondWithJson({ message });
  }
});

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Promise.all(
    [
      (async () => {
        for await (const conn of server) {
          serveHttp(conn);
        }
      })(),
      (async () => {
        for await (const iResult of mainLoop()) {
          console.log({ iResult });
        }
      })(),
    ],
  );
}
async function* mainLoop() {
  if (!fs.existsSync("config.json")) {
    fs.writeFileSync("config.json", JSON.stringify(new Config(), null, "  "));
  }
  while (io.sig) {
    const config = await Config.fromFile("config.json");
    // const md=moment(d.getTime());
    const {
      logs,
      countersDir,
      hourMinute,
      countfile,
    } = getTransientConfig();
    if(!fs.existsSync(countersDir)){
      mkdirp(countersDir)
    }
    if(!fs.existsSync(logs)){
      mkdirp(logs)
    }
    const counters = Counters.fromFile(countfile, config);

    const iResult = backend_worker_synchro_iteration({
      counters,
      config,
      hourMinute,
    });
    const i2Result = rateLimited(process_notifications,50000)(iResult);

    fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
    fs.writeFileSync("config.json", JSON.stringify(config, null, "  "));

    await sleep(pollTiming);
    yield iResult;
  }
}
async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn: Deno.HttpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    const req = HttpRequest.from(requestEvent);
    router.handle(req);
  }
}
function getTransientConfig(refDate: Date = new Date()): {
  dfolder: string;
  dprefix: string;
  hourMinute: string;
  d: Date;
  logs: string;
  countersDir: string;
  logfile: string;
  countfile: string;
} {
  const d = refDate.toString() === "Invalid Date" ? new Date() : refDate;
  const hourMinute = `${d.getHours().toString(10).padStart(2, "0")}${
    d.getMinutes().toString(10).padStart(2, "0")
  }`;
  const dfolder = `${d.getFullYear()}/${
    (d.getMonth() + 1).toString(10).padStart(2, "0")
  }`; // md.format("YYYY/MM")
  const dprefix = `${dfolder}/${d.getDate().toString(10).padStart(2, "0")}`; //md.format("YYYY/MM/DD")
  const logs = `logs/${dfolder}`;
  const countersDir = `counters/${dfolder}`;
  const logfile = `logs/${dprefix}.log`;
  const countfile = `counters/${dprefix}.json`;
  return {
    dfolder,
    dprefix,
    hourMinute,
    d,
    logs,
    countersDir,
    logfile,
    countfile,
  };
}
function backend_worker_synchro_iteration(
  params: { counters: Counters; config: Config; hourMinute: string },
): { counters: Counters; config: Config; hourMinute: string } {
  const { counters, config, hourMinute } = params;
  let addToTotal = false;
  config.applications.forEach(
    (configItem) => {
      let counter = counters.applications.find((cntItem) =>
        cntItem.appid === configItem.appid
      );
      if (!counter) {
        counter = configItem.copy();
        counters.applications.push(counter);
      }
      const output = execSync(`ps -aux | grep "${configItem.processregex}"`)
        .toString("utf8").split("\n").filter((l) => l !== "");
      console.log(output);
      const count = output.length;
      console.log(counter, count);
      if (count > 2) {
        counter.usedMinutes += 1 / frequencyPerTimeUnit;
        addToTotal = true;
        counter.isOn = true;
      } else {
        counter.isOn = false;
      }
    },
  );
  console.log("addToTotal", addToTotal);
  if (addToTotal) {
    counters.dayLimit.total += 1 / frequencyPerTimeUnit;
    addToTotal = false;
  }
  return { counters, config, hourMinute };
}
function process_notifications(
  params: { counters: Counters; config: Config; hourMinute: string },
): { counters: Counters; config: Config; hourMinute: string } {
  const { counters, config, hourMinute } = params;
  const messagesToUser: string[] = [];
  const notificationsToUser: string[] = [];
  config.applications.forEach(
    (configItem) => {
      let counter = counters.applications.find((cntItem) =>
        cntItem.appid === configItem.appid
      );
      if (!counter) {
        counter = configItem.copy();
      }
      if (counter.usedMinutes > counter.allowedMinutes) {
        messagesToUser.push(
          `"you have used all the ${configItem.allowedMinutes} allowed minutes for ${configItem.appid}"`,
        );
      } else if (counter.allowedMinutes - counter.usedMinutes == 5) {
        notificationsToUser.push(
          `"time is running out on application ${configItem.appid}, you have 5 minutes left."`,
        );
      } else if (counter.allowedMinutes - counter.usedMinutes == 1) {
        notificationsToUser.push(
          `"time is running out on application ${configItem.appid}, you have 1 minute left."`,
        );
      } else if (counter.allowedMinutes - counter.usedMinutes == 0) {
        notificationsToUser.push(
          `"time is up on application ${configItem.appid}"`,
        );
      }
    },
  );
  const dayLimitConfig = config.getCurrentDayLimitConfig(
    counters.dayLimit.date,
  );
  if (counters.dayLimit.total > counters.dayLimit.totalAllowed) {
    messagesToUser.push(
      `"you have used ${counters.dayLimit.total} out of the ${dayLimitConfig.totalAllowed} allowed minutes this system, shutdown in 59 seconds."`,
    );
  } else if (counters.dayLimit.total - counters.dayLimit.totalAllowed == 5) {
    notificationsToUser.push(
      `"Your allowed time for today is running out, you have 5 minutes left."`,
    );
  } else if (counters.dayLimit.total - counters.dayLimit.totalAllowed == 1) {
    notificationsToUser.push(
      `"Your allowed time for today is running out, you have 1 minute left."`,
    );
  } else if (counters.dayLimit.total - counters.dayLimit.totalAllowed == 0) {
    notificationsToUser.push(
      `"Your allowed time for today is up. Computer $HOSTNAME will shut down shortly"`,
    );
  }
  const [current, min, max] = [
    Number.parseInt(hourMinute, 10),
    Number.parseInt(counters.dayLimit.startHourMinute, 10),
    Number.parseInt(counters.dayLimit.endHourMinute, 10),
  ];
  if (current < min || current > max) {
    messagesToUser.push(
      `"It is ${hourMinute}. You are not allowed to use the computer outside the working hours ${counters.dayLimit.startHourMinute} to ${counters.dayLimit.endHourMinute}"`,
    );
  } else if (max - current == 5) {
    notificationsToUser.push(
      `"It's almost time to shutdown, you have 5 minutes left."`,
    );
  } else if (max - current == 1) {
    notificationsToUser.push(`"Time to shutdown, you have 1 minute left."`);
  }
  messagesToUser.map((message) => {
    const notificationResult = Zenity.info(
      "important message from Mother",
      message,
    );
    // return await spawnProcess('zenity',[`--warning`,`--text`,message])
    return notificationResult;
  });
  notificationsToUser.map((message) => {
    const notificationResult = Zenity.notification(
      "Parental Controls",
      message,
    );
    // return await spawnProcess('zenity',[`--warning`,`--text`,message])
    return notificationResult;
  });
  return { counters, config, hourMinute };
}
