<script lang="ts">
import type { WTableColumnRenderer } from "./WTable";


    export let data:object[]
    export let config:WTableColumnRenderer[]
</script>

{#if config}
<div class=wrapper>
<table>
    <thead>
        <tr>
            {#each config as header}
                <th>{header.label}</th>
            {/each}
            <th><slot name="table-operations" record={data}>Operations</slot></th>
        </tr>
    </thead>
    <tbody>
        {#if data }
            {#each data as record}
                <tr>
                    {#each config as {key,renderer,rendererConfig}}
                        <td>
                            <svelte:component
                                this={renderer}
                                key={key}
                                value={record[key]}
                                config={rendererConfig}
                            />
                        </td>
                    {/each}
                    <td>
                        <slot name="row-operations" record={record}></slot>
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
</div>
{:else}
<p class="error">no configuration is specified</p>
{/if}

<style>
    .wrapper{
        overflow: overlay;
        max-height: 600px;
    }
    table{
        border-collapse: collapse;
    }
    tbody{
        border-collapse: collapse;
    }
    tr{
        border-collapse: collapse;
    }
    th {
        background: white;
        position: sticky;
        top: 0; /* Don't forget this, required for the stickiness */
        box-shadow: 0px 0px 12px #000;
        padding:6px 4px 6px 6px;
        border: 1px solid #555;
        border-collapse: collapse;
        z-index: 9999;
    }
    td{
        padding:2px 4px 2px 6px;
        border: 1px solid #555;
        border-collapse: collapse;

        max-width: 900px;
        overflow: overlay;
    }
</style>