<!-- 
	Component to display a MidiOrAudioTrackState. Compared to the Track component, this one has an additional button to arm the track for recording.
 -->
<script lang="ts">
	import 'iconify-icon';
	import type { MidiOrAudioTrackState } from '$lib/client/stores/ableton/track';
	export let track: MidiOrAudioTrackState;
	export let hideArmButton = false;
	$: muted = track.muted;
	$: soloed = track.soloed;
	$: armed = track.armed;
	$: monitoringState = track.monitoringState;

	const monitoringStates: ('in' | 'auto' | 'off')[] = ['in', 'auto', 'off'];
	function handleMonitoringModeSelect(event: Event) {
		const select = event.target as HTMLSelectElement;
		const value = select.value as 'in' | 'auto' | 'off';
		track.monitoringState.set(value);
	}
</script>

<div class="w-full flex flex-wrap gap-2 justify-between items-center">
	{track.name}
	<div class="flex gap-2">
		<select
			value={$monitoringState}
			on:change={handleMonitoringModeSelect}
			class="select select-bordered"
		>
			{#each monitoringStates as state}
				<option value={state} selected={state === $monitoringState}>{state}</option>
			{/each}
		</select>
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
		{#if !hideArmButton}
			<button class="btn" class:btn-error={$armed} on:click={() => track.armed.set(!$armed)}>
				<iconify-icon icon="mdi:record" />
			</button>
		{/if}
	</div>
</div>
