<script lang="ts">
	import { backingTracks } from '$lib/client/stores/ableton/derived/backing-tracks';
	import MidiOrAudioTrack from '../tracks/MidiOrAudioTrack.svelte';
	$: groupTrack = $backingTracks?.groupTrack;
	$: audioTracks = $backingTracks?.audioTracks;
</script>

{#if groupTrack && audioTracks}
	<div class="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
		{#each audioTracks as track}
			<div class="w-full border rounded-lg p-1 pl-4">
				<MidiOrAudioTrack {track} hideArmButton />
			</div>
		{/each}
	</div>
{/if}
