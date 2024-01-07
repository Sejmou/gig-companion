<script lang="ts">
	import { rootTracks } from '$lib/client/stores/ableton/tracks';
	import Track from './Track.svelte';
</script>

{#each $rootTracks as track}
	<Track {track} />
{/each}
