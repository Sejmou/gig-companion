<script lang="ts">
	import type { Track } from '$lib/types/ableton/track/state';

	export let track: Track;
</script>

<div class="flex flex-col">
	<h5>{track.name}</h5>
	{#if track.type === 'group'}
		{#each track.children as childTrack}
			<svelte:self track={childTrack} />
		{/each}
	{/if}
</div>
