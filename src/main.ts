export function add(a: number, b: number): number {
  return a + b;
}
import child_process, { execSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import {
  Config,
  Counters,
  mkdirp,
  sleep,
} from "./classes.ts";
import { Zenity,DenoNotifier,NotifySend,INotifier } from "./desktop-notifications.ts";
const NOTIFIER:INotifier = NotifySend;
import { rateLimited } from "./functions.ts";
import { getTransientConfig } from "./getTransientConfig.ts";
import { router } from "./router.config.ts";
import { HttpRequest } from "./webserver.router.ts";
process.env;

let io = {
  sig: true,
};

const port=8080
const server = Deno.listen({ port });
console.log(`HTTP webserver running.  Access it at:  http://localhost:${port}/`);

const pollTiming = 15000;
const frequencyPerTimeUnit = 60000 / pollTiming;

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
function backend_worker_synchro_iteration( params: { counters: Counters; config: Config; hourMinute: string }, ):{ counters: Counters; config: Config; hourMinute: string }
{
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
    const notificationResult = NOTIFIER.info(
      "From Parental Controls",
      message,
    );
    return notificationResult;
  });
  notificationsToUser.map((message) => {
    const notificationResult = NOTIFIER.notification(
      "Parental Controls",
      message,
    );
    return notificationResult;
  });
  return { counters, config, hourMinute };
}
