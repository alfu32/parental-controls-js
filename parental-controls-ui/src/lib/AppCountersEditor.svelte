<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import type { ConfigurationRecord } from '../../../src/classes';
    export let appCounters: ConfigurationRecord[];
    import { createEventDispatcher, onMount } from "svelte";
    import AppStatusCard from './AppStatusCard.svelte';
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", appCounters);
    }
    function deleteItem(item) {
        dispatch("save", appCounters.filter(i => i !== item));
    }
    function terminateapp(appCounter:ConfigurationRecord) {
        dispatch("terminateapprequest", appCounter);
    }
    onMount(()=>{
      console.log("AppCountersEditor.onMount",{appCounters})
    })
  </script>
  <slot name="title"><h2>Per-Application Counters</h2></slot>

  {#if appCounters != null}
  <SimpleGrid  cols={5}>
  {#each appCounters as appCounter}
    <AppStatusCard configurationRecord={appCounter} on:save on:terminateapprequest>
      <div>
        <Button  fullSize variant="outline" compact ripple size="sm" on:click={e => terminateapp(appCounter)}>close all instances</Button>
      </div>
    </AppStatusCard>
  {/each}
</SimpleGrid>
{:else}
  no data
{/if}
  <style>
    .appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }
  </style>
  