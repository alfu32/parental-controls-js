import type { SvelteComponentTyped } from "svelte";


export class WTableColumnRenderer{
    key:string;
    label:string;
    initialValue:any=null;
    renderer:any;
    rendererConfig:any;
}
export declare type CellChange={key:string,value:any}