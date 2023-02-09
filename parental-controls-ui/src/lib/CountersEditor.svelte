<script lang="ts">
    import type { Counters,DailyLimit } from '../../../classes';
    export let dailyLimit: DailyLimit;
    function shutdown(){
        console.log({})
        alert(`shutting down computer`)
    }
  </script>
  <h2>Today's Limits</h2>
  <button on:click={e => shutdown()}>shutdown</button>
  <div class="listform">
    <div class="row" id="date">
        <span>{dailyLimit.date.toISOString()}</span>
    </div>
    <div class="row" id="dayNumber">
        <label for="input_dayNumber" class="label">dayNumber</label>
        <input id="input_dayNumber" type="text" value={dailyLimit.dayNumber}/>
    </div>
    <div class="row" id="startHourMinute">
        <label for="input_startHourMinute" class="label">startHourMinute</label>
        <input id="input_startHourMinute" type="text" value={dailyLimit.startHourMinute}/>
    </div>
    <div class="row" id="endHourMinute">
        <label for="input_endHourMinute" class="label">endHourMinute</label>
        <input id="input_endHourMinute" type="text" value={dailyLimit.endHourMinute}/>
    </div>
    <div class="row" id="totalAllowed">
        <label for="input_totalAllowed" class="label">totalAllowed</label>
        <input id="input_totalAllowed" type="text" value={dailyLimit.totalAllowed}/>
    </div>
    <div class="row" id="total">
        <label for="input_total" class="label">total today</label>
        <input id="input_total" type="text" value={dailyLimit.total}/>
    </div>
  </div>
  