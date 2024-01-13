<script lang="ts">
	import PlayButton from '$lib/client/components/ableton/set/PlayButton.svelte';
	import TempoDisplay from '$lib/client/components/ableton/set/TempoDisplay.svelte';
	import TimeDisplay from '$lib/client/components/ableton/set/TimeDisplay.svelte';
	import Tracks from '$lib/client/components/ableton/tracks/Tracks.svelte';
</script>

<svelte:head>
	<title>Gig Companion</title>
</svelte:head>

<main class="flex flex-col items-center w-full gap-2 max-w-screen-lg mx-auto">
	<div class="flex gap-4">
		<TimeDisplay />
		<PlayButton />
		<TempoDisplay />
	</div>
</main>
