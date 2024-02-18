<script lang="ts">
	import { currentSong } from '$lib/client/stores/ableton/derived/songs';
	import { songSounds, type SongSounds } from '$lib/client/stores/ableton/derived/sounds';
	import { get } from 'svelte/store';
	import MidiOrAudioTrack from '$lib/client/components/ableton/tracks/MidiOrAudioTrack.svelte';

	let currentSongSounds: SongSounds | undefined = undefined;
	let otherSounds = [];
	currentSong.subscribe((newSong) => {
		const sounds = get(songSounds);
		currentSongSounds = newSong ? sounds.get(newSong.name) : undefined;
		const allSongSounds = Array.from(sounds.values());
		otherSounds = allSongSounds.filter((sounds) => sounds !== currentSongSounds);
		console.log({ currentSongSounds, otherSounds });
	});
	$: groupTrack = currentSongSounds ? currentSongSounds.groupTrack : undefined;
	$: audioTracks = currentSongSounds ? currentSongSounds.audioTracks : undefined;
	$: console.log({ groupTrack, audioTracks });
</script>

{#if groupTrack && audioTracks}
	<div class="flex flex-col w-full">
		<h3>Sounds</h3>
		<div class="flex flex-col gap-2">
			{#each audioTracks as track}
				<MidiOrAudioTrack {track} />
			{/each}
		</div>
	</div>
{:else}
	<p>No sounds available</p>
{/if}
