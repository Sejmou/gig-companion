<script lang="ts">
	import type { SongSection } from '$lib/client/stores/ableton/derived/songs';
	import { loopStart, loopEnd, playing, timeBeats } from '$lib/client/stores/ableton/set';
	import 'iconify-icon';
	export let section: SongSection;
	$: name = section.name;
	$: start = section.start;
	$: end = section.end;
	$: progress = Math.min(($timeBeats - start.time) / (end.time - start.time), 1);
</script>

<li class="flex items-center justify-between pt-2">
	<div class="flex w-full items-center space-x-4">
		<div class="relative flex-shrink-0">
			<button
				on:click={() => {
					start.jump();
					if (!$playing) playing.set(true);
				}}
			>
				<iconify-icon icon="mdi-play-circle" width="24" height="24" class="w-6 h-6 text-primary" />
			</button>
		</div>
		<div class="flex flex-row w-full justify-between">
			<p class="font-medium">{name}</p>
			{#if progress > 0}
				<progress class="w-[200px]" value={progress} max="1" />
			{/if}
		</div>
	</div>
</li>
