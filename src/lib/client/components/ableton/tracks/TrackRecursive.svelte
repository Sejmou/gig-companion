<!-- 
	A recursive component that renders a track and its children (if it's a group track).
 -->
<script lang="ts">
	import { getMidiOrAudioTrackState, getGroupTrackState } from '$lib/client/stores/ableton/track';
	import 'iconify-icon';
	import GroupTrack from './GroupTrack.svelte';
	import MidiOrAudioTrack from './MidiOrAudioTrack.svelte';

	export let id: string;
	export let level = 0;
	let track = getMidiOrAudioTrackState(id) || getGroupTrackState(id);
	$: childIds = track?.type === 'group' ? track.childIds : null;
</script>

{#if track}
	<div class="w-full border rounded-xl border-base-700 bg-base-100 p-4">
		{#if track.type === 'group'}
			<GroupTrack {track} />
		{:else if track.type === 'midiOrAudio'}
			<MidiOrAudioTrack {track} />
		{/if}
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
