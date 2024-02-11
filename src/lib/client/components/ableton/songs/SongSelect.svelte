<script lang="ts">
	import { songs } from '$lib/client/stores/ableton/derived/songs';

	function handleSelectChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const songName = select.value;
		const song = $songs.find((song) => song.name === songName);
		if (song) {
			console.log('Selecting song', song.name);
			song.start.jump();
		}
		song?.start.jump();
	}
</script>

<label class="form-control w-full max-w-xs">
	<div class="label">
		<span class="label-text">Song</span>
	</div>
	<select on:change={handleSelectChange} class="select select-bordered">
		<option disabled selected>Pick one</option>
		{#each $songs as song}
			<option value={song.name}>{song.name}</option>
		{/each}
	</select>
</label>
