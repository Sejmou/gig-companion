<script lang="ts">
	import { backingTracks } from '$lib/client/stores/ableton/derived/backing-tracks';
	import MidiOrAudioTrack from '$lib/client/components/ableton/tracks/MidiOrAudioTrack.svelte';
	$: groupTrack = $backingTracks?.groupTrack;
	$: audioTracks = $backingTracks?.audioTracks;
</script>

{#if groupTrack && audioTracks}
	<div class="flex flex-col w-full">
		<h3>Backing Tracks</h3>
		<div class="flex flex-col gap-2">
			{#each audioTracks as track}
				<MidiOrAudioTrack {track} />
			{/each}
		</div>
	</div>
{/if}
