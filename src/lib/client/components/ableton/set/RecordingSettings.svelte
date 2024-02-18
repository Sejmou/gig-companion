<script lang="ts">
	import { countInDuration } from '$lib/client/stores/ableton/set';
	const durations = [0, 1, 2, 4];

	const handleChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		countInDuration.set(parseInt(target.value) as 0 | 1 | 2 | 4);
	};
</script>

<label class="form-control w-full max-w-xs">
	<div class="label">
		<span class="label-text">count-in duration (bars)</span>
	</div>
	<!-- atm, AbletonJS crashes when trying to set the count-in duration -->
	<select disabled value={$countInDuration} on:change={handleChange} class="select select-bordered">
		{#each durations as bars}
			<option value={bars}>{bars}{bars === 1 ? ' bar' : ' bars'}</option>
		{/each}
	</select>
</label>
