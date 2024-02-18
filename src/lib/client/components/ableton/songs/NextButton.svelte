<script lang="ts">
	import 'iconify-icon';
	import { nextSong } from '$lib/client/stores/ableton/derived/songs';
	$: jumpToNextSong = $nextSong?.start.jump;
</script>

<button
	class="btn btn-accent"
	disabled={!nextSong}
	on:click={() => {
		jumpToNextSong?.();
	}}
>
	<iconify-icon icon="mdi:skip-next" width="24" height="24"></iconify-icon>
</button>
