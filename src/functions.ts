
// deno-lint-ignore ban-types
export function rateLimited(fn:Function,minInterval:number):Function{
    let lastrun=Date.now()
    // deno-lint-ignore no-explicit-any
    let lastresult:any;
    // deno-lint-ignore no-explicit-any
    let firstRun=true
    return (...args:any[])=>{
        const nowrun=Date.now()
        if((nowrun-lastrun)>=minInterval || firstRun){
            //console.log("rateLimited-YES",nowrun,lastrun,nowrun-lastrun,minInterval)
            lastrun=nowrun;
            lastresult=fn(...args)
            firstRun=false;
            return lastresult
        } else {
            console.log("rateLimited-NO",nowrun,lastrun,nowrun-lastrun,minInterval)
            return lastresult
        }
    }
}