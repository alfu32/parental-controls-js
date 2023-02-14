<script lang="ts">
	import { onMount } from 'svelte';


	import { SvelteUIProvider, fns, AppShell, Navbar, Header, Title, Divider,Burger, Stack, Button, TextInput, Input } from '@svelteuidev/core';

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

  import {ParentalControlsApi,Result,} from './client-api';
  import type { Config, ConfigurationRecord, Counters, DailyLimitConfig } from '../../src/classes';
  import CountersEditor from './lib/CountersEditor.svelte';
  import AppCountersEditor from './lib/AppCountersEditor.svelte';
    import DailyConfigEditor from './lib/DailyConfigEditor.svelte';
    import AppConfigEditor from './lib/AppConfigEditor.svelte';

  let counters:Counters=null;
  let config:Config=null;
  let host="localhost"
  let gapi=new ParentalControlsApi(`${host}:8080`)
  let error=null;

  function selectHost(e){
    console.log("selecting host",e.target.value)
    host = e.target.value
    gapi=new ParentalControlsApi(`${host}:8080`)
  }
  let serverlist=[
    "localhost",
  ]

  let to:NodeJS.Timeout;
  async function fetchCounters(){
    clearTimeout(to)
  try{
    let api=new ParentalControlsApi(`${host}:8080`)
    const pct = api.getCounters();
    const pcf = api.getConfig()
    const [ct,cf] = await Promise.all([
      pct,
      pcf,
    ])
    counters = ct.unwrap()
    config = cf.unwrap()
    error=null
  }catch(err){
    console.warn(err);
    error={message:err.message,stacktrace:err.stack.split("\n")}
    counters=null;
    config=null;
  }
    to=setTimeout(fetchCounters,60000)
  }
  onMount(async ()=>{
    await fetchCounters()
  })
  async function saveCounters(){
    const result = await gapi.updateCounters(counters);
    console.log({fn:saveCounters,result})
  }
  async function saveConfigLimits(newConfigLimits:CustomEvent<DailyLimitConfig[]>){
    const newConfig = config.copy()
    newConfig.dailyLimits=newConfigLimits.detail
    const result = await gapi.updateConfig(newConfig);
    console.log({fn:"saveConfigLimits",newConfigLimits,result})
  }
  async function saveAppConfigs(newAppConfigLimits:CustomEvent<ConfigurationRecord[]>){
    const newConfig = config.copy()
    newConfig.applications=newAppConfigLimits.detail
    const result = await gapi.updateConfig(newConfig);
    console.log({fn:"saveAppConfigs",config:config.copy(),result})
  }
  async function createAppConfig(newAppConfig:CustomEvent<ConfigurationRecord>){
    console.log({appConfig:newAppConfig.detail})
    const newConfig = config.copy()
    newConfig.applications.push(newAppConfig.detail)
    console.log({newConfig})
    const result = await gapi.updateConfig(newConfig);
    console.log({fn:gapi.updateConfig,result})
    config=result.unwrap();
  }
  async function createAppCounter(newAppCounter:CustomEvent<ConfigurationRecord>){
    console.log({appCounter:newAppCounter.detail})
    const newCounters = counters.copy()
    newCounters.applications.push(newAppCounter.detail)
    console.log({newCounters})
    const result = await gapi.updateCounters(newCounters);
    console.log({fn:gapi.updateCounters,result})
    counters=result.unwrap();
  }
  async function sendShutdown(){
    const response = gapi.shutdown()
    console.log({response})
  }
  async function sendAbortShutdown(){
    const response = gapi.abortShutdown()
    console.log({response})
  }
  let messageText="";
  async function message(){
    const response = await gapi.sendMessage(messageText)
    console.log({response})
  }
  async function pkillall(e:CustomEvent<ConfigurationRecord>){
    console.log("killall",e.detail)
    gapi.killAllInstancesOf(e.detail)
  }
</script>

<SvelteUIProvider>
<AppShell>

	<slot>
    <h3>Currently Selected computer {host}</h3>
    <hr/>
    <strong>Select a different computer</strong>
    <Input root="select" on:change={selectHost}>
      <option value="localhost">local</option>
      <option value="hefaistos.local">mihai</option>
      <option value="artemis.local">gabriela</option>
      <option value="192.168.1.27">mihai-IP</option>
      <option value="192.168.1.31">gabriela-31</option>
    </Input>
    <hr/>
    <strong>send a notification to {host}</strong>
    <TextInput bind:value={messageText} multiline></TextInput>
    <Button on:click={message}>send message</Button>
    <hr/>
    {#if error}
      <p>error connecting to {host}</p>
      <pre>{JSON.stringify(error,null," ")}</pre>
    {/if}
    <Tabs color='teal'>
      <Tabs.Tab label='Current Global Limits'>
          <Button on:click={e => sendShutdown()}>shutdown computer</Button>
          <Button on:click={e => gapi.abortShutdown()}>abort shutdown</Button>
          <CountersEditor dailyLimit={counters?.dayLimit} on:save={saveCounters}></CountersEditor>
      </Tabs.Tab>
      <Tabs.Tab label='Current Application Limits'>
          <AppCountersEditor appCounters={counters?.applications} on:save={saveCounters} on:create={createAppCounter} on:terminateapprequest={pkillall}>
            <h2 slot="title">Current Application Limits and Counters</h2>
          </AppCountersEditor>
      </Tabs.Tab>
      <Tabs.Tab label='Debug-Counters' color='pink'>
          <pre>{JSON.stringify(counters,null,"  ")}</pre>
      </Tabs.Tab>
      <Tabs.Tab label='Weekly Configuration'>
        {#if config }
          {#each config.dailyLimits as  conf,index }
            <DailyConfigEditor dayIndex={index} conf={conf} on:saveLimits={saveConfigLimits}></DailyConfigEditor>
          {/each}
        {:else}
          <div>loading counter data</div>
        {/if}
      </Tabs.Tab>
      <Tabs.Tab label='Applications Configuration'>
          <AppConfigEditor appConfigs={config?.applications} on:saveAppConfigs={saveAppConfigs} on:create={createAppConfig}>
            <h2 slot="title">Per-Application Limits Configuration</h2>
          </AppConfigEditor>
      </Tabs.Tab>
      <Tabs.Tab label='Debug-Config' color='pink'>
          <pre>{JSON.stringify(config,null,"  ")}</pre>
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