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
    usedMinutes=120;
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
console.log(new ConfigurationRecord())
const timeUnit=1;
async function main(){
    if(!fs.existsSync('config.json')){
        fs.writeFileSync('config.json',JSON.stringify([new ConfigurationRecord()],null,"  "))
    }
    while(io.sig){
        const config=new Table(JSON.parse(fs.readFileSync("config.json")).applications)
        config._table=config._table.map(j => ConfigurationRecord.from(j))
        const d=Date.now();
        const md=moment(d);
        const dfolder=md.format("YYYY/MM")
        const dprefix=md.format("YYYY/MM/DD")
        const logs=`logs/${dfolder}`
        const counters=`counters/${dfolder}`
        mkdirp(logs)
        mkdirp(counters)
        const logfile=`logs/${dprefix}.log`
        const countfile=`counters/${dprefix}.json`
        if(!fs.existsSync(countfile)){
            fs.writeFileSync(countfile,JSON.stringify(config._table,null,"  "))
        }
        counterTable = new Table(JSON.parse(fs.readFileSync(countfile)))
        counterTable._table=counterTable._table.map(j => ConfigurationRecord.from(j))
        let addToTotal=false
        config._table.forEach(
            configItem => {
                let counter=counterTable.find(cntItem => cntItem.appid == configItem.appid)
                if(!counter){
                    counter=configItem.copy()
                    counterTable._table.push(counter);
                }

                if(configItem === "total") {
                    return;
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
            let total=counterTable.find(cntItem => cntItem.appid == "total")
            let totalConfig=config.find(cntItem => cntItem.appid == "total")
            total.usedMinutes+=timeUnit;
            if(total.usedMinutes > totalConfig.allowedMinutes) {
                execSync(`zenity --info --text "you have used all the ${configItem.allowedMinutes} allowed minutes this system, shutdown in 59 seconds."`)
            }
            addToTotal=false;
        }
        fs.writeFileSync(countfile,JSON.stringify(counterTable._table,null,"  "))
        fs.writeFileSync('config.json',JSON.stringify(config._table,null,"  "))
        await sleep(60000*timeUnit)
    }

}

main()
.then(()=>{})
.catch(err => console.error(err));