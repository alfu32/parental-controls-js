<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import { ConfigurationRecord } from '../../../classes';
    export let appCounters: ConfigurationRecord[];
    let newAppCounterConfig: ConfigurationRecord = new ConfigurationRecord()
    import { createEventDispatcher } from "svelte";
    import AppCard from './AppCard.svelte';
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", appCounters);
    }
    function create() {
        dispatch("create", newAppCounterConfig.copy());
        newAppCounterConfig = new ConfigurationRecord()
    }
    function terminateapp(appCounter:ConfigurationRecord) {
        dispatch("terminateapprequest", appCounter);
    }
  </script>
  <h2>Per-Application Configuration</h2>
  <SimpleGrid  cols={3}>
  {#each appCounters as appCounter}
    <AppCard appCounter={appCounter} on:save on:terminateapprequest>
      <div>
        <Button fullSize variant="outline" compact ripple size="sm" on:click={e => change()}>save</Button>
        <Button  fullSize variant="outline" compact ripple size="sm" on:click={e => terminateapp(appCounter)}>terminate</Button>
      </div>
    </AppCard>
  {/each}
  <AppCard appCounter={newAppCounterConfig} on:save on:terminateapprequest>
    <div>
      <Button fullSize variant="outline" compact ripple size="sm" on:click={e => create()}>create</Button>
    </div>
  </AppCard>
</SimpleGrid>
  <style>
    .appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }
  </style>
  