<script lang="ts">
	import { time } from '$lib/client/stores/ableton/set';

	function formatTime(time: number) {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

<div>
	<h5>Time</h5>
	<span>{formatTime($time)}</span>
</div>
