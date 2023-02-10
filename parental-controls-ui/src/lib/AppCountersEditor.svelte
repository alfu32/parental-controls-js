<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import type { ConfigurationRecord } from '../../../classes';
    export let appCounters: ConfigurationRecord[];
    function killapp(counter:ConfigurationRecord){
        console.log({counter})
        alert(`killing app ${counter.appid}`)
    }
  </script>
  <h2>Per-Application Counters</h2>
  <SimpleGrid  cols={3}>
  {#each appCounters as appCounter}

  <Card p="lg" padding='lg' withBorder={appCounter.isOn} radius="lg" shadow={appCounter.isOn?"lg":"sm"} class="appcard" style={appCounter.isOn?"border:1px solid #333;":"border:1px solid #ddd;"}>
    <Card.Section padding='lg' style="margin:1px;">
      <Text size="lg">Application {appCounter.appid}</Text>
      {#if appCounter.isOn}
        <Badge color='green' variant='light'>Is On</Badge>
        {:else}
        <Badge color='red' variant='light'>Is Off</Badge>
      {/if}
    </Card.Section>
  
    <Group position='apart'>
        <TextInput placeholder="regex" label="match application command" bind:value={appCounter.processregex} />
        <TextInput type="number" placeholder="maximum number of minutes allowed by the configuration" label="total minutes allowed" bind:value={appCounter.allowedMinutes} />
        <TextInput type="number" placeholder="the number of minutes recorded today" label="total recorded today"  bind:value={appCounter.usedMinutes} />
    </Group>
    <Button fullSize variant="outline" compact ripple size="sm" on:click={e => killapp(appCounter)}>save</Button>
    <Button  fullSize variant="outline" compact ripple size="sm" on:click={e => killapp(appCounter)}>kill</Button>
  </Card>
  {/each}
</SimpleGrid>
  <style>
    .appcard{
      border:1px solid #333;
      padding:20px;
      box-sizing: content-box;
    }
  </style>
  