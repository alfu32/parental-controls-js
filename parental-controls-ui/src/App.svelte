<script lang="ts">
	import { onMount } from 'svelte';


	import { Grid,SvelteUIProvider, fns, AppShell, Navbar, Header, Title, Divider,Burger, Stack, Button, TextInput, Input,SimpleGrid } from '@svelteuidev/core';


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
  import AppCountersList from './lib/AppCounters.svelte';
    import AppConfigEditor from './lib/AppConfigEditor.svelte';
    import WeeklyConfigEditor from './lib/WeeklyConfigEditor.svelte';
    let hosts=[
      {address:"localhost",label:"local"},
      {address:"hefaistos.local",label:"mihai"},
      {address:"artemis.local",label:"gabriela"},
      {address:"192.168.1.27",label:"mihai-IP"},
      {address:"192.168.1.31",label:"gabriela-IP"},
    ]
  let counters:Counters=null;
  let config:Config=null;
  let host=hosts[0]
  let gapi=new ParentalControlsApi(`${host.address}:8080`)
  let error=null;

  async function selectHost(index){
    console.log("selecting host",hosts[index])
    host = hosts[index]
    gapi=new ParentalControlsApi(`${host.address}:8080`)
    await fetchConfig()
    await fetchCounters()
  }
  async function fetchConfig(){
    try{
      let api=new ParentalControlsApi(`${host.address}:8080`)
      const pcf = await api.getConfig()
      config = pcf.unwrap()
      error=null
    }catch(err){
      console.warn(err);
      error={message:err.message,stacktrace:err.stack.split("\n")}
      counters=null;
      config=null;
    }
  }
  let to:NodeJS.Timeout;
  async function fetchCounters(){
    clearTimeout(to)
    try{
      let api=new ParentalControlsApi(`${host.address}:8080`)
      const ct = await api.getCounters();
      counters = ct.unwrap()
      error=null
    }catch(err){
      console.warn(err);
      error={message:err.message,stacktrace:err.stack.split("\n")}
      counters=null;
      config=null;
    }
    to=setTimeout(fetchCounters,10000)
  }
  onMount(async ()=>{
    await fetchConfig();
    await fetchCounters();
  })
  async function saveConfigLimits(newConfigLimits:CustomEvent<DailyLimitConfig[]>){
    const newConfig = config.copy()
    newConfig.dailyLimits=newConfigLimits.detail
    const result = await gapi.updateConfig(newConfig);
    config=result.unwrap()
    console.log({fn:"saveConfigLimits",newConfigLimits,result})
  }
  async function saveAppConfigs(newAppConfigLimits:CustomEvent<ConfigurationRecord[]>){
    const newConfig = config.copy()
    newConfig.applications=newAppConfigLimits.detail
    const result = await gapi.updateConfig(newConfig);
    config=result.unwrap()
    console.log({fn:"saveAppConfigs",config:config.copy(),result})
  }
  async function createAppConfig(newAppConfig:CustomEvent<ConfigurationRecord>){
    console.log({appConfig:newAppConfig.detail})
    const newConfig = config.copy()
    newConfig.applications.push(newAppConfig.detail)
    console.log({newConfig})
    const result = await gapi.updateConfig(newConfig);
    config=result.unwrap()
    console.log({fn:gapi.updateConfig,result})
    config=result.unwrap();
  }
  async function saveCounters(){
    const result = await gapi.updateCounters(counters);
    counters=result.unwrap()
    console.log({fn:saveCounters,result})
  }
  async function createAppCounter(newAppCounter:CustomEvent<ConfigurationRecord>){
    console.log({appCounter:newAppCounter.detail})
    const newCounters = counters.copy()
    newCounters.applications.push(newAppCounter.detail)
    console.log({newCounters})
    const result = await gapi.updateCounters(newCounters);
    counters=result.unwrap()
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
    <Grid>
      <Grid.Col span={2}>
        <h4>Managing  {host.label}</h4>
        <hr/>
        <strong>Select a different computer</strong>
        {#each hosts as value,index}
        <div class={host===value?"host host-selected":"host"} on:keypress on:click={e => selectHost(index)}>{value.label}</div>
        {/each}
        <hr/>
        <strong>send a notification to {host.label}</strong>
        <TextInput bind:value={messageText} multiline></TextInput>
        <Button on:click={message}>send message</Button>
      </Grid.Col>
      <Grid.Col span={8}>
        <Tabs color='teal'>
          <Tabs.Tab label='Settings' color='pink'>
          </Tabs.Tab>
          <Tabs.Tab label='{host.label} Status'>
              <CountersEditor dailyLimit={counters?.dayLimit} on:save={saveCounters}></CountersEditor>
              <AppCountersList appCounters={counters?.applications} on:save={saveCounters} on:create={createAppCounter} on:terminateapprequest={pkillall}>
                <h2 slot="title">Current Application Limits and Counters</h2>
              </AppCountersList>
          </Tabs.Tab>
          <Tabs.Tab label='{host.label} Configuration'>
              <WeeklyConfigEditor config={config} on:saveLimits={saveConfigLimits}></WeeklyConfigEditor>
              <AppConfigEditor appConfigs={config?.applications} on:saveAppConfigs={saveAppConfigs} on:create={createAppConfig}>
                <h2 slot="title">Per-Application Limits Configuration</h2>
              </AppConfigEditor>
          </Tabs.Tab>
          <Tabs.Tab label='Task Manager' color='pink'>
            <SimpleGrid  cols={5}>
              <Button on:click={e => sendShutdown()}>shutdown computer</Button>
              <Button variant="outline" on:click={e => sendAbortShutdown()}>abort shutdown</Button>
            </SimpleGrid>
              <pre>{JSON.stringify(config,null,"  ")}</pre>
          </Tabs.Tab>
          <Tabs.Tab label='Notifications' color='pink'>
          </Tabs.Tab>
          <!--Tabs.Tab label='Config' color='pink'>
              <pre>{JSON.stringify(config,null,"  ")}</pre>
          </Tabs.Tab>
          <Tabs.Tab label='Report' color='pink'>
              <pre>{JSON.stringify(counters,null,"  ")}</pre>
          </Tabs.Tab-->
        </Tabs>
      </Grid.Col>
  </Grid>
  </slot>
  {#if error}
    <p>error connecting to {host.label}</p>
    <pre>{JSON.stringify(error,null," ")}</pre>
  {/if}
</AppShell>
</SvelteUIProvider>

<style>
  .host{
    max-width: 300px;
    border-left: 5px solid transparent;
    cursor:pointer;
    margin:2px;
    padding:4px 4px 4px 12px;
  }
  .host.host-selected{
    border-left: 5px solid teal;
  }
</style>