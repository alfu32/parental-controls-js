import type { SvelteComponent } from "svelte";

export interface WundertableColumnRenderer{
    key:string;
    label:string;
    renderer:(cell:any)=>SvelteComponent
}
