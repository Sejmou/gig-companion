<script lang="ts">
	import 'iconify-icon';
	import { prevSong } from '$lib/client/stores/ableton/derived/songs';

	$: jumpToPrevSong = $prevSong?.start.jump;
</script>

<button
	class="btn btn-accent"
	disabled={!prevSong}
	on:click={() => {
		jumpToPrevSong?.();
	}}
>
	<iconify-icon icon="mdi:skip-previous" width="24" height="24"></iconify-icon>
</button>
