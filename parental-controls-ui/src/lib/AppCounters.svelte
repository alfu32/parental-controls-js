<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge } from '@svelteuidev/core';
    import type { Counters,ConfigurationRecord } from '../../../src/classes';
    export let counters: Counters;
    import { createEventDispatcher, onMount } from "svelte";
    import AppStatusCard from './AppStatusCard.svelte';
    import { decimalMinutesToString } from './functions';
    import WTableSemaphore from './WTable/WTableSemaphore.svelte';
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", counters);
    }
    function deleteItem(item) {
      counters.applications=counters.applications.filter(i => i !== item)
        dispatch("save", counters);
    }
    function terminateapp(appCounter:ConfigurationRecord) {
        dispatch("terminateapprequest", appCounter);
    }
    onMount(()=>{
      console.log("AppCounters.onMount",{counters})
    })
  </script>
  <slot name="title"><h2>Per-Application Counters</h2></slot>
  <table>
  <tr>
    <th>isOn</th>
    <th>Application</th>
    <th>Used Minutes</th>
    <th>Allowed Minutes</th>
    <th></th>
  </tr>
  {#if counters != null}
    {#each counters.applications as appCounter}
    <tr>
      <td><WTableSemaphore value={appCounter.isOn} key="" config={{}}/></td>
      <td>{appCounter.appid}</td>
      <td>{(appCounter.usedMinutes).toFixed(2)}</td>
      <td><TextInput bind:value={appCounter.allowedMinutes}/></td>
      <td><Button fullSize variant="outline" color="red" compact ripple size="sm" on:click={e => deleteItem(appCounter)}>delete</Button></td>
      <td><Button fullSize variant="outline" compact ripple size="sm" on:click={e => terminateapp(appCounter)}>close</Button></td>
      <td><Button fullSize variant="outline" compact ripple size="sm" on:click={e => change()}>save</Button></td>
    </tr>
    {/each}
  {:else}
    <tr><td>no data</td></tr>
  {/if}
  </table>
  <style>
    /*.appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }*/
  </style>
  