<script lang="ts">
    import { Button,TextInput,Card } from '@svelteuidev/core';
    import type { Counters,DailyLimit } from '../../../src/classes';
    export let dailyLimit: DailyLimit;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", dailyLimit);
    }
  </script>

  {#if dailyLimit != null}
    <h1>Today's Limits</h1>
    <span>{"Su,Mo,Tu,We,Th,Fr,Sa".split(",")[dailyLimit.dayNumber]} {dailyLimit.date.toISOString().replace('T',' ').substring(0,19)}</span>
    <hr/>
    <tr>
        <th>Time Start</th>
        <th>Time End</th>
        <th>Max Allowed</th>
        <th>Used Tdoay</th>
        <th></th>
        <th></th>
    </tr>
    <tr>
        <td>time in millitary format<br/>( 0930 instead of 09:30 )</td>
        <td>time in millitary format<br/>( 0930 instead of 09:30 )</td>
        <td>maximum number of minutes<br/>allowed by the configuration</td>
        <td>total minutes running<br/>today</td>
        <td><Button compact ripple size="sm" on:click={e => change()}>save</Button></td>
        <td><Button compact ripple size="sm" variant="outline" on:click={e => change()}>reset</Button></td>
    </tr>
    <tr>
        <td>
            <TextInput bind:value={dailyLimit.startHourMinute} />
        </td>
        <td>
            <TextInput bind:value={dailyLimit.endHourMinute} />
        </td>
        <td>
            <TextInput bind:value={dailyLimit.totalAllowed} />
        </td>
        <td>
            {dailyLimit.total}
        </td>
    </tr>
  {:else}
    no data
  {/if}
  