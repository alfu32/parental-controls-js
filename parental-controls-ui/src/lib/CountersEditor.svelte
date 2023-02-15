<script lang="ts">
    import { Button,TextInput,Card, SimpleGrid } from '@svelteuidev/core';
    import type { Counters,DailyLimit } from '../../../src/classes';
    export let dailyLimit: DailyLimit;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", dailyLimit);
    }
  </script>

<SimpleGrid  cols={2}>
  <h2>Today's Limits</h2>
  {#if dailyLimit != null}
    <div id="date">
        {"Su,Mo,Tu,We,Th,Fr,Sa".split(",")[dailyLimit.dayNumber]} <span>{dailyLimit.date.toISOString().replace('T',' ').substring(0,19)}</span>
    </div>
    <div id="startHourMinute">
        <TextInput placeholder="time in millitary format ( 0930 instead of 09:30 )" label="lower time limit" bind:value={dailyLimit.startHourMinute} />
    </div>
    <div id="endHourMinute">
        <TextInput placeholder="time in millitary format ( 0930 instead of 09:30 )" label="upper time limit" bind:value={dailyLimit.endHourMinute} />
    </div>
    <div id="totalAllowed">
        <TextInput placeholder="maximum number of minutes allowed by the configuration" label="total minutes allowed" bind:value={dailyLimit.totalAllowed} />
    </div>
    <div id="total">
        <TextInput placeholder="the number of minutes recorded today" label="total recorded today" bind:value={dailyLimit.total} />
    </div>
    <Button on:click={e => change()}>save</Button>
    <Button variant="outline" on:click={e => change()}>reset</Button>
  {:else}
    no data
  {/if}
</SimpleGrid>
  