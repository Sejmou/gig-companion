<script lang="ts">
	import { playMode, playModes } from '$lib/client/stores/ableton/set';

	function handleSelect(event: any) {
		playMode.set(event.target.value);
	}
</script>

<label class="form-control w-full max-w-xs">
	<div class="label">
		<span class="label-text">Play button behavior</span>
	</div>
	<select class="select select-bordered w-full max-w-xs" on:change={handleSelect}>
		{#each playModes as mode}
			<option value={mode.value}>{mode.label}</option>
		{/each}
	</select>
</label>
