#!/home/alfu64/.deno/bin/deno-run-all
import moment from 'npm:moment';
import { exec, execSync } from 'node:child_process';
import  fs from "node:fs";
import { exit } from 'node:process';

let io={
    sig:true
}
function sleep(ms:number): Promise<any>{
    return new Promise(resolve => setTimeout(resolve, ms));
}
function mkdirp(dir:string){
    try{
        fs.mkdirSync(dir,{recursive: true})
    }catch(err){
        if (err.code !== 'EEXIST') throw err;
    }
}
interface IConfigurationRecord{
    appid:string;
    processregex:string;
    allowedMinutes:number;
    usedMinutes:number;
}
class ConfigurationRecord implements IConfigurationRecord{
    appid="";
    processregex="";
    allowedMinutes=120;
    usedMinutes=0;
    static from(cr:IConfigurationRecord):ConfigurationRecord{
        const r=new ConfigurationRecord()
        r.appid=cr.appid
        r.processregex=cr.processregex
        r.allowedMinutes=cr.allowedMinutes
        r.usedMinutes=cr.usedMinutes
        return r;
    }
    copy():ConfigurationRecord{
        return ConfigurationRecord.from(this)
    }
}
interface IDailyLimitConfig{
    startHourMinute:string;
    endHourMinute:string;
    totalAllowed:number;
    total:number;
}
class DailyLimitConfig implements IDailyLimitConfig{
    static fromJson(json:IDailyLimitConfig):DailyLimitConfig{
        const r = new DailyLimitConfig()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=json.totalAllowed
        return r;
    }
    startHourMinute="1000"
    endHourMinute="1800"
    totalAllowed=120
    total=0
}
declare type DayNumber = number; //  & (0|1|2|3|4|5|6);
interface IDailyLimit{
    startHourMinute:string;
    endHourMinute:string;
    totalAllowed:number;
    total:number;
    date:Date;
    dayNumber:DayNumber;
}
class DailyLimit implements IDailyLimit{
    static fromJson(json:IDailyLimit):DailyLimit{
        const r = new DailyLimit()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=json.totalAllowed
        r.date=new Date(json.date)
        r.dayNumber=r.date.getDay()
        return r;
    }
    static fromConfig(config:Config):DailyLimit{
        const d = new Date()
        const json = config.getCurrentDayLimitConfig(d);
        const r = new DailyLimit()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=json.totalAllowed
        r.date=d
        r.dayNumber=d.getDay()
        return r;
    }
    date:Date=new Date()
    dayNumber:number=new Date().getDay()
    startHourMinute="1000";
    endHourMinute="1800";
    totalAllowed=120
    total=0;
}
interface IConfig{
    dailyLimits:DailyLimitConfig[];
    applications:ConfigurationRecord[];
}
class Config {
    static fromJson(json:IConfig):Config{
        const r = new Config()
        r.dailyLimits=json.dailyLimits;
        r.applications=json.applications.map(ConfigurationRecord.from);
        return r;
    }
    dailyLimits=[
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
        {startHourMinute:"1000",endHourMinute:"1800",totalAllowed:120,total:0},
    ].map(DailyLimitConfig.fromJson)
    applications=[
        {
          "appid": "libreoffice-write",
          "processregex": "soffice.bin",
          "allowedMinutes": 120,
          "usedMinutes": 1
        },
        {
          "appid": "libreoffice-calc",
          "processregex": "libreoffice-calc",
          "allowedMinutes": 120,
          "usedMinutes": 2
        },
        {
          "appid": "vscode",
          "processregex": "code",
          "allowedMinutes": 120,
          "usedMinutes": 3
        }
      ].map(ConfigurationRecord.from);
      getCurrentDayLimitConfig(d:Date):DailyLimitConfig{
        console.log(d);
        const dayLimit = this.dailyLimits[d.getDay()]
        return dayLimit;
      }
}
interface ICounters{
    dayLimit:DailyLimit;
    applications:ConfigurationRecord[]
}
class Counters {
    static fromJson(json:ICounters):Counters{
        const r = new Counters()
        r.dayLimit=DailyLimit.fromJson(json.dayLimit);
        r.applications=json.applications.map(j =>({...j})).map(ConfigurationRecord.from);
        return r;
    }
    static fromConfig(config:Config):Counters{
        const r = new Counters()
        r.dayLimit=DailyLimit.fromConfig(config);
        r.applications=config.applications.map(j =>({...j})).map(ConfigurationRecord.from);
        return r;
    }
    dayLimit:DailyLimit=new DailyLimit()
    applications:ConfigurationRecord[]=[];
}

const timeUnit=1;
async function main(){
    if(!fs.existsSync('config.json')){
        fs.writeFileSync('config.json',JSON.stringify(new Config(),null,"  "))
    }
    while(io.sig){
        const config=Config.fromJson(JSON.parse(fs.readFileSync("config.json").toString("utf-8")))
        const d=Date.now();
        const md=moment(d);
        const dfolder=md.format("YYYY/MM")
        const dprefix=md.format("YYYY/MM/DD")
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
                const count = execSync(`ps -aux | grep "${configItem.processregex}"`).toString("utf8").split("\n").length
                console.log(count)
                if(count>2){
                    counter.usedMinutes+=timeUnit;
                    addToTotal=true;
                }
                if(counter.usedMinutes > configItem.allowedMinutes) {
                    execSync(`zenity --info --text "you have used all the ${configItem.allowedMinutes} allowed minutes for ${configItem.appid}"`)
                }
            }
        )
        if(addToTotal){
            let dayLimitConfig=config.getCurrentDayLimitConfig(counters.dayLimit.date)
            counters.dayLimit.total+=timeUnit;
            if(counters.dayLimit.total > dayLimitConfig.totalAllowed) {
                execSync(`zenity --info --text "you have used all the ${dayLimitConfig.totalAllowed} allowed minutes this system, shutdown in 59 seconds."`)
            }
            addToTotal=false;
        }
        fs.writeFileSync(countfile,JSON.stringify(counters,null,"  "))
        fs.writeFileSync('config.json',JSON.stringify(config,null,"  "))
        await sleep(60000*timeUnit)
    }

}

main()
.then(()=>{})
.catch(err => console.error(err));



