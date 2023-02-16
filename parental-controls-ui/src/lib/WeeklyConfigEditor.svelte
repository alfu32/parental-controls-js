<script lang="ts">
    import type { Config } from "../../../src/classes";


export let config:Config|null=null
    const days="Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",")
    import { createEventDispatcher } from "svelte";
    import { TextInput,Button } from "@svelteuidev/core";
    const dispatch = createEventDispatcher();
    function change(index) {
        dispatch("save", config);
    }
</script>
<pre>{config}</pre>
    <tr>
        <th>Weekday</th>
        <th>Time Start</th>
        <th>Time End</th>
        <th>Max Allowed</th>
        <th></th>
        <th></th>
    </tr>
    <tr>
        <td></td>
        <td>time in millitary format<br/>( 0930 instead of 09:30 )</td>
        <td>time in millitary format<br/>( 0930 instead of 09:30 )</td>
        <td>maximum number of minutes<br/>allowed by the configuration</td>
        <td></td>
        <td></td>
    </tr>
{#if config }
    {#each config.dailyLimits as  conf,index }
    <tr>
        <th>{days[index]}</th>
        <td class="row" id="startHourMinute">
            <TextInput bind:value={conf.startHourMinute} />
        </td>
        <td class="row" id="endHourMinute">
            <TextInput bind:value={conf.endHourMinute} />
        </td>
        <td class="row" id="totalAllowed">
            <TextInput bind:value={conf.totalAllowed} />
        </td>
        <td><Button compact ripple size="sm" on:click={e => change(index)}>save</Button></td>
        <td><Button compact ripple size="sm" variant="outline" on:click={e => change(index)}>reset</Button></td>
    </tr>
    {/each}
{:else}
    <div>loading counter data</div>
{/if}