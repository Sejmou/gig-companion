<script lang="ts">
	import { playing, time, bpm, connected } from '$lib/ableton/client/stores/set';
	function formatTime(time: number) {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>Gig Companion</title>
</svelte:head>

<main class="relative flex flex-col items-center w-full gap-2 max-w-screen-lg mx-auto">
	<p>{$connected ? 'Connected' : 'Not connected'} to Live Set</p>
	<div class="flex gap-4">
		<div>
			<h5>Time</h5>
			<span>{formatTime($time)}</span>
		</div>
		<button
			class="btn btn-accent"
			on:click={() => {
				playing.set(!$playing);
			}}
		>
			{#if $playing}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 3l14 9-14 9V3z"
					/>
				</svg>
			{/if}
		</button>
		<div class="flex flex-col">
			<h5>Tempo</h5>
			<span>{$bpm.toFixed(1)} BPM</span>
		</div>
	</div>
</main>
