<script lang="ts">
	import { loopStart, loopEnd } from '$lib/client/stores/ableton/set';
	import { currentSongSections } from '$lib/client/stores/ableton/derived/song-sections';

	const handleLoopStartChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		const sectionName = target.value;
		const section = $currentSongSections.find((section) => section.name === sectionName);
		if (section) {
			console.log('setting loop start to start of ', section.name);
			loopStart.set(section.start.time);
		}
	};

	const handleLoopEndChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		const sectionName = target.value;
		const section = $currentSongSections.find((section) => section.name === sectionName);
		if (section) {
			console.log('setting loop end to start of ', section.name);
			loopEnd.set(section.start.time);
		}
	};
</script>

<div class="flex flex-col md:flex-row w-full gap-2">
	<label class="form-control w-full max-w-xs">
		<div class="label">
			<span class="label-text">Loop Start</span>
		</div>
		<select on:change={handleLoopStartChange} class="select select-bordered">
			<option value={null}>Custom</option>
			{#each $currentSongSections as song}
				<option value={song.name}>{song.name}</option>
			{/each}
		</select>
	</label>
	<label class="form-control w-full max-w-xs">
		<div class="label">
			<span class="label-text">Loop End</span>
		</div>
		<select on:change={handleLoopEndChange} class="select select-bordered">
			<option value={null}>Custom</option>
			{#each $currentSongSections as song}
				<option disabled={song.start.time <= $loopStart} value={song.name}>{song.name}</option>
			{/each}
		</select>
	</label>
</div>
