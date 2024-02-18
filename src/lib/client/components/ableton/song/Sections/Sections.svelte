<script lang="ts">
	import { currentSongSections } from '$lib/client/stores/ableton/derived/song-sections';
	import Section from './Section.svelte';
</script>

<ul class="flex flex-col gap-2">
	{#each $currentSongSections as section}
		<Section {section} />
	{/each}
</ul>
