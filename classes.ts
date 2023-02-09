
import  fs from "node:fs";

export function sleep(ms:number): Promise<any>{
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function mkdirp(dir:string){
    try{
        fs.mkdirSync(dir,{recursive: true})
    }catch(err){
        if (err.code !== 'EEXIST') throw err;
    }
}
export interface IConfigurationRecord{
    appid:string;
    processregex:string;
    allowedMinutes:number;
    usedMinutes:number;
}
export class ConfigurationRecord implements IConfigurationRecord{
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
export interface IDailyLimitConfig{
    startHourMinute:string;
    endHourMinute:string;
    totalAllowed:number;
    total:number;
}
export class DailyLimitConfig implements IDailyLimitConfig{
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
export declare type DayNumber = number; //  & (0|1|2|3|4|5|6);
export interface IDailyLimit{
    startHourMinute:string;
    endHourMinute:string;
    totalAllowed:number;
    total:number;
    date:Date;
    dayNumber:DayNumber;
}
export class DailyLimit implements IDailyLimit{
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
export interface IConfig{
    dailyLimits:DailyLimitConfig[];
    applications:ConfigurationRecord[];
}
export class Config {
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
export interface ICounters{
    dayLimit:DailyLimit;
    applications:ConfigurationRecord[]
}
export class Counters {
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