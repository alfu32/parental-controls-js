export function add(a: number, b: number): number {
  return a + b;
}
// import moment from 'npm:moment';
import { execSync } from 'node:child_process';
import  fs from "node:fs";
import { Config, Counters, mkdirp, sleep } from "./classes.ts";

let io={
    sig:true
}
const pollTiming=3000
const frequencyPerTimeUnit=60000/pollTiming;
async function main(){
    if(!fs.existsSync('config.json')){
        fs.writeFileSync('config.json',JSON.stringify(new Config(),null,"  "))
    }
    while(io.sig){
        const config=Config.fromJson(JSON.parse(fs.readFileSync("config.json").toString("utf-8")))
        const d=new Date();
        // const md=moment(d.getTime());
        const dfolder=`${d.getFullYear()}/${(d.getMonth()+1).toString(10).padStart(2,'0')}`; // md.format("YYYY/MM")
        const dprefix=`${dfolder}/${d.getDate().toString(10).padStart(2,'0')}`;//md.format("YYYY/MM/DD")
        const logs=`logs/${dfolder}`
        const countersDir=`counters/${dfolder}`
        mkdirp(logs)
        mkdirp(countersDir)
        const logfile=`logs/${dprefix}.log`
        const countfile=`counters/${dprefix}.json`
        let counters:Counters;
        if(fs.existsSync(countfile)){
            counters=Counters.fromJson(JSON.parse(fs.readFileSync(countfile).toString("utf-8")))
        }else{
            counters=Counters.fromConfig(config)
        }
        let addToTotal:boolean=false;
        console.log(config);
        console.log(counters);
        config.applications.forEach(
            configItem => {
                let counter=counters.applications.find(cntItem => cntItem.appid === configItem.appid)
                if(!counter){
                    counter=configItem.copy()
                    counters.applications.push(counter);
                }
                const output = execSync(`ps -aux | grep "${configItem.processregex}"`).toString("utf8").split("\n").filter(l => l!=="")
                console.log(output)
                const count = output.length
                console.log(counter,count)
                if(count>2){
                    counter.usedMinutes+=1/frequencyPerTimeUnit;
                    addToTotal=true;
                }
                if(counter.usedMinutes > configItem.allowedMinutes) {
                    execSync(`zenity --info --text "you have used all the ${configItem.allowedMinutes} allowed minutes for ${configItem.appid}"`)
                }
            }
        )
        if(addToTotal){
            let dayLimitConfig=config.getCurrentDayLimitConfig(counters.dayLimit.date)
            counters.dayLimit.total+=1/frequencyPerTimeUnit;
            if(counters.dayLimit.total > dayLimitConfig.totalAllowed) {
                execSync(`zenity --info --text "you have used all the ${dayLimitConfig.totalAllowed} allowed minutes this system, shutdown in 59 seconds."`)
            }
            addToTotal=false;
        }
        fs.writeFileSync(countfile,JSON.stringify(counters,null,"  "))
        fs.writeFileSync('config.json',JSON.stringify(config,null,"  "))
        await sleep(pollTiming)
    }

}
// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  await main()
}
