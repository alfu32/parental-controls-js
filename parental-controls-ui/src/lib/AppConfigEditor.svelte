<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge } from '@svelteuidev/core';
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
  <table>
  <tr>
    <th></th>
    <th>Name</th>
    <th>Search Pattern</th>
    <!--th>Used Minutes</th-->
    <th>Allowed Minutes</th>
  </tr>
  {#if appConfigs != null}
  {#each appConfigs as appConfig,index }
    <tr>
      <td>{index + 1}</td>
      <td><TextInput bind:value={appConfig.appid}/></td>
      <td><TextInput bind:value={appConfig.processregex}/></td>
      <!--td><TextInput bind:value={appConfig.usedMinutes}/></td-->
      <td><TextInput bind:value={appConfig.allowedMinutes}/></td>
      <td><Button fullSize variant="outline" color="red" compact ripple size="sm" on:click={e => deleteItem(appConfig)}>delete</Button></td>
      <td><Button fullSize variant="outline" compact ripple size="sm" on:click={e => resetItemAtIndex(index)}>reset</Button></td>
    </tr>
  {/each}
  <tr>
    <td>*</td>
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
  