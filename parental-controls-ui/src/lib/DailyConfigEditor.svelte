<script lang="ts">
    import { Button,TextInput,Card } from '@svelteuidev/core';
    import type { Counters,DailyLimit, DailyLimitConfig } from '../../../classes';
    export let dayIndex: number;
    export let conf: DailyLimitConfig;
    const days="Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
    function shutdown(){
        console.log({})
        alert(`shutting down computer`)
    }
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function change({ detail }) {
        dispatch("save", conf);
    }
  </script>
  <h2>Limits for {days.split(",")[dayIndex]}s</h2>
  <div class="listform">
    <div class="row" id="startHourMinute">
        <TextInput placeholder="time in millitary format ( 0930 instead of 09:30 )" label="lower time limit" bind:value={conf.startHourMinute} />
    </div>
    <div class="row" id="endHourMinute">
        <TextInput placeholder="time in millitary format ( 0930 instead of 09:30 )" label="upper time limit" bind:value={conf.endHourMinute} />
    </div>
    <div class="row" id="totalAllowed">
        <TextInput placeholder="maximum number of minutes allowed by the configuration" label="total minutes allowed" bind:value={conf.totalAllowed} />
    </div>
    <div class="row" id="total">
        <TextInput placeholder="the number of minutes recorded init" label="total recorded initial value" bind:value={conf.total} />
    </div>
    <Button on:click={e => shutdown()}>save</Button>
  </div>
  