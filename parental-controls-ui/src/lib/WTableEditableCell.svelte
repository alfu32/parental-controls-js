<script lang="ts">
    import type { WTableColumnRenderer } from "./WTable";


    export let key:string
    export let value:any
    export let config:any
</script>

<input type={config.inputType} name={key} id={key} value={value} on:change>