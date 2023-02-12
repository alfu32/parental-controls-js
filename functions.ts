
// deno-lint-ignore ban-types
export function rateLimited(fn:Function,minInterval:number):Function{
    let lastrun=Date.now()
    // deno-lint-ignore no-explicit-any
    let lastresult:any;
    // deno-lint-ignore no-explicit-any
    return (...args:any[])=>{
        const nowrun=Date.now()
        if((nowrun-lastrun)>=minInterval){
            lastrun=nowrun;
            lastresult=fn(...args)
            return lastresult
        } else {
            return lastresult
        }
    }
}