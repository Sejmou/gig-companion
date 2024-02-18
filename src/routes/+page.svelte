<script lang="ts">
	import Sounds from '$lib/client/components/ableton/sounds/Sounds.svelte';
	import SongPlayback from './SongPlayback.svelte';
	// import TimeDisplay from '$lib/client/components/ableton/set/TimeDisplay.svelte';
</script>

<svelte:head>
	<title>Gig Companion</title>
</svelte:head>

<main class="flex-1 flex flex-col items-center justify-center w-full gap-2 max-w-screen-lg mx-auto">
	<SongPlayback />
	<!-- TODO: comment out once I figure out how to display actual time in seconds -->
	<!-- <TimeDisplay /> -->
	<Sounds />
</main>
