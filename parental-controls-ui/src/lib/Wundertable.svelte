<script lang="ts">
    import { SvelteComponent } from "svelte";
import type { WundertableColumnRenderer } from "./Wundertable";


    export let data:object[]
    export let config:WundertableColumnRenderer[]
</script>

{#if config}
<table>
    <thead>
        <tr>
            {#each config as header}
                <th>{header.label}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#if data }
            {#each data as record}
                <tr>
                    {#each config as header}
                        <th>{header.renderer(record[header.key])}</th>
                    {/each}
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
{:else}
<p class="error">no configuration is specified</p>
{/if}