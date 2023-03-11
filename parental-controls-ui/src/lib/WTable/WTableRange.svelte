<script lang="ts">
    import { TextInput } from "@svelteuidev/core";
    import type { WTableColumnRenderer } from "./WTable";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();


    export let key:string
    export let value:any
    export let config:any

    function changed(){
        dispatch("change", {key,value});
    }
</script>
<input type="range" {...config} bind:value={value} on:change={changed}/>{(config.transform||(x=>x))(value)}