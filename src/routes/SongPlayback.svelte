<script lang="ts">
	import CurrentSongDisplay from '$lib/client/components/ableton/songs/CurrentSongDisplay.svelte';
	import SongProgressSlider from '$lib/client/components/ableton/songs/SongProgressSlider.svelte';
	import PlayButton from '$lib/client/components/ableton/set/PlayButton.svelte';
	import NextButton from '$lib/client/components/ableton/songs/NextButton.svelte';
	import PrevButton from '$lib/client/components/ableton/songs/PrevButton.svelte';
	import RepeatButton from '$lib/client/components/ableton/songs/RepeatButton.svelte';
</script>

<div class="w-full flex flex-col items-center">
	<CurrentSongDisplay class="mb-2" />

	<div class="flex gap-4">
		<!-- quick fix to make sure play button stays in the middle: invisible button! -->
		<!-- TODO: consider implementing an actual shuffle button -->
		<button class="btn opacity-0 cursor-default">
			<iconify-icon icon="mdi:shuffle" width="24" height="24"></iconify-icon>
		</button>
		<PrevButton />
		<PlayButton />
		<NextButton />
		<RepeatButton />
	</div>
	<SongProgressSlider />
</div>
