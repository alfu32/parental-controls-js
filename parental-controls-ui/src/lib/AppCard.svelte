<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import type { ConfigurationRecord } from '../../../classes';
    export let appCounter: ConfigurationRecord;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function change() {
        dispatch("save", appCounter);
    }
    function terminateapp(appCounter:ConfigurationRecord) {
        dispatch("terminateapprequest", appCounter);
    }
  </script>
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
        <TextInput placeholder="string" label="application identifier" bind:value={appCounter.appid} />
        <TextInput placeholder="regex" label="match application command" bind:value={appCounter.processregex} />
        <TextInput type="number" placeholder="maximum number of minutes allowed by the configuration" label="total minutes allowed" bind:value={appCounter.allowedMinutes} />
        <TextInput type="number" placeholder="the number of minutes recorded today" label="total recorded today"  bind:value={appCounter.usedMinutes} />
    </Group>
    <slot></slot>
    <Button fullSize variant="outline" compact ripple size="sm" on:click={e => change()}>reset</Button>
  </Card>