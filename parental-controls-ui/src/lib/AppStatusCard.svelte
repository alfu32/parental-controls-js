<script lang="ts">
    import { Button,TextInput,Card,Group,Text,Image,Badge,SimpleGrid } from '@svelteuidev/core';
    import type { ConfigurationRecord } from '../../../src/classes';
    export let configurationRecord: ConfigurationRecord;
    export let reference: ConfigurationRecord = configurationRecord.copy();

  </script>
<!--Card p="lg" padding='lg' withBorder={configurationRecord.isOn} radius="lg" shadow={configurationRecord.isOn?"lg":"sm"} class="appcard" style={configurationRecord.isOn?"border:1px solid #333;":"border:1px solid #ddd;"}>
    <Card.Section padding='lg' style="margin:1px;">
      <Text size="lg">Application {configurationRecord.appid}</Text>
      {#if configurationRecord.isOn}
        <Badge color='green' variant='light'>Is On</Badge>
        {:else}
        <Badge color='red' variant='light'>Is Off</Badge>
      {/if}
    </Card.Section>
      <Group position='apart'-->
          <div><strong>Application</strong> : <small>{reference.appid}</small></div>
          <div><strong>contains</strong> : <small>{reference.processregex}</small></div>
          <div><strong>Allowed Minutes</strong> : <small>{reference.allowedMinutes}</small></div>
          <div><strong>Used Minutes</strong> : <small>{reference.usedMinutes}</small></div>
          <slot></slot>
      <!--/Group>
  </Card-->