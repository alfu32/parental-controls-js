
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
    isOn:boolean;
    appid:string;
    processregex:string;
    allowedMinutes:number;
    usedMinutes:number;
}
export class ConfigurationRecord implements IConfigurationRecord{

    static ctor():string {
        return `{
            isOn:boolean;
            appid:string;
            processregex:string;
            allowedMinutes:number;
            usedMinutes:number;
        }`
    }
    isOn=false;
    appid="";
    processregex="";
    allowedMinutes=120;
    usedMinutes=0;
    static fromJson(cr:IConfigurationRecord):ConfigurationRecord{
        const r=new ConfigurationRecord()
        r.isOn=cr.isOn
        r.appid=cr.appid
        r.processregex=cr.processregex
        r.allowedMinutes=cr.allowedMinutes
        r.usedMinutes=cr.usedMinutes
        return r;
    }
    static from(cr:IConfigurationRecord):ConfigurationRecord{
        return ConfigurationRecord.fromJson(cr);
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

    static ctor():string {
        return `{
            startHourMinute:string;
            endHourMinute:string;
            totalAllowed:number;
            total:number;
        }`
    }
    static fromJson(json:IDailyLimitConfig):DailyLimitConfig{
        const r = new DailyLimitConfig()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=parseInt(json.totalAllowed.toString())
        return r;
    }
    static from(r:IDailyLimitConfig):DailyLimitConfig{
        return DailyLimitConfig.fromJson(r);
    }
    copy():DailyLimitConfig{
        const r = new DailyLimitConfig()
        return DailyLimitConfig.from(this);
    }
    startHourMinute="1000"
    endHourMinute="1800"
    totalAllowed=120
    total=0
}
export declare type DayNumber = number; //  & (0|1|2|3|4|5|6);
export interface IDailyLimit{
    date:Date;
    dayNumber:DayNumber;
    startHourMinute:string;
    endHourMinute:string;
    totalAllowed:number;
    total:number;
}
export class DailyLimit implements IDailyLimit{

    static ctor():string {
        return `{
            date:Date;
            dayNumber:DayNumber;
            startHourMinute:string;
            endHourMinute:string;
            totalAllowed:number;
            total:number;
        }`
    }
    static fromJson(json:IDailyLimit):DailyLimit{
        const r = new DailyLimit()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=json.totalAllowed
        r.total=json.total
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
    static ctor():string{
        return `{
            dailyLimits: DailyLimitConfig[],
            applications: ConfigurationRecord[],
        }`
    }
    static async fromFile(filename: string):Promise<Config> {
        const content = await fs.promises.readFile(filename)
        return Config.fromJson(JSON.parse(content.toString("utf-8")));
    }
    static fromJson(json:IConfig):Config{
        const r = new Config()
        r.dailyLimits=json.dailyLimits.map( DailyLimitConfig.fromJson );
        r.applications=json.applications.map(ConfigurationRecord.from);
        return r;
    }
    copy() {
        const r = new Config()
        r.dailyLimits=this.dailyLimits.map( DailyLimitConfig.fromJson );
        r.applications=this.applications.map(ConfigurationRecord.from);
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
    applications:ConfigurationRecord[]=[];
      getCurrentDayLimitConfig(d:Date):DailyLimitConfig{
        // console.log("dailyLimitStatus",d);
        return this.dailyLimits[d.getDay()];
      }
}
export interface ICounters{
    dayLimit:DailyLimit;
    applications:ConfigurationRecord[]
}
export class Counters {
    static ctor():string {
        return `{
            dayLimit:DailyLimit;
            applications:ConfigurationRecord[];
        }`
    }
    copy() {
        return Counters.fromJson(JSON.parse(JSON.stringify(this)));
    }
    static fromFile(countfile:string,config:Config):Counters{
        if(fs.existsSync(countfile)) {
            return Counters.fromJson(JSON.parse(fs.readFileSync(countfile).toString("utf-8")));
        } else {
            return Counters.fromConfig(config);
        }
    }
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

export interface IProcess{
    USER:string;
    PID:string;
    CPU:string;
    MEM:string;
    VSZ:string;
    RSS:string;
    TTY:string;
    STAT:string;
    START:string;
    TIME:string;
    COMMAND:string;
}
export class Process implements IProcess {
    static ctor():string {
        return `{
            USER:string;
            PID:string;
            CPU:string;
            MEM:string;
            VSZ:string;
            RSS:string;
            TTY:string;
            STAT:string;
            START:string;
            TIME:string;
            COMMAND:string;
        }`
    }
    USER="";
    PID="";
    CPU="";
    MEM="";
    VSZ="";
    RSS="";
    TTY="";
    STAT="";
    START="";
    TIME="";
    COMMAND="";
    static fromFixedLengthText(text:string):Process{
        const p=new Process();
        const cols=text.substr(0,65).split(/\s+/gi)
        p.USER = cols[0]?.trim();
        p.PID = cols[1]?.trim();
        p.CPU = cols[2]?.trim();
        p.MEM = cols[3]?.trim();
        p.VSZ = cols[4]?.trim();
        p.RSS = cols[5]?.trim();
        p.TTY = cols[6]?.trim();
        p.STAT = cols[7]?.trim();
        p.START = cols[8]?.trim();
        p.TIME = cols[9]?.trim();
        p.COMMAND = text.substring(66);
        return p
    }
    static fromJson(json:IProcess):Process{
        const p=new Process();
        p.USER = json.USER;
        p.PID = json.PID;
        p.CPU = json.CPU;
        p.MEM = json.MEM;
        p.VSZ = json.VSZ;
        p.RSS = json.RSS;
        p.TTY = json.TTY;
        p.STAT = json.STAT;
        p.START = json.START;
        p.TIME = json.TIME;
        p.COMMAND = json.COMMAND;
        return p
    }
}

export class WindowData{
    public constructor(
        public windowId:string,
        public desktop:string,
        public pid:string,
        public machineName:string,
        public title:string,
    ){
        this.windowId = windowId;
        this.desktop = desktop;
        this.pid = pid;
        this.machineName = machineName;
        this.title = title;
    }
    static fromJson(json: any):WindowData{
        return new WindowData (
            json.windowId,
            json.desktop,
            json.pid,
            json.machineName,
            json.title,
        )
    }
    static decodeWmctrlOutput(output: string): WindowData[] {
        const data:WindowData[] = [];
        const lines = output.trim().split('\n');
      
        for (const line of lines) {
          const windowId = line.substring(0, 10)?.trim();
          const desktop = line.substring(11, 12)?.trim();
          const pid = line.substring(13, 18)?.trim();
          const machineName = (line.substring(19).match(/[0-9a-zA-Z_\-]+/gi)??["NOT-DETECTED"])[0]?.trim();
          const title = line.substring(19).replace(new RegExp(`^${machineName}\s+`),"")?.trim()
      
          data.push(new WindowData(windowId, desktop, pid, machineName, title));
        }
      
        return data;
      }
      
}