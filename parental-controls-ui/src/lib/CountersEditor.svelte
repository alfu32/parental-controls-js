<script lang="ts">
    import { Button,TextInput,Card } from '@svelteuidev/core';
    import type { Counters,DailyLimit } from '../../../classes';
    export let dailyLimit: DailyLimit;
    function shutdown(){
        console.log({})
        alert(`shutting down computer`)
    }
  </script>
  <h2>Today's Limits</h2>
  <Button on:click={e => shutdown()}>shutdown computer</Button>
  
  <div class="listform">
    <div class="row" id="date">
        {"Su,Mo,Tu,We,Th,Fr,Sa".split(",")[dailyLimit.dayNumber]} <span>{dailyLimit.date.toISOString().replace('T',' ').substring(0,19)}</span>
    </div>
    <div class="row" id="startHourMinute">
        <TextInput placeholder="time in millitary format ( 0930 instead of 09:30 )" label="lower time limit" bind:value={dailyLimit.startHourMinute} />
    </div>
    <div class="row" id="endHourMinute">
        <TextInput placeholder="time in millitary format ( 0930 instead of 09:30 )" label="upper time limit" bind:value={dailyLimit.endHourMinute} />
    </div>
    <div class="row" id="totalAllowed">
        <TextInput placeholder="maximum number of minutes allowed by the configuration" label="total minutes allowed" bind:value={dailyLimit.totalAllowed} />
    </div>
    <div class="row" id="total">
        <TextInput placeholder="the number of minutes recorded today" label="total recorded today" bind:value={dailyLimit.total} />
    </div>
    <Button on:click={e => shutdown()}>save</Button>
  </div>
  