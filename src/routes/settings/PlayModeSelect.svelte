<script lang="ts">
	import { playMode, playModes } from '$lib/ableton/client/stores/set';

	function handleSelect(event: any) {
		playMode.set(event.target.value);
	}
</script>

<select class="select select-bordered w-full max-w-xs" on:change={handleSelect}>
	{#each playModes as mode}
		<option value={mode.value}>{mode.label}</option>
	{/each}
</select>
