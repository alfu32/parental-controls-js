#!/usr/bin/env node
const { exec, execSync } = require('child_process');
const fs=require('fs');
const moment=require('moment');

let io={
    sig:true
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function mkdirp(dir){
    try{
        fs.mkdirSync(dir,{recursive: true})
    }catch(err){
        if (err.code !== 'EEXIST') throw err;
    }
}
class ConfigurationRecord{
    appid="";
    processregex="";
    allowedMinutes=120;
    usedMinutes=0;
    static from(cr){
        const r=new ConfigurationRecord()
        r.appid=cr.appid
        r.processregex=cr.processregex
        r.allowedMinutes=cr.allowedMinutes
        r.usedMinutes=cr.usedMinutes
        return r;
    }
    copy(){
        return ConfigurationRecord.from(this)
    }
}
class DailyLimitConfig{
    static fromJson(json){
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
class DailyLimit{
    static fromJson(json){
        const r = new DailyLimit()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=json.totalAllowed
        r.date=new Date(json.date)
        r.dayNumber=r.date.getDay()
        return r;
    }
    static fromConfig(config=new Config()){
        const d = new Date()
        const json = config.dailyLimits[d.getDay()]
        const r = new DailyLimit()
        r.startHourMinute=json.startHourMinute
        r.endHourMinute=json.endHourMinute
        r.totalAllowed=json.totalAllowed
        r.date=d
        r.dayNumber=d.getDay()
        return r;
    }
    date=new Date()
    dayNumber=new Date().getDay()
    startHourMinute="1000"
    endHourMinute="1800"
    totalAllowed=120
    total=0
}
class Config {
    static fromJson(json){
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
}
class Counters {
    static fromJson(json){
        const r = new Counters()
        r.dayLimit=json.dayLimit;
        r.applications=json.applications;
        return r;
    }
    static fromConfig(config){
        const r = new Counters()
        r.dayLimit=config.dailyLimits[new Date().getDay()];
        r.applications=config.applications.map(ConfigurationRecord.from);
        return r;
    }
    dayLimit=new DailyLimit()
    applications=[];
}

const timeUnit=1;
async function main(){
    if(!fs.existsSync('config.json')){
        fs.writeFileSync('config.json',JSON.stringify(new Config(),null,"  "))
    }
    while(io.sig){
        const config=Config.fromJson(JSON.parse(fs.readFileSync("config.json")))
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
        let counters
        if(fs.existsSync(countfile)){
            counters=Counters.fromJson(JSON.parse(fs.readFileSync(countfile)))
        }else{
            counters=Counters.fromConfig(config)
        }
        let addToTotal=false
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
        /// if(addToTotal){
        ///     let dayLimitConfig=config.dailyLimits[counters.dayLimit.dayNumber]
        ///     counters.dayLimit.total+=timeUnit;
        ///     if(counters.dayLimit.total > dayLimitConfig.allowedMinutes) {
        ///         execSync(`zenity --info --text "you have used all the ${configItem.allowedMinutes} allowed minutes this system, shutdown in 59 seconds."`)
        ///     }
        ///     addToTotal=false;
        /// }
        fs.writeFileSync(countfile,JSON.stringify(counters,null,"  "))
        fs.writeFileSync('config.json',JSON.stringify(config,null,"  "))
        await sleep(60000*timeUnit)
    }

}

main()
.then(()=>{})
.catch(err => console.error(err));




class Table{
    static ofCsv(text){
        const all = text.split("\n")
        const header = all[0].split(",")
        const data = all.slice(1).map(line => {
            const values = line.split(",")
            const record={}
            header.forEach(
                (key,ord) => {
                    record[key]=values[ord]||null
                }
            )
            return record;
        })
        const t=new Table(data);
        return t;
    }
    _table=[]
    _type={}
    constructor(jsonTable){
        const t=[]
        let proto={}
        jsonTable.forEach(record => {
            proto={...proto,...record}
        });
        Object.keys(proto).forEach(key => proto[key]=null)
        this._table = jsonTable.map(record => {
            return {...proto,...record}
        });
    }
    find(p){
        return this._table.find(p)
    }
}