<script>
  import { Button, Stack } from '@svelteuidev/core';
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
  function shutdown(){
        dispatch("shutdownrequest", {});
  }
  function abortShutdown(){
        dispatch("shutdownabort", {});
  }
</script>

<!--Stack override={{ width: 300 }} >
    <Button on:click={e => shutdown()}>shutdown computer</Button>
    <Button on:click={e => abortShutdown()}>abort shutdown</Button>
</Stack-->