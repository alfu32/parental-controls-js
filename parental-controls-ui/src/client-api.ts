import { Config, Counters } from "../../classes";

export interface Ok<T> { _tag: "Ok"; ok: T, unwrap:()=>T };
export interface Err<E> { _tag: "Err"; err: E, unwrap:()=>T }; 
export type Result<T, E> = Ok<T> | Err<E>;
export const Ok = <T, E>(ok: T): Result<T, E> => ({ _tag: "Ok", ok, unwrap():T { return this.ok } });
export const Err = <T, E>(err: E): Result<T, E> => ({ _tag: "Err", err, unwrap():T { throw this.err; return null as T } });
export const Result = Object.freeze({ Ok, Err });

export type Some<T> = { _tag: "Some"; some: T };
export type None = { _tag: "None" };
export type Option<T> = Some<T> | None;
export const Some = <T>(some: T): Option<T> => ({ _tag: "Some", some });
export const None = <T>(): Option<T> => ({ _tag: "None" });
export const Option = Object.freeze({ Some, None });

export async function getCounters():Promise<Result<Counters,Error>>{
  try{
    const response = await fetch("http://localhost:8080/counters", {method:'GET',redirect:'follow'});
    const json = await response.json()
    return Ok<Counters,Error>(Counters.fromJson(json))
  }catch(err){
    return Err<Counters,Error>(err)
  }
}
export async function getConfig():Promise<Result<Config,Error>>{
  try{
    const response = await fetch("http://localhost:8080/config", {method:'GET',redirect:'follow'});
    const json = await response.json()
    return Ok<Config,Error>(Config.fromJson(json))
  }catch(err){
    return Err<Config,Error>(err)
  }
}