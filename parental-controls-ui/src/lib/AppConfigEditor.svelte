<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import { ConfigurationRecord } from '../../../src/classes';
    export let appConfigs: ConfigurationRecord[];
    export let copies: ConfigurationRecord[] = appConfigs?.map(c=>c.copy());
    let newAppConfig: ConfigurationRecord = new ConfigurationRecord()
    import { createEventDispatcher } from "svelte";
    import AppConfigCard from './AppConfigCard.svelte';
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("saveAppConfigs", appConfigs);
    }
    function deleteItem(item) {
        dispatch("saveAppConfigs", appConfigs.filter(i => i !== item));
    }
    function create() {
        dispatch("create", newAppConfig.copy());
        newAppConfig = new ConfigurationRecord()
    }
    function resetItemAtIndex(index:number) {
      appConfigs[index].allowedMinutes=copies[index].allowedMinutes
      appConfigs[index].appid=copies[index].appid
      appConfigs[index].processregex=copies[index].processregex
      appConfigs[index].usedMinutes=copies[index].usedMinutes
    }
  </script>
  <slot name="title"><h2>Per-Application Configuration</h2></slot>
  <SimpleGrid  cols={3}>

  {#if appConfigs != null}
  {#each appConfigs as appConfig,index }
    <AppConfigCard configurationRecord={appConfig} reference={appConfig.copy()} on:save on:terminateapprequest>
      <div>
        <Button fullSize variant="filled" compact ripple size="sm" on:click={e => change()}>save configuration</Button>
        <Button fullSize variant="outline" compact ripple size="sm" on:click={e => resetItemAtIndex(index)}>reset</Button>
        <Button fullSize variant="outline" color="red" compact ripple size="sm" on:click={e => deleteItem(appConfig)}>delete configuration</Button>
      </div>
    </AppConfigCard>
  {/each}
  {/if}
  <AppConfigCard configurationRecord={newAppConfig} on:save on:terminateapprequest>
    <div>
      <Button fullSize compact ripple size="sm" on:click={e => create()}>create</Button>
      <Button fullSize variant="outline" compact ripple size="sm" on:click={e => newAppConfig = new ConfigurationRecord()}>reset</Button>
    </div>
  </AppConfigCard>
</SimpleGrid>
  <style>
    .appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }
  </style>
  