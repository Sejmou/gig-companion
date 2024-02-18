<script lang="ts">
	import { currentSong } from '$lib/client/stores/ableton/derived/songs';
	import { songSounds } from '$lib/client/stores/ableton/derived/sounds';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import MidiOrAudioTrack from '$lib/client/components/ableton/tracks/MidiOrAudioTrack.svelte';
	import type { GroupTrackState, MidiOrAudioTrackState } from '$lib/client/stores/ableton/track';

	let audioTracks: MidiOrAudioTrackState[] = [];
	let groupTrack: GroupTrackState | undefined = undefined;
	let tracksFromOtherSongs: (GroupTrackState | MidiOrAudioTrackState)[] = [];

	const unsubscribe = currentSong.subscribe((newSong) => {
		const sounds = get(songSounds);
		const current = newSong ? sounds.get(newSong.name) : undefined;
		const all = Array.from(sounds.values());
		const other = all.filter((sounds) => sounds !== current);
		audioTracks = current?.audioTracks ?? [];
		groupTrack = current?.groupTrack;
		tracksFromOtherSongs = other.flatMap((sounds) => [sounds.groupTrack, ...sounds.audioTracks]);
	});
	onDestroy(unsubscribe);

	$: console.log({ audioTracks, groupTrack, tracksFromOtherSongs });
</script>

{#if groupTrack && audioTracks}
	<div class="flex flex-col w-full">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
			{#each audioTracks as track}
				<div class="w-full border rounded-lg p-1 pl-4">
					<MidiOrAudioTrack {track} />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>No sounds available</p>
{/if}
