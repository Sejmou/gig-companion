<script lang="ts">
	import { writable, get } from 'svelte/store';
	// TODO: use currentTime and duration from current song store
	const currentTime = writable(0);
	const duration = writable(260);

	const progressBarTime = writable(0);

	// called every time user moves slider
	function handleSliderInput(event: Event) {
		// console.log('handleSliderInput', event);
		progressBarTime.set((event.target as HTMLInputElement).valueAsNumber);
	}

	// called once user releases slider
	function handleSliderChange(event: Event) {
		console.log('handleSliderChange', event);
		setTimeout(() => {
			progressBarTime.set(get(currentTime));
		}, 1000);
	}

	function formatTime(time: number) {
		return `${Math.floor(time / 60)}:${Math.floor(time % 60)
			.toString()
			.padStart(2, '0')}`;
	}
</script>

<div class="w-full">
	<input
		type="range"
		id="progress"
		min="0"
		max={$duration}
		step="0.1"
		bind:value={$progressBarTime}
		on:input={handleSliderInput}
		on:change={handleSliderChange}
		class="w-full mt-1"
	/>
	<div class="mt-[-4px] mb-1">
		{#if $progressBarTime !== undefined}
			{#if $duration}
				<div class="w-full flex justify-between">
					<div class="text-xs text-gray-500">
						{formatTime($progressBarTime)}
					</div>
					<div class="text-xs text-gray-500">
						{Math.floor($duration / 60)}:
						{Math.floor($duration % 60)
							.toString()
							.padStart(2, '0')}
					</div>
				</div>
			{/if}
		{:else}
			<div class="text-xs text-gray-500">--:--</div>
		{/if}
	</div>
</div>
