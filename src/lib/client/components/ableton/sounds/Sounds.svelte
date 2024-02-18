<script lang="ts">
	import { currentSong } from '$lib/client/stores/ableton/derived/songs';
	import { songSounds } from '$lib/client/stores/ableton/derived/sounds';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import type { GroupTrackState, MidiOrAudioTrackState } from '$lib/client/stores/ableton/track';
	import Sound from './Sound.svelte';

	let tracksForSounds: MidiOrAudioTrackState[] = [];
	let groupTrack: GroupTrackState | undefined = undefined;
	let tracksFromOtherSongs: (GroupTrackState | MidiOrAudioTrackState)[] = [];

	function useSound(sound: MidiOrAudioTrackState) {
		sound.armed.set(true);
		sound.monitoringState.set('in');
		const otherSounds = tracksForSounds.filter((track) => track !== sound);
		for (const other of otherSounds) {
			other.armed.set(false);
			other.monitoringState.set('auto');
		}
	}

	const currentSongUnsubscriber = currentSong.subscribe((newSong) => {
		const sounds = get(songSounds);
		const current = newSong ? sounds.get(newSong.name) : undefined;
		const all = Array.from(sounds.values());
		const other = all.filter((sounds) => sounds !== current);
		tracksForSounds = current?.audioTracks ?? [];
		groupTrack = current?.groupTrack;
		tracksFromOtherSongs = other.flatMap((sounds) => [sounds.groupTrack, ...sounds.audioTracks]);
	});
	onDestroy(() => {
		currentSongUnsubscriber();
	});

	$: console.log({ audioTracks: tracksForSounds, groupTrack, tracksFromOtherSongs });
</script>

{#if groupTrack && tracksForSounds}
	<div class="flex flex-col w-full">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
			{#each tracksForSounds as track}
				<div class="w-full border rounded-lg p-1 pl-4">
					<Sound {track} onUse={useSound} />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>No sounds available</p>
{/if}
