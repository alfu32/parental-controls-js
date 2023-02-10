<script lang="ts">


	import { SvelteUIProvider, fns, AppShell, Navbar, Header, Title, Divider,Burger } from '@svelteuidev/core';

	import HeadContent from './lib/HeadContent.svelte';
	import NavContent from './lib/NavContent.svelte';


	let isDark = false;
	let opened = true;

	function toggleTheme() {
		isDark = !isDark;
	}
	function toggleOpened() {
		opened = !opened;
	}

	import { Tabs } from '@svelteuidev/core';

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

<SvelteUIProvider>
<AppShell>
	<nav slot="navbar" hidden={!opened} class="app-header">
		<NavContent />
  </nav>
	<Header slot="header" height={64}>
    <Burger
        {opened}
        size='md'
        on:click={() => toggleOpened()}
    />
		<HeadContent />
	</Header>

	<slot>
    <Tabs color='teal'>
      <Tabs.Tab label='Daily'>
        {#if counters }
          <CountersEditor dailyLimit={counters.dayLimit}></CountersEditor>
        {:else}
          <div>loading counter data</div>
        {/if}
      </Tabs.Tab>
      <Tabs.Tab label='Applications'>
        
        {#if counters }
          <AppCountersEditor appCounters={counters.applications}></AppCountersEditor>
        {:else}
          <div>loading counter data</div>
        {/if}
      </Tabs.Tab>
      <Tabs.Tab label='Debug' color='pink'>
        
        {#if counters }
          <pre>{JSON.stringify(counters,null,"  ")}</pre>  
        {:else}
          <div>loading counter data</div>
        {/if}
      </Tabs.Tab>
    </Tabs>
  </slot>
</AppShell>
</SvelteUIProvider>

<style>
  nav.app-header{
    max-width: 300px;
  }
</style>