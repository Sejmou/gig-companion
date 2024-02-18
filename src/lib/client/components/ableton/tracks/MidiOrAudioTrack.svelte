<!-- 
	Component to display a MidiOrAudioTrackState. Compared to the Track component, this one has an additional button to arm the track for recording.
 -->
<script lang="ts">
	import 'iconify-icon';
	import type { MidiOrAudioTrackState } from '$lib/client/stores/ableton/track';
	export let track: MidiOrAudioTrackState;
	$: muted = track.muted;
	$: soloed = track.soloed;
	$: armed = track.armed;
</script>

<div class="w-full flex justify-between items-center">
	{track.name}
	<div class="flex gap-2">
		<button class="btn" class:btn-error={$armed} on:click={() => track.armed.set(!$armed)}>
			<iconify-icon icon="mdi:record" />
		</button>
		<button class="btn" class:btn-warning={!$muted} on:click={() => track.muted.set(!$muted)}>
			{#if $muted}
				<iconify-icon icon="mdi:volume-off" />
			{:else}
				<iconify-icon icon="mdi:volume-high" />
			{/if}
		</button>
		<button
			class="btn min-w-[48px] text-center"
			class:btn-info={$soloed}
			on:click={() => track.soloed.set(!$soloed)}
		>
			S
		</button>
	</div>
</div>
