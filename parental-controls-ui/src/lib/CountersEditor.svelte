<script lang="ts">
    import { Button,TextInput,Card } from '@svelteuidev/core';
    import type { Counters,DailyLimit } from '../../../src/classes';
    export let counters: Counters;
    import { createEventDispatcher } from "svelte";
    import { decimalMinutesToString } from './functions';
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", counters);
    }
  </script>

  {#if counters != null}
    <h1>Today's Limits</h1>
    <span>{"Su,Mo,Tu,We,Th,Fr,Sa".split(",")[counters.dayLimit.dayNumber]} {counters.dayLimit.date.toISOString().replace('T',' ').substring(0,19)}</span>
    <hr/>
    <tr>
        <td>
            <strong>Time Start</strong>
            <br><small>time in millitary format ( 0930 instead of 09:30 )</small>
        </td>
        <td>
            <TextInput bind:value={counters.dayLimit.startHourMinute} />
        </td>
    </tr>
    <tr>
        <td>
            <strong>Time End</strong>
            <br><small>time in millitary format ( 0930 instead of 09:30 )</small>
        </td>
        <td>
            <TextInput bind:value={counters.dayLimit.endHourMinute} />
        </td>
    </tr>
    <tr>
        <td>
            <strong>Max Allowed</strong>
            <br><small>maximum number of minutes allowed by the configuration</small>
        </td>
        <td>
            <TextInput bind:value={counters.dayLimit.totalAllowed} />
        </td>
    </tr>
    <tr>
        <td>
            <strong>Used Today</strong>
            <br><small>total minutes running today</small>
        </td>
        <td>
            {(counters.dayLimit.total).toFixed(2)}
        </td>
    </tr>
    <tr>
        <th></th>
        <td><Button compact ripple size="sm" on:click={e => change()}>save</Button></td>
        <td><Button compact ripple size="sm" variant="outline" on:click={e => change()}>reset</Button></td>
        <th></th>
    </tr>
    <tr>
    </tr>
    <tr>
    </tr>
  {:else}
    no data
  {/if}
  