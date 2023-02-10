export function add(a: number, b: number): number {
  return a + b;
}
// import moment from 'npm:moment';
import child_process,{ execSync,spawn } from 'node:child_process';
import  fs from "node:fs";
import process from 'node:process';
import { Config, ConfigurationRecord, Counters, mkdirp, sleep } from "./classes.ts";
process.env
let io={
    sig:true
}
import { HttpRequest, Router } from "./webserver.router.ts";

const server = Deno.listen({ port: 8080 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);

const pollTiming=60000
const frequencyPerTimeUnit=60000/pollTiming;

const router:Router = new Router()
router.middleware.push(async function(requestEvent:HttpRequest){
    
})
router.add("GET","/config",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const config = await Config.fromFile("config.json");
    const countfile =getTransientConfig().countfile;
    const counters=Counters.fromFile(countfile,config)
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    config.applications.forEach(
        appConfig => {
            let statusItem = counters.applications.find(ci => ci.appid === appConfig.appid)
            if(!statusItem){
                statusItem = ConfigurationRecord.from(appConfig)
                counters.applications.push(statusItem)
            }
            statusItem.allowedMinutes=appConfig.allowedMinutes
        }
    )
    return requestEvent.respondWithJson(config);
})
router.add("PUT","/config",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    // const data = await requestEvent.event.request.text()
    const json = await requestEvent.json();
    const config = Config.fromJson( json );
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    fs.writeFileSync('config.json', JSON.stringify(config, null, "  "));
    return requestEvent.respondWithJson(config);
})
router.add("GET","/counters",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const config = await Config.fromFile("config.json");
    const countfile =getTransientConfig().countfile;
    const counters=Counters.fromFile(countfile,config)
    if(requestEvent.params?.appid){
        return requestEvent.respondWithJson(counters);
    }
    return requestEvent.respondWithJson(counters);
})
router.add("GET","/counter",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const config = await Config.fromFile("config.json");
    const countfile =getTransientConfig().countfile;
    const counters=Counters.fromFile(countfile,config)
    return requestEvent.respondWithJson(counters.applications.find(ci => ci.appid === requestEvent.params?.appid));
})
router.add("PUT","/counters",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const json = await requestEvent.json();
    const countfile =getTransientConfig().countfile;
    const counters=Counters.fromJson(json)
    fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
    return requestEvent.respondWithJson(counters);
})
router.add("POST","/shutdown",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const text = await requestEvent.text();
    await spawnProcess('zenity',[`--error`,`--text`,"Shutting computer down in 59 seconds. Save your work !"])
    const {out,error} = await spawnProcess('shutdown',[])
    return requestEvent.respondWithJson({out,error});
})
router.add("GET","/shutdown/abort",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const text = await requestEvent.text();
    await spawnProcess('zenity',[`--notification`,`--text`,"Shutting down computer aborted!"])
    const {out,error} = await spawnProcess('shutdown',['-c'])
    return requestEvent.respondWithJson({out,error});
})
router.add("POST","/kill",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const appid = await requestEvent.params.appid;
    await spawnProcess('zenity',[`--error`,`--text`,`The application ${appid} will be shut down in 10 seconds`])
    await sleep(10000)
    const {out,error} = await spawnProcess('pkill',[appid])
    return requestEvent.respondWithJson({out,error,appid});
})
router.add("POST","/message",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const message = await requestEvent.text();
    const {out,error} = await spawnProcess('zenity',[`--warning`,`--text`,message])
    return requestEvent.respondWithJson({out,error});
})
router.add("GET","/message",async function(requestEvent:HttpRequest){
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const message = await requestEvent.params.message;
    if(message !== undefined){
        const {out,error} = await spawnProcess('zenity',[`--info`,`--text`,message])
        return requestEvent.respondWithJson({out,error});
    } else {
        return requestEvent.respondWithJson({message});
    }
})

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
    Promise.all(
        [
            (async () => {
                for await(const conn of server){
                    serveHttp(conn)
                }
            })(),
            (async () => {
                for await(const iResult of mainLoop()){
                    console.log({iResult})
                }
            })()
        ]
    )
  }
async function *mainLoop(){
    if(!fs.existsSync('config.json')){
        fs.writeFileSync('config.json',JSON.stringify(new Config(),null,"  "))
    }
    while(io.sig){
        const iResult = await backend_worker_synchro_iteration();
        await sleep(pollTiming);
        yield iResult;
    }

}

