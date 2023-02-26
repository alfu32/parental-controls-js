<script lang="ts">
    
    import { Button } from "@svelteuidev/core";
    import { onMount } from "svelte";
import type { CellChange, WTableColumnRenderer } from "./WTable";


    export let data:object[]
    export let config:WTableColumnRenderer[]
    let newRecord:object
    function resetNewItem(){
        newRecord=config.reduce(
            (init,{key,renderer,rendererConfig,initialValue}:WTableColumnRenderer) => {
                init[key]=initialValue||null;
                return init;
            },{}
        )
        console.log({newRecord})

    }
    onMount(()=>{
        resetNewItem()
    })
    function addNewRecord(){
        data=[...data,{...newRecord}]
        resetNewItem()
    }

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function deleteItem(item) {
        data=data.filter(i => i !== item)
        dispatch("change", data);
    }
    function createItem() {
        data=[...data,{...newRecord}]
        dispatch("change", data);
        resetNewItem()
    }
    function cellChanged(index:number):Function{
        return function (evt:CustomEvent<CellChange>){
            console.log("cellChanged",index,evt.detail)
        }
    }
    function newItemChanged(evt:CustomEvent<CellChange>){
        console.log("newItemChanged",evt.detail)
        const {key,value} = evt.detail
        newRecord={...newRecord,[key]:value}
    }
</script>

{#if config}
<div class=wrapper>
    <pre>{JSON.stringify(newRecord)}</pre>
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
            {#each data as record,index}
                <tr>
                    {#each config as {key,renderer,rendererConfig,initialValue}}
                        <td>
                            <svelte:component
                                this={renderer}
                                key={key}
                                value={(rendererConfig.tfin || (a=>a))(record[key])}
                                on:change={cellChanged(index)}
                                config={rendererConfig}
                            />
                        </td>
                    {/each}
                    <td>
                        <slot name="row-operations" record={record}></slot>
                    </td>
                </tr>
            {/each}
            <tr>
                {#each config as {key,renderer,rendererConfig,initialValue}}
                    <td>
                        <svelte:component
                            this={renderer}
                            key={key}
                            value={(newRecord[key])}
                            on:change={newItemChanged}
                            config={rendererConfig}
                        />
                    </td>
                {/each}
                <td>
                    <Button compact ripple size="sm" on:click={createItem}>Add</Button>
                    <Button compact ripple size="sm" variant="outline" on:click={resetNewItem}>Reset</Button>
                </td>
            </tr>
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
        border-bottom: 1px solid #555;
        border-collapse: collapse;
        z-index: 9999;
    }
    td{
        padding:2px 4px 2px 6px;
        border-bottom: 1px dotted #555;
        border-collapse: collapse;

        max-width: 900px;
        overflow: overlay;
    }
</style>