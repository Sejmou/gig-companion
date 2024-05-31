<script lang="ts">
	import { useFirstSound, useSound } from '$lib/client/actions/song';
	import { currentSongSounds } from '$lib/client/stores/ableton/derived/sounds';
	import { onDestroy } from 'svelte';
	import Sound from './Sound.svelte';

	const soundsUnsub = currentSongSounds.subscribe(() => {
		useFirstSound();
	});

	onDestroy(() => {
		soundsUnsub();
	});
</script>

{#if $currentSongSounds}
	<div class="flex flex-col w-full">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
			{#each $currentSongSounds.audioTracks as track}
				<div class="w-full border rounded-lg p-1 pl-4">
					<Sound {track} onUse={useSound} />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>No sounds available</p>
{/if}
