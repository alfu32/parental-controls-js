
import { Reflect as RM } from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";
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
    copy(): HttpRequest {
        const r= HttpRequest.from(this.event);
        return r;
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
        return this.respondWith(JSON.stringify(j),"application/json")
    }
    respondWithText(text:string,status=200): Response{
        return this.respondWith(text,"text/plain")
    }
    respondWith(body:string,contentType:string,status=200): Response{
        const origin = this.event.request.headers.get("Origin")
            ||this.event.request.headers.get("Referer")
            ||this.event.request.headers.get("origin")
            ||this.event.request.headers.get("referer")
            ||"*"
        return new Response(
            body,
            {
                status,
                headers:{
                    "content-type":contentType,
                    "Access-Control-Allow-Origin":origin,
                    "Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,TRACE,PATCH,OPTIONS",
                    "Access-Control-Allow-Headers":"Content-Type"
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
export class Handler<T,R>{
    constructor(
        public method:string,
        public path:string,
        public input:T,
        public output:R,
        public handler:RequestHandler
    ){}
}
export declare type MiddlewareHandler = (requestEvent:HttpRequest) => HttpRequest

export class Router{
    routeHandlers:{[methodPath:string]:RequestHandler}={};
    middleware:MiddlewareHandler[]=[];
    add(method:string,path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string){
        RM.defineMetadata("router:handlers", method, handler, "method");
        RM.defineMetadata("router:handlers", path, handler, "path");
        RM.defineMetadata("router:handlers", bodyTypeName, handler, "bodyType");
        RM.defineMetadata("router:handlers", returnTypeName, handler, "returnType");
        this.routeHandlers[`${method.toUpperCase()}|${path}`]=handler;
    }
    get(path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string):this{ this.add("get",path,handler,bodyTypeName,returnTypeName);return this; }
    post(path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string):this{ this.add("post",path,handler,bodyTypeName,returnTypeName);return this; }
    put(path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string):this{ this.add("put",path,handler,bodyTypeName,returnTypeName);return this; }
    delete(path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string):this{ this.add("delete",path,handler,bodyTypeName,returnTypeName);return this; }
    options(path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string):this{ this.add("options",path,handler,bodyTypeName,returnTypeName);return this; }
    trace(path:string,handler:RequestHandler,bodyTypeName:string,returnTypeName:string):this{ this.add("trace",path,handler,bodyTypeName,returnTypeName);return this; }
    async handle(req: HttpRequest) {
        let nomatch=true
        let error:Error|null = null;
        for(const methodPath in this.routeHandlers) {
            //console.log(`TESTING ${methodPath}===${req.method}|${req.url?.pathname}`)
            if(req.url && methodPath === `${req.method}|${req.url?.pathname}`) {
                try{
                    // const newreq = this.passtroughMiddleware(req);
                    const result = await this.routeHandlers[methodPath](req);
                    req.event.respondWith(result)
                }catch(err){
                    console.error("ERROR ROUTE",methodPath,err?.message,err?.stack?.split("\n"))
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
            console.log("ERRHANDLER",{message:error.message,stacktrace:error?.stack?.split("\n")},req,this);
            const result = req.respondWithJson(data,500)
            req.event.respondWith(result)
            error=null;
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
    passtroughMiddleware(req: HttpRequest):HttpRequest {
        return this.middleware.reduce(
            (prev:HttpRequest,mwfn) => {
                return mwfn(prev)
            },req
        )
    }
}
