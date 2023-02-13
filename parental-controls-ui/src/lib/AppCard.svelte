<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import type { ConfigurationRecord } from '../../../src/classes';
    export let configurationRecord: ConfigurationRecord;
    export let reference: ConfigurationRecord = configurationRecord.copy();
    export let disabled:true|null = null;

  </script>
<Card p="lg" padding='lg' withBorder={configurationRecord.isOn} radius="lg" shadow={configurationRecord.isOn?"lg":"sm"} class="appcard" style={configurationRecord.isOn?"border:1px solid #333;":"border:1px solid #ddd;"}>
    <Card.Section padding='lg' style="margin:1px;">
      <Text size="lg">Application {configurationRecord.appid}</Text>
      {#if configurationRecord.isOn}
        <Badge color='green' variant='light'>Is On</Badge>
        {:else}
        <Badge color='red' variant='light'>Is Off</Badge>
      {/if}
    </Card.Section>
  
    <Group position='apart'>
        <TextInput {disabled} placeholder="string" label="application identifier" bind:value={configurationRecord.appid} />
        <small>{reference.appid}</small>
        <TextInput {disabled} placeholder="regex" label="match application command" bind:value={configurationRecord.processregex} />
        <small>{reference.processregex}</small>
        <TextInput {disabled} type="number" placeholder="maximum number of minutes allowed by the configuration" label="total minutes allowed" bind:value={configurationRecord.allowedMinutes} />
        <small>{reference.allowedMinutes}</small>
        <TextInput {disabled} type="number" placeholder="the number of minutes recorded today" label="total recorded today"  bind:value={configurationRecord.usedMinutes} />
        <small>{reference.usedMinutes}</small>
    </Group>
    <slot></slot>
  </Card>