<script lang="ts">
	import SongPlayback from './SongPlayback.svelte';
	import TimeDisplay from '$lib/client/components/ableton/set/TimeDisplay.svelte';
</script>

<svelte:head>
	<title>Gig Companion</title>
</svelte:head>

<main class="flex-1 flex flex-col items-center justify-center w-full gap-2 max-w-screen-lg mx-auto">
	<SongPlayback />
	<TimeDisplay />
</main>
