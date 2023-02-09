<script lang="ts">
    import type { ConfigurationRecord } from '../../../classes';
    export let appCounters: ConfigurationRecord[];
    function killapp(counter:ConfigurationRecord){
        console.log({counter})
        alert(`killing app ${counter.appid}`)
    }
  </script>
  <h2>Per-Application Counters</h2>
  {#each appCounters as appCounter}
  <div class="listform">
    <h3>{appCounter.appid}</h3>
    <button on:click={e => killapp(appCounter)}>kill {appCounter.appid}</button>
    <div class="row" id="processregex">
        <label for="input_processregex" class="label">processregex</label>
        <input id="input_startHourMinute" type="text" value={appCounter.processregex}/>
    </div>
    <div class="row" id="allowedMinutes">
        <label for="input_allowedMinutes" class="label">allowedMinutes</label>
        <input id="input_endHourMinute" type="text" value={appCounter.allowedMinutes}/>
    </div>
    <div class="row" id="usedMinutes">
        <label for="input_usedMinutes" class="label">usedMinutes</label>
        <input id="input_totalAllowed" type="text" value={appCounter.usedMinutes}/>
    </div>
    
  </div>
  {/each}
  <style>
    .listform{

    }
    .row{}
    .label{}
  </style>
  