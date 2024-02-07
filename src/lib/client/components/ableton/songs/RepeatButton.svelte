<script lang="ts">
	// TODO: implement and import nextTrack function
	import 'iconify-icon';
	import { loopEnabled } from '$lib/client/stores/ableton/set';
</script>

<button
	class="btn"
	class:btn-accent={$loopEnabled}
	on:click={() => {
		loopEnabled.update((v) => !v);
	}}
>
	<iconify-icon icon="mdi:repeat" width="24" height="24"></iconify-icon>
</button>
