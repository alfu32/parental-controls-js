<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge } from '@svelteuidev/core';
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
  <table>
  <tr>
    <th>Application</th>
    <th>Used Minutes</th>
    <th>Allowed Minutes</th>
    <th></th>
  </tr>
  {#if appCounters != null}
    {#each appCounters as appCounter}
    <tr>
    <td>{appCounter.appid}</td>
    <td>{appCounter.usedMinutes}</td>
    <td>{appCounter.allowedMinutes}</td>
    <td><Button fullSize variant="outline" compact ripple size="sm" on:click={e => terminateapp(appCounter)}>close all instances</Button></td>
    </tr>
    {/each}
  {:else}
    <tr><td>no data</td></tr>
  {/if}
  </table>
  <style>
    .appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }
  </style>
  