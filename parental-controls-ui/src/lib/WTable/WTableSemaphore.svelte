<script lang="ts">
    import type { WTableColumnRenderer } from "./WTable";


    export let key:string
    export let value:boolean
    export let config:any
</script>

{#if value}
    <div class="circle green {value}"></div>
{:else}
    <div class="circle red {value}"></div>
{/if}
<style>
    div.circle{
        min-width: 8px;
        max-width: 8px;
        width: 8px;
        min-height: 8px;
        max-height: 8px;
        height: 8px;
        border-radius: 8px;
    }
    div.circle.red{
        background-color: rgb(180, 0, 0);
        border:3px solid rgb(255, 50, 50);
    }
    div.circle.green{
        background-color: rgb(0, 78, 0);
        border:3px solid rgb(33, 117, 33);
    }
</style>