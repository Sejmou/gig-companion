<script lang="ts">
	import type { SongSection } from '$lib/client/stores/ableton/derived/songs';
	import Section from './Section.svelte';
	export let sections: SongSection[];
</script>

<ul class="flex flex-col gap-2">
	{#each sections as section}
		<Section {section} />
	{/each}
</ul>
