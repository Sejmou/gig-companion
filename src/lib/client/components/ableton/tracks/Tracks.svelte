<script lang="ts">
	import { rootTracks } from '$lib/client/stores/ableton/tracks';
	import Track from './TrackRecursive.svelte';
</script>

{#each $rootTracks as track}
	<Track id={track.id} />
{/each}
