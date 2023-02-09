
export declare type HttpMethod = "GET"|"POST"|"PUT"|"DELETE"|"OPTIONS"|"TRACE"|null;
export class HttpRequest{

    url?: URL;
    method: HttpMethod=null;
    event: Deno.RequestEvent={} as Deno.RequestEvent;
    _body=""
    params:{[key:string]:string}={}

    static from(requestEvent:Deno.RequestEvent):HttpRequest{
        const req = new HttpRequest();
        req.url = new URL(requestEvent.request.url);
        req.method = requestEvent.request.method as HttpMethod;
        req.event = requestEvent;
        req.params=req.url.search.substring(1).split("&").reduce(
            (params,kv) =>{
                const [k,v]=kv.split("=")
                params[decodeURIComponent(k)]=decodeURIComponent(v)
                return params;
            },{} as {[key:string]:string}
        )
        return req;
    }
    async text():Promise<string>{
        try{
            this._body= await this.event.request.text()
        }catch(err){
            this._body=""
        }
        return this._body
    }
    async json():Promise<any|undefined>{
        try{
            return JSON.parse((await this.text())||"")
        }catch(err){
            console.error(err)
            console.log(`[${this._body}]`)
            throw new Error(this._body)
        }
    }
    respondWithJson(j:any,status=200): Response{
        return new Response(
            JSON.stringify(j),
            {
                status,
                headers:{
                    "content-type":"application/json"
                }
            }
        )
    }
}
export interface HttpResponse{
    toString():string;
    headers:{[name:string]:string}
}
export declare type RequestHandler = (requestEvent:HttpRequest) => Promise<Response>
export class Router{
    routeHandlers:{[methodPath:string]:RequestHandler}={};
    middleware:RequestHandler[]=[];
    add(method:string,path:string,handler:RequestHandler){
        this.routeHandlers[`${method.toUpperCase()}|${path}`]=handler;
    }
    get(path:string,handler:RequestHandler):this{ this.add("get",path,handler);return this; }
    post(path:string,handler:RequestHandler):this{ this.add("post",path,handler);return this; }
    put(path:string,handler:RequestHandler):this{ this.add("put",path,handler);return this; }
    delete(path:string,handler:RequestHandler):this{ this.add("delete",path,handler);return this; }
    options(path:string,handler:RequestHandler):this{ this.add("options",path,handler);return this; }
    trace(path:string,handler:RequestHandler):this{ this.add("trace",path,handler);return this; }
    async handle(req: HttpRequest) {
        let nomatch=true
        let error:Error|null = null;
        for(const methodPath in this.routeHandlers) {
            console.log(`TESTING ${methodPath}===${req.method}|${req.url?.pathname}`)
            if(req.url && methodPath === `${req.method}|${req.url?.pathname}`) {
                try{
                    const result = await this.routeHandlers[methodPath](req);
                    req.event.respondWith(result)
                }catch(err){
                    error = err
                }
                nomatch=false
            }
        }
        if(error !== null){
            const data={
                message:"SERVER ERROR",
                error:{
                    message:error.message,
                    stack:error.stack?.split("/n"),
                },
                request:req,
                router:this,
            }
            console.log("ERRHANDLER",req,this);
            const result = req.respondWithJson(data,500)
            req.event.respondWith(result)
            return;
        }
        if(nomatch){
            error = new Error("path not found")
            const data={
                message:"NOT FOUND",
                error,
                request:req,
                router:this,
            }
            console.log("ENOMATCH",req,this)
            const result = req.respondWithJson(data,404)
            req.event.respondWith(result)
            return;
        }
    }
}
