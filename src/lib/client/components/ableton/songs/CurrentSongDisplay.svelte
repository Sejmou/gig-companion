<script lang="ts">
	import { cn } from '$lib/client/components/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { songs, currentSong } from '$lib/client/stores/ableton/derived/songs';

	songs.subscribe((val) => {
		console.log('songs', val);
	});

	$: songName = $currentSong?.name;
	$: console.log('songName', songName);

	type $$Props = HTMLAttributes<HTMLDivElement>;

	// class is a reserved keyword in JS, so we need to rename it
	let className: $$Props['class'] = undefined;
	export { className as class };

	// TODO: implement and import currentSong store
</script>

<div class={cn('flex flex-col text-center', className)} {...$$restProps}>
	<h6>Current Song</h6>
	<h2>{songName}</h2>
</div>
