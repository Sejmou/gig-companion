<script lang="ts">
	import { currentSong } from '$lib/client/stores/ableton/derived/songs';
	import { songSounds } from '$lib/client/stores/ableton/derived/sounds';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import type { GroupTrackState, MidiOrAudioTrackState } from '$lib/client/stores/ableton/track';
	import Sound from './Sound.svelte';

	let currentAudioTracks: MidiOrAudioTrackState[] = [];
	let currentGroupTrack: GroupTrackState | undefined = undefined;
	let tracksFromOtherSongs: (GroupTrackState | MidiOrAudioTrackState)[] = [];

	function useSound(sound: MidiOrAudioTrackState) {
		sound.armed.set(true);
		sound.monitoringState.set('in');
		const otherSounds = currentAudioTracks.filter((track) => track !== sound);
		for (const other of otherSounds) {
			other.armed.set(false);
			other.monitoringState.set('auto');
		}
	}

	const currentSongUnsubscriber = currentSong.subscribe((newSong) => {
		const allSoundsMap = get(songSounds);
		console.log(allSoundsMap);
		const currentSounds = newSong ? allSoundsMap.get(newSong.name) : undefined;
		const allSounds = Array.from(allSoundsMap.values());
		const soundsForOthers = allSounds.filter((sounds) => sounds !== currentSounds);
		currentAudioTracks = currentSounds?.audioTracks ?? [];
		currentGroupTrack = currentSounds?.groupTrack;

		// mute/deactivate/reset other tracks
		tracksFromOtherSongs = soundsForOthers.flatMap((sounds) => [
			sounds.groupTrack,
			...sounds.audioTracks
		]);
		tracksFromOtherSongs.forEach((track) => {
			if (track.type === 'midiOrAudio') {
				track.armed.set(false);
				track.monitoringState.set('auto');
			} else if (track.type === 'group') {
				track.muted.set(true);
			}
		});

		// activate current tracks
		currentGroupTrack?.muted.set(false);
		if (currentAudioTracks[0]) useSound(currentAudioTracks[0]);
	});
	onDestroy(() => {
		currentSongUnsubscriber();
	});

	$: console.log({
		audioTracks: currentAudioTracks,
		groupTrack: currentGroupTrack,
		tracksFromOtherSongs
	});
</script>

{#if currentGroupTrack && currentAudioTracks}
	<div class="flex flex-col w-full">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
			{#each currentAudioTracks as track}
				<div class="w-full border rounded-lg p-1 pl-4">
					<Sound {track} onUse={useSound} />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>No sounds available</p>
{/if}
