<script lang="ts">
	import { cn } from '$lib/client/components/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { songs } from '$lib/client/stores/ableton/derived/songs';

	songs.subscribe((val) => {
		console.log('songs', val);
	});

	type $$Props = HTMLAttributes<HTMLDivElement>;

	// class is a reserved keyword in JS, so we need to rename it
	let className: $$Props['class'] = undefined;
	export { className as class };

	// TODO: implement and import currentSong store
</script>

<div class={cn('flex flex-col text-center', className)} {...$$restProps}>
	<h6>Current Song</h6>
	<h2>The Biggest Banger Ever</h2>
</div>
