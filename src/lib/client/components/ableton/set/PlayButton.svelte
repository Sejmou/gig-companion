<script lang="ts">
	import { playing } from '$lib/client/stores/ableton/set';
	import 'iconify-icon';
</script>

<button
	class="btn btn-accent"
	on:click={() => {
		playing.set(!$playing);
	}}
>
	{#if $playing}
		<iconify-icon icon="mdi:pause" width="24" height="24"></iconify-icon>
	{:else}
		<iconify-icon icon="mdi:play" width="24" height="24"></iconify-icon>
	{/if}
</button>
