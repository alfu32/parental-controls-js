
export declare type EventType="apptimeended"|"apptimewillend"|"computertimeended"|"computertimewillend"
export declare type Event<T>={
  eventType:EventType,detail:T
}
export declare type EventCallback<T>=(event:Event<T>)=>void;
export class EventEmmitter<T>{
    listeners:{[key:string]:EventCallback<T>[]}={}
    addEventListener(eventType:EventType,callback:EventCallback<T>):this{
        this.listeners[eventType]=this.listeners[eventType]||[];
        this.listeners[eventType].push(callback)
        return this;
    }
    dispatch(eventType:EventType,detail:T):this{
        (this.listeners[eventType]||[])
            .forEach((cbk:EventCallback<T>) => {
                try{
                    cbk({eventType,detail})
                }catch(err){
                    console.error(eventType,detail,cbk,err);
                }
            })
        return this;
    }
    buffer(eventType:EventType,detail:T):this{
        (this.listeners[eventType]||[])
            .forEach((cbk:EventCallback<T>) => {
                try{
                    cbk({eventType,detail})
                }catch(err){
                    console.error(eventType,detail,cbk,err);
                }
            })
        return this;
    }
    removeEventListener(eventType:EventType,callback:EventCallback<T>):this{
        this.listeners[eventType]=(this.listeners[eventType]||[]).filter(cbk => cbk!==callback);
        return this;
    }
}