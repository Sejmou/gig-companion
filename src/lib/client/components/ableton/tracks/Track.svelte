<script lang="ts">
	import { getTrackState } from '$lib/client/stores/ableton/track';

	export let id: string;
	export let level = 0;

	let track = getTrackState(id);

	setInterval(() => {
		track = getTrackState(id);
	}, 1000);

	$: childIds = track?.type === 'group' ? track.childIds : null;
</script>

{#if track}
	<div
		tabindex="0"
		class="collapse border border-base-700 bg-base-100"
		class:collapse-arrow={!!childIds}
		on:click={(ev) => ev.stopPropagation()}
	>
		<input type="checkbox" />
		<div class="collapse-title text-xl font-medium">{track.name}</div>
		{#if childIds}
			<div class="collapse-content">
				{#each childIds as id}
					<svelte:self {id} level={level + 1} />
				{/each}
			</div>
		{/if}
	</div>
{/if}
