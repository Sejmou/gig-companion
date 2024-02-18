<!-- 
	A recursive component that renders a track and its children (if it's a group track).

	This track doesn't handle MidiOrAudioTracks or GroupTracks differently (apart from rendering the children for group tracks),
	hence additional MidiOrAudioTrack controls are NOT available if the track is a MidiOrAudioTrack.
 -->
<script lang="ts">
	import { getTrackState } from '$lib/client/stores/ableton/track';
	import 'iconify-icon';

	export let id: string;
	export let level = 0;

	let track = getTrackState(id);

	setInterval(() => {
		track = getTrackState(id);
	}, 1000);

	$: childIds = track?.type === 'group' ? track.childIds : null;
	$: muted = track?.muted;
	$: soloed = track?.soloed;
</script>

{#if track}
	<div class="w-full border rounded-xl border-base-700 bg-base-100 p-4">
		<div class="w-full flex justify-between items-center">
			<h3>{track.name}</h3>
			<div class="flex gap-2">
				<button class="btn" class:btn-warning={!$muted} on:click={() => track?.muted.set(!$muted)}>
					{#if $muted}
						<iconify-icon icon="mdi:volume-off" />
					{:else}
						<iconify-icon icon="mdi:volume-high" />
					{/if}
				</button>
				<button
					class="btn min-w-[48px] text-center"
					class:btn-info={$soloed}
					on:click={() => track?.soloed.set(!$soloed)}
				>
					S
				</button>
			</div>
		</div>
		{#if childIds}
			<div
				tabindex="0"
				class="collapse collapse-arrow border border-base-700 bg-base-100 mt-4"
				on:click={(ev) => ev.stopPropagation()}
			>
				<input type="checkbox" />
				<div class="collapse-title text-xl font-medium">Child Tracks</div>
				<div class="collapse-content">
					{#each childIds as id}
						<svelte:self {id} level={level + 1} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