async function serveHttp(conn: Deno.Conn) {
    // This "upgrades" a network connection into an HTTP connection.
    const httpConn:Deno.HttpConn = Deno.serveHttp(conn);
    // Each request sent over the HTTP connection will be yielded as an async
    // iterator from the HTTP connection.
    for await (const requestEvent of httpConn) {
      const req=HttpRequest.from(requestEvent);
      router.handle(req);
    }
  }
  function getTimestamps():{dfolder:string,dprefix:string,hourMinute:string,d:Date}{
    const d = new Date();
    const hourMinute = `${d.getHours().toString(10).padStart(2, '0')}${d.getMinutes().toString(10).padStart(2, '0')}`
    const dfolder = `${d.getFullYear()}/${(d.getMonth() + 1).toString(10).padStart(2, '0')}`; // md.format("YYYY/MM")
    const dprefix = `${dfolder}/${d.getDate().toString(10).padStart(2, '0')}`; //md.format("YYYY/MM/DD")
    return {dfolder,dprefix,hourMinute,d};
  }
  function getTransientConfig():{
        dfolder:string,
        dprefix:string,
        hourMinute:string,
        d:Date,
        logs:string,
        countersDir:string,
        logfile:string,
        countfile:string,
    } {
    const {dfolder,dprefix,hourMinute,d}=getTimestamps();
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
async function backend_worker_synchro_iteration():Promise<Counters> {
  const config = await Config.fromFile("config.json");
  // const md=moment(d.getTime());
  const {
        dfolder,
        dprefix,
        hourMinute,
        d,
        logs,
        countersDir,
        logfile,
        countfile
  }=getTransientConfig();
  let counters = Counters.fromFile(countfile,config);
  let addToTotal: boolean = false;
  const messagesToUser:string[]=[];
  config.applications.forEach(
    configItem => {
      let counter = counters.applications.find(cntItem => cntItem.appid === configItem.appid);
      if(!counter) {
        counter = configItem.copy();
        counters.applications.push(counter);
      }
      const output = execSync(`ps -aux | grep "${configItem.processregex}"`).toString("utf8").split("\n").filter(l => l !== "");
      console.log(output);
      const count = output.length;
      console.log(counter, count);
      if(count > 2) {
        counter.usedMinutes += 1 / frequencyPerTimeUnit;
        addToTotal = true;
        counter.isOn = true;
      }else {
        counter.isOn = false;
      }
      if(counter.usedMinutes > counter.allowedMinutes) {
        messagesToUser.push(`"you have used all the ${configItem.allowedMinutes} allowed minutes for ${configItem.appid}"`);
      }
    }
  );
  const dayLimitConfig = config.getCurrentDayLimitConfig(counters.dayLimit.date);
  console.log("addToTotal",addToTotal)
  if(addToTotal) {
    counters.dayLimit.total += 1 / frequencyPerTimeUnit;
    if(counters.dayLimit.total > counters.dayLimit.totalAllowed) {
        messagesToUser.push(`"you have used ${counters.dayLimit.total} out of the ${dayLimitConfig.totalAllowed} allowed minutes this system, shutdown in 59 seconds."`);
    }
    addToTotal = false;
  }
  const [current,min,max]=[Number.parseInt( hourMinute,10),Number.parseInt( counters.dayLimit.startHourMinute,10),Number.parseInt( counters.dayLimit.endHourMinute,10)]
  if(current<min || current > max ) {
    messagesToUser.push(`"It is ${hourMinute}. You are not allowed to use the computer outside the working hours ${counters.dayLimit.startHourMinute} to ${counters.dayLimit.endHourMinute}"`);
  }
  messagesToUser.forEach( async message => await spawnProcess('zenity',[`--warning`,`--text`,message]))
  console.log(counters)
  fs.writeFileSync(countfile, JSON.stringify(counters, null, "  "));
  fs.writeFileSync('config.json', JSON.stringify(config, null, "  "));
  return counters
}

function spawnProcess(
    command:string,
    args:string[],
    options:{[key:string]:any}={cwd: undefined,env: process.env}
):Promise<{out:string,error:string}> {
    return new Promise((resolve,reject)=>{
    const cmd=spawn(command,args,options);
    let error="";
    let out="";
    cmd.stdout.on('data', (data) => {
        out+=data
      });
      
    cmd.stderr.on('data', (data) => {
        error+=data
    });
    cmd.on('close', (code) => {
        if (code !== 0) {
            console.log(`ps process exited with code ${code}`);
            reject({out,error})
        }else{
            resolve({out,error})
        }
      });
    })
}