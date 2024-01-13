<script lang="ts">
	import { timeMs } from '$lib/client/stores/ableton/set';
	// import { duration } from '$lib/client/stores/ableton/derived/set';

	/**
	 * Returns a formatted time string from a time in milliseconds
	 * @param timeMs
	 *
	 * @returns {string} Formatted time string for minutes and seconds (e.g. 1:23)
	 */
	function formatTime(timeMs: number) {
		const minutes = Math.floor(timeMs / 60000);
		const seconds = ((timeMs % 60000) / 1000).toFixed(0);
		return `${minutes}:${seconds.padStart(2, '0')}`;
	}
</script>

<div class="text-center">
	<h5>Set Time</h5>
	<span>
		{formatTime($timeMs)}
		<!-- {#if $duration}
			{formatTime($timeMs)} / {formatTime($duration)} ({Math.floor(
				($timeMs / $duration) * 100
			).toFixed(2)}%)
		{:else}
			{formatTime($timeMs)}
		{/if} -->
	</span>
</div>
