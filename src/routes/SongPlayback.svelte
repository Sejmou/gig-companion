<script lang="ts">
	import CurrentSongDisplay from '$lib/client/components/ableton/songs/CurrentSongDisplay.svelte';
	import SongProgressSlider from '$lib/client/components/ableton/songs/SongProgressSlider.svelte';
	import PlayButton from '$lib/client/components/ableton/set/PlayButton.svelte';
	import NextButton from '$lib/client/components/ableton/songs/NextButton.svelte';
	import PrevButton from '$lib/client/components/ableton/songs/PrevButton.svelte';
</script>

<div class="w-full flex flex-col items-center">
	<CurrentSongDisplay class="mb-2" />

	<div class="flex gap-4">
		<PrevButton />
		<PlayButton />
		<NextButton />
	</div>
	<SongProgressSlider />
</div>
