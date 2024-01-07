<script lang="ts">
	import { tracks } from '$lib/client/stores/ableton/tracks';
</script>

{#each $tracks as track}
	<div class="flex flex-col">
		<h5>{track.name}</h5>
	</div>
{/each}
