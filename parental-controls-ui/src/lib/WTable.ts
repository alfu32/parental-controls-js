import type { SvelteComponentTyped } from "svelte";


export interface WTableColumnRenderer{
    key:string;
    label:string;
    renderer:any;
    rendererConfig:any;
}
