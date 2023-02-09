<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import Counter from './lib/Counter.svelte'
  import {getCounters,getConfig,Result} from './client-api';
  import type { Config, Counters } from '../../classes';
  import CountersEditor from './lib/CountersEditor.svelte';
  import AppCountersEditor from './lib/AppCountersEditor.svelte';
  let to:NodeJS.Timeout;
  async function fetchCounters(){
    clearTimeout(to)
    getCounters().then(
      co => {
        counters = co.unwrap()
        counters.dayLimit.date=new Date()
        to=setTimeout(fetchCounters,10000);
      }
    )
    getConfig().then(
      co => {
        config = co.unwrap()
        to=setTimeout(fetchCounters,10000);
      }
    )
  }
  let counters:Counters=null;
  let config:Config=null;
  fetchCounters()
</script>

<main>
  {#if counters }
    <CountersEditor dailyLimit={counters.dayLimit}></CountersEditor>
    <AppCountersEditor appCounters={counters.applications}></AppCountersEditor>
    <pre>{JSON.stringify(counters,null,"  ")}</pre>  
  {:else}
    <div>loading counter data</div>
  {/if}
  
</main>

<style>
</style>