<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge } from '@svelteuidev/core';
    import { ConfigurationRecord,Config, Counters } from '../../../src/classes';
    export let config: Config;
    export let counters:Counters
    $:appsIndexed=counters?.applications?.reduce((o:{[key:string]:ConfigurationRecord},v:ConfigurationRecord) =>{
      o[v.appid]=v
      return o;
    },{})
    let newAppConfig: ConfigurationRecord = new ConfigurationRecord()
    import { createEventDispatcher } from "svelte";
    import WTableSemaphore from './WTable/WTableSemaphore.svelte';
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", config);
    }
    function deleteItem(item) {
      config.applications=config.applications.filter(i => i !== item)
        dispatch("save", config);
    }
    function create() {
        dispatch("create", newAppConfig.copy());
        newAppConfig = new ConfigurationRecord()
    }
    function resetItemAtIndex(index:number) {
      config.applications[index].allowedMinutes=config.applications[index].allowedMinutes
      config.applications[index].appid=config.applications[index].appid
      config.applications[index].processregex=config.applications[index].processregex
      config.applications[index].usedMinutes=config.applications[index].usedMinutes
    }
  </script>
  <slot><h2>Per-Application Configuration</h2></slot>
  <table>
  <tr>
    <th></th>
    <th>isOn</th>
    <th>Name</th>
    <th>Search Pattern</th>
    <!--th>Used Minutes</th-->
    <th>Allowed Minutes</th>
  </tr>
  {#if config != null && appsIndexed !== null}
  {#each config.applications as appConfig,index }
    <tr>
      <td>{index + 1}</td>
      <td><WTableSemaphore value={appsIndexed[appConfig.appid].isOn} key="" config={{}}/></td>
      <td><TextInput bind:value={appConfig.appid}/></td>
      <td><TextInput bind:value={appConfig.processregex}/></td>
      <!--td><TextInput bind:value={appConfig.usedMinutes}/></td-->
      <td><TextInput bind:value={appConfig.allowedMinutes}/></td>
      <td><Button fullSize variant="outline" color="red" compact ripple size="sm" on:click={e => deleteItem(appConfig)}>delete</Button></td>
      <td><Button fullSize variant="outline" compact ripple size="sm" on:click={e => resetItemAtIndex(index)}>reset</Button></td>
      <td><Button fullSize compact ripple size="sm" on:click={e => change()}>save</Button></td>
    </tr>
  {/each}
  <tr>
    <td>*</td>
    <td></td>
    <td><TextInput bind:value={newAppConfig.appid}/></td>
    <td><TextInput bind:value={newAppConfig.processregex}/></td>
    <!--td>{newAppConfig.usedMinutes}</td-->
    <td><TextInput bind:value={newAppConfig.allowedMinutes}/></td>
    <td><Button fullSize compact ripple size="sm" on:click={e => create()}>create</Button></td>
    <td><Button fullSize variant="outline" compact ripple size="sm" on:click={e => newAppConfig = new ConfigurationRecord()}>reset</Button></td>
  </tr>
  {/if}
  </table>
  <style>
    .appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }
  </style>
  