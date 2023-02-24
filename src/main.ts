export function add(a: number, b: number): number {
  return a + b;
}
import { execSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import {
  Config,
  Counters,
  mkdirp,
  sleep,
} from "./classes.ts";
import { NotifySend,INotifier } from "./desktop-notifications.ts";
const NOTIFIER:INotifier = NotifySend;
import { rateLimited } from "./functions.ts";
import { getTransientConfig } from "./getTransientConfig.ts";
import { router } from "./router.config.ts";
import { HttpRequest } from "./webserver.router.ts";

let io = {
  sig: true,
};

const port=8080
const server = Deno.listen({ port });
console.log(`HTTP webserver running.  Access it at:  http://localhost:${port}/`);

const pollTiming = 5000;
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
          // console.log({ iResult });
        }
      })(),
    ],
  );
}
async function* mainLoop() {
  if (!fs.existsSync("config.json")) {
    fs.writeFileSync("config.json", JSON.stringify(new Config(), null, "  "));
  }
  const rl_process_notifications = rateLimited(process_notifications,60000)
  // console.log(rl_process_notifications.toString())
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
    const i2Result = rl_process_notifications(iResult);
    // process_notifications(iResult);
    processEvents(i2Result)

    fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
    fs.writeFileSync("config.json", JSON.stringify(config, null, "  "));

    await sleep(pollTiming);
    yield iResult;
  }
}
function processEvents(params: { counters: Counters; config: Config; hourMinute: string }){
  console.log("3.========== processing events =====================================")
  console.log("3.====== done ======================================================================")
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
      const processes = execSync(`ps -aux | grep "${configItem.processregex}"`)
        .toString("utf8").split("\n").filter((l) => l !== "");
      const windows = execSync(`wmctrl-all -lp | grep "${configItem.processregex}"`)
          .toString("utf8").split("\n").filter((l) => l !== "");
      // console.log(processes);
      // const count = processes.length + windows.length;
      // console.log(counter, count);
      if (processes.length > 2 || windows.length > 0) {
        counter.usedMinutes += 1 / frequencyPerTimeUnit;
        addToTotal = true;
        counter.isOn = true;
      } else {
        counter.isOn = false;
      }
    },
  );
  //console.log("addToTotal", addToTotal);
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
  //console.log("2.====== processing notifications ==================================================")
  config.applications.forEach(
    (configItem) => {
      let counter = counters.applications.find((cntItem) =>
        cntItem.appid === configItem.appid
      );
      if (!counter) {
        counter = configItem.copy();
        //console.log("process_notifications.!counter",counter)
      }
      const diff=counter.usedMinutes - counter.allowedMinutes
      switch(true){
        case diff==-10:
        case diff==-5:
          notificationsToUser.push(
            `time is running out on application ${configItem.appid}, you have ${diff} minutes left.`,
          );
          break;
        case diff==-1:
          notificationsToUser.push(
            `time is running out on application ${configItem.appid}, you have 1 minute left.`,
          );
          break;
        case diff==0:
          notificationsToUser.push(
            `time is up on application ${configItem.appid}`,
          );
          break;
        case diff==1:
        case diff>0 && diff%5==0:
          messagesToUser.push(
          `you have used all the ${configItem.allowedMinutes} allowed minutes for ${configItem.appid}`,
          );
          break;
      }
    },
  );
  const dayLimitConfig = config.getCurrentDayLimitConfig(
    counters.dayLimit.date,
  );
  const diffDay=counters.dayLimit.totalAllowed-counters.dayLimit.total
  switch(true){
    case diffDay==-10:
    case diffDay==-5:
      notificationsToUser.push(
        `Your allowed time for today is running out, you have ${diffDay} minutes left.`,
      );
      break;
    case diffDay==-1:
      notificationsToUser.push(
        `Your allowed time for today is running out, you have 1 minute left.`,
      );
      break;
    case diffDay==0:
      notificationsToUser.push(
        `Your allowed time for today is up. Computer $HOSTNAME will shut down shortly`,
      );
      break;
    case diffDay==1:
    case diffDay>0 && diffDay%5==0:
      messagesToUser.push(
        `you have used ${counters.dayLimit.total} out of the ${dayLimitConfig.totalAllowed} allowed minutes this system, shutdown in 59 seconds.`,
      );
      break;
  }
  const [current, min, max] = [
    Number.parseInt(hourMinute, 10),
    Number.parseInt(counters.dayLimit.startHourMinute, 10),
    Number.parseInt(counters.dayLimit.endHourMinute, 10),
  ];
  const diffToCurfew = max - current
  // console.log("process_notifications:: [current, min, max]",[current, min, max])
  switch(true){
    case (current < min && ((min-current)%5)==0 || current > max && ((current-max)%5)==0 ):
      messagesToUser.push(
        `It is ${hourMinute}. You are not allowed to use the computer outside the working hours ${counters.dayLimit.startHourMinute} to ${counters.dayLimit.endHourMinute}`,
      );
      console.log("something");
      break;
      case (diffToCurfew == 10):
      case (diffToCurfew == 5):
        notificationsToUser.push(
          `It's almost time to shutdown, you have ${diffToCurfew} minutes left.`,
        );
      break;
      case (diffToCurfew == 1):
        notificationsToUser.push(`Time to shutdown, you have 1 minute left.`);
      break;
      case (diffToCurfew == 0):
        notificationsToUser.push(`Time to shutdown, you have 0 minutes left.`);
      break;
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
  console.log("2.====== done ======================================================================")
  return { counters, config, hourMinute };
}
